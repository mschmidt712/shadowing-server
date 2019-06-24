const AWS = require('aws-sdk');
const zipcodes = require('zipcodes');
const distance = require('google-distance-matrix');
const formatZipCodes = require('./formatZipCodes').formatZipCodes;

exports.handler = (event, context, callback) => {
  let response = {};
  let approvedQuery;

  if (event.approved == 'true' || event.approved == 'false' && event.approved !== '') {
    approvedQuery = event.approved === 'true' ? true : false;
  } else {
    approvedQuery = undefined;
  }
  const zipCodeQuery = event.zipCode !== '' ? event.zipCode : undefined;
  const distanceQuery = event.distance !== '' ? Number(event.distance) : undefined;
  const specialtyQuery = event.specialty;
  const availabilityQuery = event.availability ? JSON.parse(decodeURIComponent(event.availability)) : undefined;

  if (zipCodeQuery && !distanceQuery || distanceQuery && !zipCodeQuery) {
    response = {
      statusCode: 400,
      body: 'Both a zip code and distance radius is required to locate doctors by area.'
    };

    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  let params = {
    TableName: 'doctors'
  };
  let items = [];


  if (typeof approvedQuery === 'boolean' && !zipCodeQuery && !distanceQuery) {   // Get All Approved Doctors
    params = Object.assign(params, {
      FilterExpression: 'approved = :approved_bool',
      ExpressionAttributeValues: {
        ':approved_bool': approvedQuery
      },
    });

    items = dynamodb.scan(params).promise().then(data => data.Items);
  } else if (zipCodeQuery && distanceQuery) { // Get Doctors by Zip Code and Radius
    const zipCodes = formatZipCodes(zipcodes.radius(zipCodeQuery, distanceQuery));
    params = Object.assign(params, {
      ScanFilter: {
        'zipCode': {
          ComparisonOperator: 'IN',
          AttributeValueList: zipCodes
        }
      }
    });

    if (specialtyQuery) { // Get Doctors by Zip Code and Radius - Filter by Specialty
      paramsScanFilter = Object.assign(params.ScanFilter, {
        'specialty': {
          ComparisonOperator: 'EQ',
          AttributeValueList: [specialtyQuery]
        }
      });
      params.ScanFilter = paramsScanFilter;
    }

    items = dynamodb.scan(params).promise().then(data => {
      return data.Items;
    });

    if (approvedQuery !== undefined) { // Get Doctors by Zip Code and Radius - Filter by Approved
      items = items.then(itemsArray => {
        return itemsArray.filter(obj => {
          return obj.approved == approvedQuery;
        });
      })
    }
    if (availabilityQuery && Object.keys(availabilityQuery).length > 0) { // Get Doctors by Zip Code and Radius - Filter by Availability
      const requestedDays = Object.keys(availabilityQuery);
      items = items.then(itemsArray => {
        return itemsArray.filter(doctor => {
          return requestedDays.reduce((bool, day) => {
            if (doctor.scheduling[day] || bool) {
              bool = true;
              return bool;
            }
            return false;
          }, false);
        });
      });
    }
  } else { // Get All Doctors
    items = dynamodb.scan(params).promise().then(data => data.Items);
  }

  items.then(data => {
    if (!data.length) {
      response = {
        statusCode: 404,
        body: 'No doctors found matching your search criteria'
      };

      callback(JSON.stringify(response));
    }

    const availableDoctors = data.filter(doctor => { // Remove Doctors Who Have Reached Their Max Weekly Requests
      return doctor.weeklyRequests < doctor.maxRequests;
    })

    // Add Distance Parameter Between Student and Doctors
    const destinations = availableDoctors.map(doctor => `${doctor.address.streetAddress} ${doctor.address.city}, ${doctor.address.state} ${doctor.address.zipCode}`);
    const origins = [zipCodeQuery];
    distance.key('AIzaSyBV0ERwNWnf4cLICe7TozgRJG6jNM5aL9Q');
    distance.mode('driving');

    distance.matrix(origins, destinations, function (err, distances) {
      if (err) {
        response = {
          statusCode: 500,
          body: 'Error calculating distances to doctors.'
        };

        callback(JSON.stringify(response));
      }
      if (distances.status == 'OK') {
        const distanceValues = distances.rows[0].elements.map(el => el);
        const doctorsWithLocation = availableDoctors.map((doctor, index) => {
          return Object.assign({}, doctor, {
            distance: distanceValues[index]
          });
        });

        response = {
          statusCode: 200,
          body: JSON.stringify(doctorsWithLocation)
        };
        callback(null, response);
      } else {
        response = {
          statusCode: 500,
          body: 'Error calculating distances to doctors.'
        };
        callback(response);
      }
    });
  }).catch(err => {
    response = {
      statusCode: 500,
      body: `Internal Server Error: ${err.message}`
    };

    callback(JSON.stringify(response));
  });
};
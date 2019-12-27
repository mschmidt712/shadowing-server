const AWS = require('aws-sdk');
const zipcodes = require('zipcodes');
const distance = require('google-distance-matrix');
const formatZipCodes = require('./formatZipCodes').formatZipCodes;

exports.handler = (event, context, callback) => {
  let response = {};
  let approvedQuery;
  let activeQuery;

  if (event.approved == 'true' || event.approved == 'false' && event.approved !== '') {
    approvedQuery = event.approved === 'true' ? true : false;
  } else {
    approvedQuery = undefined;
  }

  if (event.active == 'true' || event.active == 'false' && event.active !== '') {
    activeQuery = event.active === 'true' ? true : false;
  } else {
    activeQuery = undefined;
  }

  const careerQuery = event.career !== '' ? event.career : undefined;
  const zipCodeQuery = event.zipCode !== '' ? event.zipCode : undefined;
  const distanceQuery = event.distance !== '' ? Number(event.distance) : undefined;
  const specialtyQuery = event.specialty;
  const availabilityQuery = event.availability ? JSON.parse(decodeURIComponent(event.availability)) : undefined;

  if (zipCodeQuery && !distanceQuery || distanceQuery && !zipCodeQuery) {
    response = {
      statusCode: 400,
      body: 'Both a zip code and distance radius is required to locate professionals by area.'
    };

    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  let params = {
    TableName: 'doctors'
  };
  let items = [];


  if (typeof approvedQuery === 'boolean' && !zipCodeQuery && !distanceQuery) {   // Get All Approved Professionals
    params = Object.assign(params, {
      FilterExpression: 'approved = :approved_bool',
      ExpressionAttributeValues: {
        ':approved_bool': approvedQuery
      },
    });

    items = dynamodb.scan(params).promise().then(data => data.Items);
  } else if (zipCodeQuery && distanceQuery) { // Get Career by Zip Code and Radius
    const zipCodes = formatZipCodes(zipcodes.radius(zipCodeQuery, distanceQuery));

    if (zipCodes.length === 0) {
      response = {
        statusCode: 400,
        body: 'No zip codes found matching your query. Please try your search again with a different zip code.'
      }

      callback(JSON.stringify(response));
    }

    params = Object.assign(params, {
      ScanFilter: {
        'zipCode': {
          ComparisonOperator: 'IN',
          AttributeValueList: zipCodes
        },
        'career': {
          ComparisonOperator: 'EQ',
          AttributeValueList: [careerQuery]
        }
      }
    });

    if (specialtyQuery) { // Get Career by Zip Code and Radius - Filter by Specialty
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

    if (approvedQuery !== undefined) { // Get Career by Zip Code and Radius - Filter by Approved
      items = items.then(itemsArray => {
        return itemsArray.filter(obj => {
          return obj.approved == approvedQuery;
        });
      })
    }
    if (availabilityQuery && Object.keys(availabilityQuery).length > 0) { // Get Career by Zip Code and Radius - Filter by Availability
      const requestedDays = Object.keys(availabilityQuery);
      items = items.then(itemsArray => {
        return itemsArray.filter(professional => {
          return requestedDays.reduce((bool, day) => {
            if (professional.scheduling[day] || bool) {
              bool = true;
              return bool;
            }
            return false;
          }, false);
        });
      });
    }
  } else { // Get All Professionals
    items = dynamodb.scan(params).promise().then(data => data.Items);
  }

  items.then(data => {
    if (!data.length) {
      response = {
        statusCode: 404,
        body: 'No professionals found matching your search criteria'
      };

      callback(JSON.stringify(response));
    }

    if (zipCodeQuery) {
      return new Promise((resolve, reject) => {
        // Add Distance Parameter Between Student and Professional
        const destinations = data.map(professional => `${professional.address.streetAddress} ${professional.address.city}, ${professional.address.state} ${professional.address.zipCode}`);
        const origins = [zipCodeQuery];
        distance.key('AIzaSyBV0ERwNWnf4cLICe7TozgRJG6jNM5aL9Q');
        distance.mode('driving');

        distance.matrix(origins, destinations, function (err, distances) {
          if (err) {
            reject('Error calculating distances to professionals.');
          }

          if (distances.status == 'OK') {
            const distanceValues = distances.rows[0].elements.map(el => el);
            resolve(data.map((professionals, index) => {
              return Object.assign({}, professionals, {
                distance: distanceValues[index]
              });
            }));
          } else {
            reject('Error calculating distances to professionalss.');
          }
        });
      });
    } else {
      return new Promise(resolve => resolve(data));
    }
  }).then(resp => {
    let data = resp;
    if (activeQuery) {
      data = resp.filter(item => {
        return item.active === activeQuery;
      });
    }
    response = {
      statusCode: 200,
      body: JSON.stringify(data)
    };
    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: `Internal Server Error: ${err.message}`
    };

    callback(JSON.stringify(response));
  });
};

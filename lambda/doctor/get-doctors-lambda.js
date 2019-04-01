const AWS = require('aws-sdk');
const zipcodes = require('zipcodes');
const formatZipCodes = require('./formatZipCodes').formatZipCodes;

exports.handler = (event, context, callback) => {

  let response = {};
  if (event.approved == true || event.approved == false) {
    approvedQuery = event.approved
  } else {
    approvedQuery = undefined;
  }
  const zipCodeQuery = event.zipCode ? event.zipCode : undefined;
  const distanceQuery = event.distance ? event.distance : undefined;

  if (zipCodeQuery && !distanceQuery || distanceQuery && !zipCodeQuery) {
    response = {
      statusCode: 400, 
      body: JSON.stringify('Both a zip code and distance radius is required to locate doctors by area.')
    };

    callback(response);
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  let params = {
    TableName: "doctors"
   };
  let items = [];

  if (approvedQuery !== undefined && !zipCodeQuery && !distanceQuery) {
    params = Object.assign(params, {
      FilterExpression: 'approved = :approved_bool',
      ExpressionAttributeValues: {
        ':approved_bool': approvedQuery
      },
    });

    items = dynamodb.scan(params).promise().then(data => data.Items);
  } else if (zipCodeQuery && distanceQuery) {
    const zipCodes = zipcodes.radius(zipCodeQuery, distanceQuery);
    params = Object.assign(params, {
      ScanFilter : {
        zipCode: {
          ComparisonOperator: 'IN',
          AttributeValueList: formatZipCodes(zipCodes)
        }
      }
    });

    items = dynamodb.scan(params).promise().then(data => data.Items);
    
    if (approvedQuery !== undefined) {
      items = items.then(itemsArray => {
        return itemsArray.filter(obj => {
          return obj.approved == approvedQuery;
        });
      })
    }
  } else {
    items = dynamodb.scan(params).promise().then(data => data.Items);
  }

  items.then(data => {
    if (!data.length) {
      response = {
        statusCode: 404,
        body: JSON.stringify('No doctors found matching your search criteria')
      };

      callback(response);
    }
    response = {
      statusCode: 200,
      body: JSON.stringify(data)
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500, 
      body: JSON.stringify(err)
    };

    callback(response);
  });
};
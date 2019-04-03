const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  let response;
  const uuid = event.uuid;

  if (!uuid) {
    response = {
      statusCode: 400, 
      body: JSON.stringify('An ID is required to fetch a unique request')
    }
    callback(response);
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  var params = {
    Key: {
     "uuid": uuid
    }, 
    TableName: "requests"
   };

  dynamodb.get(params).promise().then(data => {
    if (!data.Item) {
      response = {
        statusCode: 404,
        body: JSON.stringify('No request found with the provided uuid')
      };
      callback(response);
    }

    response = {
      statusCode: 200,
      body: JSON.stringify(data.Item)
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
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  let response;
  const uuid = event.uuid;

  if (!uuid) {
    response = {
      statusCode: 400,
      body: 'An ID is required to delete a unique request'
    }
    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  var params = {
    Key: {
      "uuid": uuid
    },
    TableName: "requests"
  };

  dynamodb.delete(params).promise().then(data => {
    response = {
      statusCode: 204
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
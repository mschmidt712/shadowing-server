const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  let response;
  const params = {
    TableName: 'admin',
    Key: {
      'id': 'ddf14b27-5950-4f49-a1b3-f0d94a0679ca'
    }
   };

  dynamodb.get(params).promise().then(data => {
    response = {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: err
    };

    callback(JSON.stringify(response));
  });
};
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const studentId = event.id;
  let response;

  if (!studentId) {
    response = {
      statusCode: 400,
      body: 'An ID is required to fetch a student profile'
    }
    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  var params = {
    Key: {
      "id": studentId
    },
    TableName: "students"
  };

  dynamodb.get(params).promise().then(data => {
    if (!data.Item) {
      response = {
        statusCode: 404,
        body: 'No student found with given ID. Please try your request again.'
      };

      callback(JSON.stringify(response));
    }

    response = {
      statusCode: 200,
      body: JSON.stringify(data.Item)
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
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  let response;
  const studentEmail = event.email;
  if (!studentEmail) {
    response = {
      statusCode: 400, 
      body: 'An email is required to delete a student profile'
    }
    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  var params = {
    Key: {
     'email': studentEmail,
    }, 
    TableName: 'students'
   };

  dynamodb.delete(params).promise().then(resp => {
    response = {
      statusCode: 204
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
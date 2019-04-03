const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const studentEmail = event.email;
  let response; 

  if (!studentEmail) {
    response = {
      statusCode: 400, 
      body: JSON.stringify('An email is required to fetch a student profile')
    }
    callback(response);
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  var params = {
    Key: {
     "email": studentEmail
    }, 
    TableName: "students"
   };

  dynamodb.get(params).promise().then(data => {
    if (!data.Item) {
      response = {
        statusCode: 404,
        body: 'No student found with given student email. Please try your request again.'
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
      body: err
    };

    callback(JSON.stringify(response));
  });
};
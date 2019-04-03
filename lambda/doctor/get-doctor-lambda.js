const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  let response;
  const doctorEmail = event.email;

  if (!doctorEmail) {
    response = {
      statusCode: 400, 
      body: 'An email is required to fetch a doctor profile'
    }

    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  var params = {
    Key: {
     "email": doctorEmail
    }, 
    TableName: "doctors"
   };

  dynamodb.get(params).promise().then(data => {
    if (!data.Item) {
      response = {
        statusCode: 404,
        body: 'No doctor found with given doctor email. Please try your request again.'
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
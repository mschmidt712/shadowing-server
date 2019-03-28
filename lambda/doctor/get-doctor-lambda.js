const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const doctorEmail = event.email;

  if (!doctorEmail) {
    response = {
      statusCode: 400, 
      body: JSON.stringify('An email is required to fetch a doctor profile')
    }

    callback(response);
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  var params = {
    Key: {
     "email": doctorEmail
    }, 
    TableName: "doctors"
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
      body: JSON.stringify(err)
    };

    callback(response);
  });
};
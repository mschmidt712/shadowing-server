const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const doctorId = event.id;
  let response;
  if (!doctorId) {
    response = {
      statusCode: 400,
      body: 'An ID is required to delete a doctor profile'
    }

    callback(JSON.stringify(response));
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  var params = {
    Key: {
      'id': doctorId,
    },
    TableName: 'doctors'
  };

  dynamodb.delete(params).promise().then(resp => {
    response = {
      statusCode: 204
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: `Internal Service Error: ${err.message}`
    };

    callback(JSON.stringify(response));
  });
};
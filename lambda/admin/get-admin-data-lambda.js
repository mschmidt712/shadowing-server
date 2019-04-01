const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  let reponse;
  const params = {
    TableName: "Admin",
    Key: {
        'id': 1
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
      body: JSON.stringify(err)
    };

    callback(response);
  });
};

const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  const doctorParams = {
    TableName: "doctors",
   };
  let adminParams = {
    TableName: "Admin",
    Key: {
      id: 1,
    }
  };

  dynamodb.scan(doctorParams).promise()
  .then(data => {
    return data.Count;
  }).then(count => {
    adminParams = Object.assign({}, adminParams, {
      UpdateExpression: 'SET #doctors = :count, #updateDate = :time',
      ExpressionAttributeNames: {
        '#doctors' : 'doctors',
        '#updateDate': 'updateDate'
      },
      ExpressionAttributeValues: {
        ':count': count,
        ':time': new Date().toISOString()
      }
    });

    return dynamodb.update(adminParams).promise();
  }).then(data => {
    callback(null, 'Doctor count successfully updated');
  })
  .catch(err => {
    callback(err);
  });
};

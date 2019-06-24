const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

  const scanParams = {
    TableName: 'doctors',
    FilterExpression: 'weeklyRequests > :zero',
    ExpressionAttributeValues: { ':zero': 0 }
  };

  dynamodb.scan(scanParams).promise().then(data => {
    const doctors = data.Items.map(obj => {
      return obj.id;
    });

    let updateParams;
    const updatePromises = doctors.map(id => {
      updateParams = {
        TableName: 'doctors',
        Key: {
          id
        },
        ReturnValues: 'ALL_NEW',
        UpdateExpression: 'SET #weeklyRequests = :val',
        ExpressionAttributeNames: {
          '#weeklyRequests': 'weeklyRequests'
        },
        ExpressionAttributeValues: {
          ':val': 0
        }
      };

      return dynamodb.update(updateParams).promise();
    });

    return Promise.all(updatePromises);
  }).then(resp => {
    callback(null, resp);
  }).catch(err => {
    callback(err);
  });
};
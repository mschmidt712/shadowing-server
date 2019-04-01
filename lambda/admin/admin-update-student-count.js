const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  const studentParams = {
    TableName: "students",
   };
  let adminParams = {
    TableName: "Admin",
    Key: {
      id: 1,
    }
  };

  dynamodb.scan(studentParams).promise()
  .then(data => {
    return data.Count;
  }).then(count => {
    adminParams = Object.assign({}, adminParams, {
      UpdateExpression: 'SET #students = :count, #updateDate = :time',
      ExpressionAttributeNames: {
        '#students' : 'students',
        '#updateDate': 'updateDate'
      },
      ExpressionAttributeValues: {
        ':count': count,
        ':time': new Date().toISOString()
      }
    });

    return dynamodb.update(adminParams).promise();
  }).then(data => {
    callback(null, 'Student count successfully updated');
  })
  .catch(err => {
    callback(err);
  });
};

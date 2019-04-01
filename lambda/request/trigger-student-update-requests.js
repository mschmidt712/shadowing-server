const AWS = require('aws-sdk');
const formatObject = require('./formatDynamoObjects').formatObject;

exports.handler = (event, context, callback) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
    
    event.Records.forEach((record) => {
        if (record.eventName == 'INSERT') {
            const newItem = formatObject(record.dynamodb.NewImage, {});
            
            const student = newItem.student;
            const requestUuid = newItem.uuid;
            
            const params = {
                TableName: 'students',
                Key: {
                    email: student
                },
                ReturnValues: 'ALL_NEW',
                UpdateExpression: 'SET #requests = list_append(if_not_exists(#requests, :empty_list), :requestUuid)',
                ExpressionAttributeNames: {
                    '#requests': 'requests'
                },
                ExpressionAttributeValues: {
                    ':empty_list': [],
                    ':requestUuid': [requestUuid]
                }
            };
            
            dynamodb.update(params).promise().then(data => {                
                callback(null, JSON.stringify(data.Attributes));
            }).catch(err => {
                callback(err);
            });
        } else if (record.eventName == 'REMOVE') {
            const oldItem = formatObject(record.dynamodb.OldImage, {});
            
            let student = oldItem.student;
            const requestUuid = oldItem.uuid;
            
            const getParams = {
                TableName: 'students',
                Key: {
                    email: student
                }
            };
            
            dynamodb.get(getParams).promise().then(data => {
                student = data.Item;
                let uuidIndex;
                
                student.requests.forEach((uuid, index) => {
                    if (uuid == requestUuid) {
                        uuidIndex = index;
                    }
                });
                
                if (uuidIndex == undefined) {
                    callback(`Request does not exist in students's profile.`)
                }

                const updateParams = {
                    TableName: 'students',
                    Key: {
                        email: student.email
                    },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: `REMOVE requests[${uuidIndex}]`
                };
                return dynamodb.update(updateParams).promise();
            }).then(data => {
                callback(null, JSON.stringify(data.Attributes));
            }).catch(err => {
                callback(err);
            });
        }
    });
};
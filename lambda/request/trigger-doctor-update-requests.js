
const AWS = require('aws-sdk');
const formatObject = require('./formatDynamoObjects').formatObject;

exports.handler = (event, context, callback) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
    
    event.Records.forEach((record) => {
        if (record.eventName == 'INSERT') {
            const newItem = formatObject(record.dynamodb.NewImage, {});
            
            const doctor = newItem.doctor;
            const requestUuid = newItem.uuid;
            
            const params = {
                TableName: 'doctors',
                Key: {
                    email: doctor
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
            
            let doctor = oldItem.doctor;
            const requestUuid = oldItem.uuid;
            
            const getParams = {
                TableName: 'doctors',
                Key: {
                    email: doctor
                }
            };
            
            dynamodb.get(getParams).promise().then(data => {
                doctor = data.Item;
                let uuidIndex;
                
                doctor.requests.forEach((uuid, index) => {
                    if (uuid == requestUuid) {
                        uuidIndex = index;
                    }
                });

                if (uuidIndex == undefined) {
                    callback(`Request does not exist in doctor's profile.`)
                }
                
                const updateParams = {
                    TableName: 'doctors',
                    Key: {
                        email: doctor.email
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
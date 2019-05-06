const AWS = require('aws-sdk');
const formatObject = require('./formatDynamoObjects').formatObject;

exports.handler = (event, context, callback) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    event.Records.forEach((record) => {
        if (record.eventName == 'INSERT') {
            const newItem = formatObject(record.dynamodb.NewImage, {});

            const requestUuid = newItem.uuid;

            const student = newItem.student;
            const studentParams = {
                TableName: 'students',
                Key: {
                    id: student
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

            const doctor = newItem.doctor;
            const doctorParams = {
                TableName: 'doctors',
                Key: {
                    id: doctor
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

            let studentData, doctorData;
            dynamodb.update(studentParams).promise().then(data => {
                studentData = JSON.stringify(data.Attributes);

                return dynamodb.update(doctorParams).promise();
            }).then(data => {
                doctorData = JSON.stringify(data.Attributes);

                callback(null, {
                    student: studentData,
                    doctor: doctorData
                });
            }).catch(err => {
                callback(err);
            });
        } else if (record.eventName == 'REMOVE') {
            const oldItem = formatObject(record.dynamodb.OldImage, {});

            let student = oldItem.student;
            let doctor = oldItem.doctor;
            const requestUuid = oldItem.uuid;

            const getStudentParams = {
                TableName: 'students',
                Key: {
                    id: student
                }
            };
            const getDoctorParams = {
                TableName: 'doctors',
                Key: {
                    id: doctor
                }
            };

            let studentData, doctorData;
            dynamodb.get(getStudentParams).promise().then(data => {
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

                const updateStudentParams = {
                    TableName: 'students',
                    Key: {
                        id: student.id
                    },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: `REMOVE requests[${uuidIndex}]`
                };
                return dynamodb.update(updateStudentParams).promise();
            }).then(data => {
                studentData = JSON.stringify(data.Attributes);

                return dynamodb.get(getDoctorParams).promise()
            }).then(data => {
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

                const updateDoctorParams = {
                    TableName: 'doctors',
                    Key: {
                        id: doctor.id
                    },
                    ReturnValues: 'ALL_NEW',
                    UpdateExpression: `REMOVE requests[${uuidIndex}]`
                };
                return dynamodb.update(updateDoctorParams).promise();
            }).then(data => {
                doctorData = JSON.stringify(data.Attributes);

                callback(null, {
                    student: studentData,
                    doctor: doctorData
                });
            }).catch(err => {
                callback(err);
            });
        }
    });
};
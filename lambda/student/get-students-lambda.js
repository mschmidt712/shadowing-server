const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
    let response;

    const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    var params = {
        TableName: "students"
    };

    dynamodb.scan(params).promise().then(data => {
        if (!data.Item) {
            response = {
                statusCode: 404,
                body: 'No students found.'
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
            body: `Internal Server Error: ${err.message}`
        };

        callback(JSON.stringify(response));
    });
};
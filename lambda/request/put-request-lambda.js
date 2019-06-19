const AWS = require('aws-sdk');
const joi = require('joi');
const requestSchema = require('./request-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let request = event.request;
  const validatedInput = joi.validate(request, requestSchema.schema, {
    stripUnknown: true
  }).catch(err => {
    response = {
      statusCode: 400,
      body: `${err.name}: ${err.details[0].message}`
    }

    callback(JSON.stringify(response));
  });

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  let params;
  let validatedRequest;

  validatedInput.then(validatedResp => {
    validatedRequest = validatedResp;
    params = {
      TableName: 'requests',
      Key: {
        uuid: validatedRequest.uuid
      }
    }

    return dynamodb.get(params).promise();
  }).then(results => {
    if (!results.Item) {
      response = {
        statusCode: 404,
        body: 'Request does not exist in the database'
      };
      callback(JSON.stringify(response));
    }

    params = {
      TableName: 'requests',
      Item: validatedRequest
    };
    return dynamodb.put(params).promise();
  }).then(() => {
    response = {
      statusCode: 200,
      body: JSON.stringify(validatedRequest)
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
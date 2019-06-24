const AWS = require('aws-sdk');
const joi = require('joi');
const uuidv1 = require('uuid/v1');
const moment = require('moment');
const requestSchema = require('./request-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let request = event.request;
  const validatedInput = joi.validate(request, requestSchema.schema, {
    stripUnknown: true
  })
    .then(value => {
      value.createdDate = new Date().toISOString();
      value.uuid = uuidv1();
      value.ttl = moment().add(60, 'days').toDate().getTime();
      value.status = 'pending';
      return value;
    })
    .catch(err => {
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
      FilterExpression: 'student = :studentId and doctor = :doctorId',
      ExpressionAttributeValues: {
        ':studentId': validatedRequest.student,
        ':doctorId': validatedRequest.doctor
      },
    }

    return dynamodb.scan(params).promise();
  }).then(results => {
    if (results.Items.length !== 0) {
      const requestDate = moment(results.Items[0].createdDate).format('l');
      const ttl = moment(results.Items[0].createdDate).add(60, 'days').format('l');
      response = {
        statusCode: 400,
        body: `Student requested shadowing with this doctor on ${requestDate} and is not able to request shadowing again until ${ttl}`
      };

      callback(JSON.stringify(response));
    } else {
      params = {
        TableName: 'students',
        Key: {
          id: validatedRequest.student
        }
      }
      return dynamodb.get(params).promise();
    }
  }).then(results => {
    if (!results.Item) {
      response = {
        statusCode: 400,
        body: 'Student does not exist in the database'
      };
      callback(JSON.stringify(response));
    } else {
      params = {
        TableName: 'doctors',
        Key: {
          id: validatedRequest.doctor
        }
      };
      return dynamodb.get(params).promise();
    }
  }).then(results => {
    if (!results.Item) {
      response = {
        statusCode: 400,
        body: 'Doctor does not exist in the database'
      };
      callback(JSON.stringify(response));
    } else {
      params = {
        TableName: 'requests',
        Item: validatedRequest
      };
      return dynamodb.put(params).promise();
    }
  }).then(() => {
    response = {
      statusCode: 201,
      body: JSON.stringify(`Request between ${validatedRequest.student} and ${validatedRequest.doctor} successfully created.`)
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
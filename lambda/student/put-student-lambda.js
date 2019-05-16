const AWS = require('aws-sdk');
const joi = require('joi');
const studentSchema = require('./student-schema.js');
const validateUserAddress = require('./validateUserAddress').validateUserAddress;

exports.handler = (event, context, callback) => {
  let response;
  let student = event.student;
  const validatedInput = joi.validate(student, studentSchema.schema, {
    stripUnknown: true
  })
    .then(value => validateUserAddress(value))
    .catch(err => {
      if (err.isJoi) {
        response = {
          statusCode: 400,
          body: `${err.name}: ${err.details[0].message}`
        }
      } else {
        response = {
          statusCode: 400,
          body: err.message
        }
      }
      callback(JSON.stringify(response));
    });

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  let params;

  validatedInput.then(validatedStudent => {
    student = validatedStudent;

    params = {
      TableName: 'students',
      Key: {
        id: validatedStudent.id
      }
    }
    return dynamodb.get(params).promise();
  }).then(results => {
    if (!results || Object.keys(results).length === 0) {
      response = {
        statusCode: 400,
        body: 'User does not exist in the database'
      };
      callback(JSON.stringify(response));
    }

    params = {
      TableName: 'students',
      Item: student,
      ReturnValues: 'ALL_OLD'
    };
    return dynamodb.put(params).promise();
  }).then(resp => {
    response = {
      statusCode: 200,
      body: JSON.stringify(student)
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
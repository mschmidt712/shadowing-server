const AWS = require('aws-sdk');
const joi = require('joi');
const studentSchema = require('./student-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let student = event.student;
  const validatedInput = joi.validate(student, studentSchema.schema, {
      stripUnknown: true
    })
    .then(value => value)
    .catch(err => {
      response = {
        statusCode: 400, 
        body: JSON.stringify(err)
      }

      callback(response);
    });

  const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
  let params;

  validatedInput.then(validatedStudent => {
    student = validatedStudent;

    params = {
      TableName : 'students',
      Key: {
        email: validatedStudent.email
      }
    }
      return dynamodb.get(params).promise();
  }).then(results => {
    if (!results) {
      response = {
        statusCode: 400, 
        body: JSON.stringify('User does not exist in the database')
      };

      callback(response);
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
      body: JSON.stringify(resp.Attributes)
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500, 
      body: JSON.stringify(err)
    };

    callback(response);
  });
};
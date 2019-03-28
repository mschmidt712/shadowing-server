const AWS = require('aws-sdk');
const joi = require('joi');
const studentSchema = require('./student-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let student = event.student;
  const validatedInput = joi.validate(student, studentSchema.schema, {
      stripUnknown: true
    })
    .then(value => {
      value.createdDate = new Date().toISOString();
      return value;
    })
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
        email: student.email
      }
    }
      return dynamodb.get(params).promise();
  }).then(results => {
    if (results.Item) {
      response = {
        statusCode: 400, 
        body: JSON.stringify('User already exists in the database')
      };

      callback(response);
    }

    params = {
      TableName: 'students',
      Item: student
    };
    return dynamodb.put(params).promise();
  }).then(() => {
    response = {
      statusCode: 201,
      body: JSON.stringify(`User ${student.email} successfully created.`)
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
const AWS = require('aws-sdk');
const joi = require('joi');
const doctorSchema = require('./doctor-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let doctor = event.doctor;
  const validatedInput = joi.validate(doctor, doctorSchema.schema, {
    stripUnknown: true
  })
    .then(value => {
      value.createdDate = new Date().toISOString();
      return value;
    })
    .catch(err => {
      response = {
        statusCode: 400,
        body: err
      }

      callback(JSON.stringify(response));
    });

  const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
  let params;

  validatedInput.then(validatedDoctor => {
    doctor = validatedDoctor;
    params = {
      TableName: 'doctors',
      Key: {
        id: doctor.id
      }
    }
    return dynamodb.get(params).promise();
  }).then(results => {
    if (results.Item) {
      response = {
        statusCode: 400,
        body: 'User already exists in the database'
      };

      callback(JSON.stringify(response));
    }

    params = {
      TableName: 'doctors',
      Item: doctor
    };
    return dynamodb.put(params).promise();
  }).then(() => {
    response = {
      statusCode: 201,
      body: JSON.stringify(`User ${doctor.email} successfully created.`)
    };

    callback(null, response);
  }).catch(err => {
    response = {
      statusCode: 500,
      body: err
    };

    callback(JSON.stringify(response));
  });
};
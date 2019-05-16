const AWS = require('aws-sdk');
const joi = require('joi');
const doctorSchema = require('./doctor-schema.js');
const validateUserAddress = require('./validateUserAddress').validateUserAddress;

exports.handler = (event, context, callback) => {
  let response;
  let doctor = event.doctor;
  const validatedInput = joi.validate(doctor, doctorSchema.schema, {
    stripUnknown: true
  }).then(value => validateUserAddress(value))
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

  validatedInput.then(validatedDoctor => {
    doctor = Object.assign({}, validatedDoctor, {
      zipCode: validatedDoctor.address.zipCode
    });

    params = {
      TableName: 'doctors',
      Key: {
        id: doctor.id
      }
    }
    return dynamodb.get(params).promise();
  }).then(results => {
    if (!results) {
      response = {
        statusCode: 400,
        body: 'User does not exist in the database'
      };

      callback(JSON.stringify(response));
    }

    params = {
      TableName: 'doctors',
      Item: doctor,
      ReturnValues: 'ALL_OLD'
    };
    return dynamodb.put(params).promise();
  }).then(resp => {
    response = {
      statusCode: 200,
      body: JSON.stringify(doctor)
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
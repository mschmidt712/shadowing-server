const AWS = require('aws-sdk');
const joi = require('joi');
const doctorSchema = require('./doctor-schema.js');

exports.handler = (event, context, callback) => {
  let response;
  let doctor = event.doctor;
  const validatedInput = joi.validate(doctor, doctorSchema.schema, {
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

  validatedInput.then(validatedDoctor => {
    doctor = validatedDoctor;

    params = {
      TableName : 'doctors',
      Key: {
        email: doctor.email
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
      body: JSON.stringify(err)
    };
    
    callback(response);
  });
};
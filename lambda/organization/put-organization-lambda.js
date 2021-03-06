const AWS = require('aws-sdk');
const joi = require('joi');
const orgSchema = require('./organization-schema.js');
const formatOrganizationValue = require('./format-organization-value');

exports.handler = (event, context, callback) => {
  let response;
  let organization = Object.assign({}, event.organization, {
    value: formatOrganizationValue(event.organization)
  });

  const validatedInput = joi.validate(organization, orgSchema.schema, {
    stripUnknown: true
  }).catch(err => {
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

  validatedInput.then(validatedOrg => {
    organization = validatedOrg;

    params = {
      TableName: 'organizations',
      Key: {
        value: organization.value
      }
    }
    return dynamodb.get(params).promise();
  }).then(results => {
    if (!results || Object.keys(results).length === 0) {
      response = {
        statusCode: 400,
        body: 'Organization does not exist in the database'
      };
      callback(JSON.stringify(response));
    }

    organization = Object.assign({}, results.Item, organization);
    params = {
      TableName: 'organizations',
      Item: organization,
      ReturnValues: 'ALL_OLD'
    };
    return dynamodb.put(params).promise();
  }).then(() => {
    response = {
      statusCode: 200,
      body: JSON.stringify(organization)
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
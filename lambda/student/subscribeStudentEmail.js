const fetch = require('node-fetch');

exports.subscribeStudentEmail = function (email, name) {
  const api_key_name = 'ConvertKit_API_Key';

  return this.getSecret('ConvertKit_API_Key').then(resp => {
    const api_key = resp[api_key_name];
    const formId = '314904';
    const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe?api_key=${api_key}`;
    data = {
      api_key,
      email,
      first_name: name
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }).then(function (resp) {
    return resp.json();
  }).then(respData => {
    console.log(respData);
  }).catch(err => {
    throw err;
  });
}
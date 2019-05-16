const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;

exports.validateUserAddress = function validateUserAddress(obj) {
  const address = obj.address;

  const url = 'http://production.shippingapis.com/ShippingAPITest.dll?API=Verify&XML=' +
    '<AddressValidateRequest USERID="010MEDED7565"><Address ID="0"><Address1></Address1>' +
    '<Address2>' + address.streetAddress + '</Address2><City>' + address.city + '</City><State>' + address.state + '</State>' +
    '<Zip5>' + address.zip + '</Zip5><Zip4></Zip4></Address></AddressValidateRequest>';

  return fetch(url, {
    method: "GET"
  }).then(resp => {
    return resp.text()
  }).then(resp => {
    return new Promise(resolve => {
      parseString(resp, function (err, result) {
        const verifiedAddress = result.AddressValidateResponse.Address[0];

        if (verifiedAddress.Error) {
          throw new Error(`Address Verification Error: ${verifiedAddress.Error[0].Description[0]}`);
        }

        return resolve(Object.assign({}, obj, {
          address: {
            streetAddress: formatCaps(verifiedAddress.Address2[0]),
            city: formatCaps(verifiedAddress.City[0]),
            state: verifiedAddress.State[0],
            zipCode: verifiedAddress.Zip5[0]
          }
        }));
      })
    });
  });
}

function formatCaps(str) {
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ').trim();
}
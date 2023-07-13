import crypto from 'crypto'
import XMLHttpRequest from 'xhr2';

// credentials
const authenticate_id = 'c030e074db781c4ace8846bbf0710c73';
const authenticate_pw = '2637775a925ea43246d18a224455da1e';
const secret_key = '646de05a987ae0.04175699';

function array_implode_with_keys(array) {
  let returnStr = '';
  if (Object.keys(array).length > 0) {
      Object.entries(array).forEach(([key, value]) => {
          returnStr += key + '||' + value + '__';
      });
      returnStr = returnStr.slice(0, returnStr.length - 2);
  }
  return returnStr;
}

function encryptCardInfo(array_params) {
  var key = secret_key.replace(/[^A-Za-z0-9 ]/g, '').substring(0,16);
  const plainText = array_implode_with_keys(array_params);
  
  var _key = Buffer.from(key, 'utf-8')
  if (_key.length < 32) {
    const paddedKey = new Uint8Array(32);
    paddedKey.set(_key, 0);
    _key = paddedKey;
  }
  
  const iv = crypto.randomBytes(16).toString('hex').substring(0,16);
  const cipher = crypto.createCipheriv('AES-256-CBC', _key, iv);

  let encrypted = cipher.update(plainText, 'utf-8', 'base64') + cipher.final('base64');
  return Buffer.from(encrypted + '::' + iv).toString('base64');
}

function calculateSignature(params) {
  let signature = "";
  Object.keys(params).sort().forEach(function(key) {
      if (key !== "signature") {
          signature += params[key];
      }
  });
  signature += secret_key;
  signature = crypto.createHash('sha1').update(signature).digest('hex')
  return signature.toLowerCase()
}


// Encrypt data
export function encryptData(data) {

  var array_params = {
    "ccn": '4111111111111111',
    "expire": '12/24',
    "cvc": '123',
    "firstname": 'John',
    "lastname": 'Doe'
  };
  
  var card_info = encryptCardInfo(array_params)

  var payment = {
    'authenticate_id': authenticate_id,
    'authenticate_pw': authenticate_pw,
    'orderid': Date.now(),
    'transaction_type': 'A',
    'amount': '1.00',
    'currency': 'USD',
    'card_info': card_info,
    'email': 'jhonsmith.t@gmail.com',
    'street': '1506 Gorman Drive',
    'city': 'Carmichael',
    'zip': '95608',
    'state': 'CA',
    'country': 'USA',
    'phone': '3205471250',
    // 'transaction_hash':'', // Optional
    'customerip': '127.0.0.1',
    'dob': '1995-01-01',
    'success_url':encodeURIComponent('https://gw-testing.paymentechnologies.co.uk/ptv2_dev_server_test/success.php'),
    'fail_url':encodeURIComponent('https://gw-testing.paymentechnologies.co.uk/ptv2_dev_server_test/success.php'),
    'notify_url':encodeURIComponent('https://gw-testing.paymentechnologies.co.uk/ptv2_dev_server_test/success.php')
  }
  

  // add the signature to list
  var signature = calculateSignature(payment);
  payment['signature'] = signature;

  const data_stream = new URLSearchParams(payment).toString();
  const ch = new XMLHttpRequest();
  ch.open("POST", 'https://sandbox-api.paymentechnologies.co.uk/v2/authorize-3dsv');
  ch.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  ch.onload = function() {
    if (ch.status == 200) {
      console.log(ch.responseText)
    } else {
      console.log(ch.status);
    }
  };
  ch.onerror = function() {
    console.log(ch.status);
  };
  ch.send(data_stream);

}


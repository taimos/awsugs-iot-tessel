const iot = require('aws-iot-device-sdk');
const tessel = require('tessel');

const device = iot.device({
  keyPath: __dirname + '/private.pem.key',
  certPath: __dirname + '/certificate.pem.crt',
  caPath: __dirname + '/root-certificate.pem.crt',
  clientId: 'Tessel',
  region: 'eu-west-1'
});

device.on('connect', () => {
  'use strict';
  console.log('connect');
  
  setInterval(() => {
    tessel.led[2].toggle();
    
    let temperature = Math.floor(Math.random() * 20 + 30);
    console.log(`publish temperature: ${temperature}`);
    
    device.publish('awsugs/tessel', JSON.stringify({temperature: temperature, id: 'someDeviceId'}));
  }, 2000);
  
  device.subscribe('awsugs/tessel-in');
});

device.on('message', (topic, payload) => {
  'use strict';
  console.log('got message', topic, JSON.parse(payload));
  
  tessel.led[3].on();
  setTimeout(() => {
    tessel.led[3].off();
  }, 2000);
});

device.on('close', () => {
  'use strict';
  console.log('close');
});
device.on('reconnect', () => {
  'use strict';
  console.log('reconnect');
});
device.on('error', err => {
  'use strict';
  console.log(err);
});
device.on('offline', () => {
  'use strict';
  console.log('offline');
});
const iot = require('aws-iot-device-sdk');
const tessel = require('tessel');

const thingShadows = iot.thingShadow({
  keyPath: __dirname + '/private.pem.key',
  certPath: __dirname + '/certificate.pem.crt',
  caPath: __dirname + '/root-certificate.pem.crt',
  clientId: 'Tessel',
  region: 'eu-west-1'
});

const myThingName = 'Tessel';

const reportState = () => {
  'use strict';
  let ledState = {'state': {'reported': {'green': tessel.led[2].isOn, 'blue': tessel.led[3].isOn}}};
  console.log('Reporting LED state', ledState.state.reported);
  
  let clientTokenUpdate = thingShadows.update(myThingName, ledState);
  if (clientTokenUpdate === null) {
    console.log('update shadow failed, operation still in progress');
    setTimeout(reportState, 100);
  }
};

const updateState = (state) => {
  'use strict';
  
  if ('green' in state && state.green === true) {
    tessel.led[2].on();
    console.log('Switched green LED on');
  } else if ('green' in state && state.green === false) {
    tessel.led[2].off();
    console.log('Switched green LED off');
  }
  
  if ('blue' in state && state.blue === true) {
    tessel.led[3].on();
    console.log('Switched blue LED on');
  } else if ('blue' in state && state.blue === false) {
    tessel.led[3].off();
    console.log('Switched blue LED off');
  }
  
  reportState();
};

thingShadows.on('connect', () => {
  'use strict';
  console.log('Connect');
  
  thingShadows.register(myThingName, {}, () => {
    console.log('Registered');
    reportState();
  });
});

thingShadows.on('status', (thingName, stat, clientToken, stateObject) => {
  'use strict';
  console.log('received ' + stat + ' on ' + thingName + ': ' + JSON.stringify(stateObject));
  if (thingName === myThingName && stateObject.state.desired) {
    updateState(stateObject.state.desired);
  }
});

thingShadows.on('delta', (thingName, stateObject) => {
  'use strict';
  console.log('received delta on ' + thingName + ': ' + JSON.stringify(stateObject));
  if (thingName === myThingName && stateObject.state) {
    updateState(stateObject.state);
  }
});

thingShadows.on('timeout', (thingName, clientToken) => {
  'use strict';
  console.log('received timeout on ' + thingName + ' with token: ' + clientToken);
});

thingShadows.on('error', err => {
  'use strict';
  console.log(err);
});
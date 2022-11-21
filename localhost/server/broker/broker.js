// Start up the broker server
console.log("Starting up broker");
var mosca = require('mosca')

var server = new mosca.Server({
    http: {
      port: 1234,
      bundle: true,
      static: './'
    }
  });

// Use MQTT to connect to broker
var mqtt = require('mqtt');
var testclient = mqtt.connect('ws://192.168.0.100:1234');
// var testclient = mqtt.connect('ws://192.168.2.14:1234'); 

// THIS IS NEW
testclient.on('connect', function () {
  console.log("testclient connected");
  testclient.subscribe('from_arduino/');
})

testclient.on('message', function (topic, message) {
  context = message.toString();
  console.log("testclient received topic {} and message {}", topic.toString(), context)

  // And now send this to our main program
  // var topic = 'server/1';
  // testclient.publish(topic, connection_ip);
})

// TILLL HERE


// Broker On ready fuction
server.on('ready', ()=>{
    console.log("Broker is ready!")
})

// If a client connects, fire a warning to server
server.on('clientConnected', function(client) {
  // Get connection code of connected client.
  connection_code = client.connection.stream.remoteAddress
  
  // If the connection_code came from RPI. 
  if (typeof(connection_code) == "string") {
    connection_ip = connection_code.slice(connection_code.length - 13)
  
    // Send a message to server, about IP that is connected.
    // 1 is connected, 0 is disconnected.
    var topic = 'server/1';
    testclient.publish(topic, connection_ip);
    console.log('[broker.js] Client Connected:', topic, connection_code);
  };
})

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
  // console.log("[broker.js]  client disconnected ---")
  // Get connection code of connected client.
  connection_code = client.connection.stream.remoteAddress
  
  // If the connection_code came from RPI. 
  if (typeof(connection_code) == "string") {
    connection_ip = connection_code.slice(connection_code.length - 13)
  
    // Send a message to server, about IP that is connected.
    // 1 is connected, 0 is disconnected.
    var topic = 'server/0';
    testclient.publish(topic, connection_ip);
    console.log('[broker.js] Client Disonnected:', connection_code);
  };
});

console.log("end broker");
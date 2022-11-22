// mqtt variables
var mqtt;
var reconnectTimeout = 2000;

// connect to MQTT
function MQTTconnect() {
	if (typeof path == "undefined") {
		path = '/mqtt';
	}
	mqtt = new Paho.MQTT.Client(
			host,
			port,
			path,
			"web_" + parseInt(Math.random() * 100, 10)
	);
	var options = {
		timeout: 3,
		useSSL: useTLS,
		cleanSession: cleansession,
		onSuccess: onConnect,
		onFailure: function (message) {
			$('#status').val("Connection failed: " + message.errorMessage + "Retrying");
			setTimeout(MQTTconnect, reconnectTimeout);
		}
	};

	mqtt.onConnectionLost = onConnectionLost;
	mqtt.onMessageArrived = onMessageArrived;

	if (username != null) {
		options.userName = username;
		options.password = password;
	}
	console.log("connect Host="+ host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
	mqtt.connect(options);
}

function onConnect() {
	console.log("[send_to_pi.js] on connect");
	// Connection succeeded; subscribe to our topic
	mqtt.subscribe(topic, {qos: 0});

	// console.log("And also ")
	// from_arduino
	$('#status').val('Connected to ' + host + ':' + port + path);


	// Send validation to main server. 
	message = new Paho.MQTT.Message("Server connected");
	message.destinationName = topic;
	mqtt.send(message);
}

// Reconnect if connection lost. 
function onConnectionLost(response) {
	console.log("[send_to_pi.js] on connectionlost");
	setTimeout(MQTTconnect, reconnectTimeout);
	$('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
};

function onMessageArrived(message) {
	console.log("[send_to_pi.js] message received: ");
	// analyse Message
	var topic = message.destinationName;
	var payload = message.payloadString;
	console.log("[send_to_pi.js] topic/payload: ", topic, payload);

	// In case a new arduino is connected 
	if (topic == "server/1") {
		console.log("[send_to_pi] New arduino connected: ", topic, payload);
		var thisled = document.getElementById(payload);
		thisled.classList.add("green");

		// console.log("will this work?");
		// var ipstorage = document.getElementById("stored" +payload);
		
		localStorage.setItem("stored" + payload, "on");
		// console.log("yes maybe? ", someVarName)
		// localStorage.setItem(thisled.classList.add("green"));
		
	}

	// In case a raspberry disconnects
	else if (topic == "server/0") {
		console.log("[send_to_pi] arduino connection lost: ", topic, payload);
		localStorage.setItem("stored" + payload, "off");
		var thisled = document.getElementById(payload);
		thisled.classList.remove("orange");
		thisled.classList.remove("green");
		thisled.classList.remove("supergreen");
		thisled.classList.remove("notify");
	}

	else if (topic == "server/test") {
		console.log("[send_to_pi] received SERVER/TEST from_arduino: ", topic, payload);

		var splitted = payload.split("-");
		console.log("splitted: ", splitted);
		// strValue was non-empty string, true, 42, Infinity, [], ...
		if (splitted[0]) {
			
			var hr = splitted[1];
			var ip_nr = splitted[0].split('.')[3]
			// Put the value in audiovisualizers
			var audiovisualizer_id = "audiovisualizer" + ip_nr.toString();
			var visualizer = document.getElementById(audiovisualizer_id);
			visualizer.value = hr;
			update_real_hrs(ip_nr, hr);

			var audioplayer_id = "audioplayer" + ip_nr.toString();
			check_for_play_updates(audioplayer_id, hr);
		}

		else {
			console.log("empty IP, fix this!!! ");
		}
	}
};


function update_real_hrs(ip_of_arduino, hr) {
	// Iterate over rows of table
	$('#table tr').each(function(){

		// Get ip address in IP cell
		var ip_cell = $(this).find('#ip_arduino')[0];
		var ip_of_cell = $(ip_cell).val();

		// Fill in heartrate
		if (ip_of_cell == ip_of_arduino) {
			$(this).find('#heartrate_real').each(function(){
				this.value = hr;
			})
		}
	})

}
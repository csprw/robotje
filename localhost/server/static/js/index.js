/******************************************************************************/
/* index.js */
/* Casper Wortmann */
/******************************************************************************/

var myIntervals={};
var myFilenames={};
var myRealorFake={};

/******************************************************************************/
/* Everything related to sending commands to PI's */
/******************************************************************************/

function send_to_arduino(ip_arduino, command, heartrate, speed) {
    /* Send a message to a specific arduino with IP address */
    var json_send = {};
    json_send["ip"] = '192.168.0.'+ip_arduino;
    json_send["cmd"] = command;
    json_send["hr"] = heartrate;
    json_send["speed"] = speed;
    stringed = JSON.stringify(json_send)
    console.log("[send_to_arduino] mssg to arduino ", stringed);
    message = new Paho.MQTT.Message(stringed);
    message.destinationName = 'toArduino/';
    mqtt.send(message);
}

function send_to_all_arduinos(command) {
    /* Send a message to all arduinos  with IP address */
    var json_send = {};
    json_send["ip"] = 'all';
    json_send["cmd"] = command;
    stringed = JSON.stringify(json_send)
    console.log("[send_to_all_arduinos] message: ", stringed);

    if (command == 'check') {
        check_conn();
    }

    message = new Paho.MQTT.Message(stringed);
    message.destinationName = 'toArduino/';
    mqtt.send(message);
}

/******************************************************************************/
/* Everything related to sending table values*/
/******************************************************************************/
// Function disables "send" button if follow set to true.
followchange = function() {
    var row = this.closest("tr")
    // If follow is set to checked, disable send button
    if (this.checked) {
        $(row).find("#sendbutton").addClass("disabled")
        $(row).find("#collapse").addClass("disabled")
        $(row).find("#timer").addClass("disabled")

        // Only show collapse button on row with children
        var prevRow = $( row ).prev()[0];
        var prevRowIsFollower = $(prevRow).find('#follow').prop('checked')

        // If this row is child of row with children
        if (!prevRowIsFollower) {
            $(prevRow).find('#collapse').removeClass("disabled");
        }

        // Color adjustments to checked elements
        $(row).addClass("hidden_child");
    }

    // Else enable button
    else if (!(this.checked)) {
        $(row).find("#sendbutton").removeClass("disabled")

        // Only show collapse button on row with children
        var prevRow = $( row ).prev()[0];
        var prevRowIsFollower = $(prevRow).find('#follow').prop('checked')

        // If this row is child of row with children
        // Disable the collapse button for the row above
        if (!prevRowIsFollower) {
            $(prevRow).find('#collapse').addClass("disabled");
        }

        // if next row is a follower, make this one head
        var nextRow = $( row ).next()[0];
        var nextRowIsFollower = $(nextRow).find('#follow').prop('checked')
        if (nextRowIsFollower) {
            $(row).find('#collapse').removeClass("disabled");
        }

        $(row).removeClass("hidden_child");
    }
};


// Function disables "send" button if follow set to true.
followchange_hr = function() {
    var row = this.closest("tr");
    // If follow is set to checked, disable send button
    if (this.checked) {
        $(row).find("#heartrate_real").addClass("real_heartrate_enabled");
        $(row).find("#heartrate_real").removeClass("real_heartrate_disabled");

        $(row).find("#heartrate_fake").addClass("real_heartrate_disabled");
        $(row).find("#heartrate_fake").removeClass("real_heartrate_enabled");
    }

    // Else enable button
    else if (!(this.checked)) {
        $(row).find("#heartrate_real").addClass("real_heartrate_disabled");
        $(row).find("#heartrate_real").removeClass("real_heartrate_enabled");

        $(row).find("#heartrate_fake").removeClass("real_heartrate_disabled");
        $(row).find("#heartrate_fake").addClass("real_heartrate_enabled");
    }

    // check if we need to change speed
    var ip_arduino = $(row).find("#ip_arduino").prop('value'); 
    var name = "audioplayer" + String(ip_arduino)

    if (typeof myIntervals[name] !== 'undefined') {
        // Something was playing already, so keep on playing with new hr.
        play_heartrates($(row));
    }
    else {
        // else ignore
        console.log("[followchange_hr] Nothing was playing - ignore ", name);
    }

};


// Function return current time + delay
function get_timestamp(delay) {
    var playtime = new Date();
    playtime.setSeconds(playtime.getSeconds() + delay);

    var year = playtime.getFullYear();
    var month = playtime.getMonth()+1;
    var day = playtime.getDate();
    var hour = playtime.getHours();
    var min = playtime.getMinutes();
    var sec = playtime.getSeconds();
    var ms = playtime.getMilliseconds();

    var start_at = year+':'+month+':'+day+':'+hour+':'+min+':'+sec+':'+ms;
    return start_at;
}

function check_conn(){
    // TODO: this is a ugly hack, read it from ips.json
    var thisled = document.getElementById("192.168.0.101");
    thisled.classList.remove("green");
    var thisled = document.getElementById("192.168.0.102");
    thisled.classList.remove("green");
    var thisled = document.getElementById("192.168.0.103");
    thisled.classList.remove("green");
    var thisled = document.getElementById("192.168.0.104");
    thisled.classList.remove("green");
    var thisled = document.getElementById("192.168.0.105");
    thisled.classList.remove("green");
}

/* Function starts an audio player according to settings of row */
function play_heartrates(current_row) { 

    // Change color to signal it will send to pi
    var time = 1000;
    current_row.addClass('highlighted');
    setTimeout(function() {
        current_row.removeClass('highlighted');
    }, time);

    // Get variables of current rows
    var soundfile = current_row.find(".soundfile").prop('value');
    var fileName = "static/media/" + String(soundfile);
    var heartrate = read_heartrate(current_row);
    console.log("[play_heartrates]: ", soundfile, heartrate);

    // Get audio device
    var speed = current_row.find("#speed").prop('value');
    var ip_arduino = current_row.find("#ip_arduino").prop('value'); 
    var name = "audioplayer" + String(ip_arduino)
    var audioplayer = document.getElementById(name);


    // If the audioplayer was already playing something, clear all information
    // in myIntervals about it
    if (typeof myIntervals[name] !== 'undefined') {
        clearInterval(myIntervals[name]);
    }

    if (heartrate==0) {
        // Ignore heartrates of 0
        console.log('[play_heartrates] heartrate is zero');
    }
    else {
        //  Play audio files on this computer
        play_player(audioplayer, fileName, heartrate);
    }

    // Send move commando to robot
    send_to_arduino(ip_arduino, "start_moving", heartrate, speed);  
}

function read_heartrate(row) {
    var heartrate_checkbox = $(row).find('#heartrate_mr')[0];
    var ip_arduino = row.find("#ip_arduino").prop('value'); 
    var name = "audioplayer" + String(ip_arduino);

    if ($(heartrate_checkbox).prop('checked')) { 
        // Checkbox is checked, use heartrate from arduino
        var heartrate = row.find("#heartrate_real").prop('value'); 
        myRealorFake[name] = 'arduino';

        if (!heartrate) {
            // strValue was empty string, use fake heartrate
            console.log("[read_heartrate] Empty arduino heartrate, use fake");
            var heartrate = row.find("#heartrate_fake").prop('value'); 
        }
    }
    else {
        // Checkbox is not checked, use fake hr;
        var heartrate = row.find("#heartrate_fake").prop('value'); 
        myRealorFake[name] = 'fake';
    }
    return parseInt(heartrate);
}

function play_player(audioplayer_id, fileName, heartrate) {
    // console.log("[play_player] playing audioplayer: ", audioplayer_id, fileName, heartrate);
    var audioplayer = $(audioplayer_id);  
    audioplayer[0].pause();

    // Load the filename
    audioplayer.attr("src", fileName).load();

    // Play based on BPM
    var wait_time = 60 / heartrate * 1000;
    
    var audioplayer_id = $(audioplayer).attr('id');
    myIntervals[audioplayer_id] = setInterval(function() {
        $(audioplayer).trigger("play");
    }, wait_time);

    // Make this information globally available
    myFilenames[audioplayer_id] = fileName;
}

function pause_player(audioplayer_id, fileName, heartrate) {
    var audioplayer = $(audioplayer_id);  
    audioplayer[0].pause();
}

function check_for_play_updates(audioplayer_id, heartrate) {
    console.log("[check_for_play_updates] ", audioplayer_id);
    var is_playing = typeof myIntervals[audioplayer_id] !== 'undefined';

    // If the audiplayer is playing, and if it is playing the arduino_hr, 
    // then change playing speed.
    if (is_playing) {
        var arduino_hr = myRealorFake[audioplayer_id] == 'arduino';

        if (arduino_hr){
            var soundfile = myFilenames[audioplayer_id];
            var audioplayer = document.getElementById(audioplayer_id);

            // TODO: clashing real HRs
            pause_player(audioplayer, soundfile, heartrate);

            // Wait a short moment and continue
            setTimeout(function() {
                clearInterval(myIntervals[audioplayer_id]);
                play_player(audioplayer, soundfile, heartrate);

                // Send move commando to robot with new hr
                var ip_arduino = "192.168.0." + audioplayer_id.slice(-3,audioplayer_id.length);
                send_to_arduino(ip_arduino, "start_moving", heartrate, -1);
            }, 50);
        }
    }
}

/* Stop all sounds */
function stop_sounds() {
    // iterate over all possible sound players and clear
    console.log("[Stop_sounds] ", myIntervals)
    for (const [key, value] of Object.entries(myIntervals)) {
        clearInterval(myIntervals[key]);
        delete myIntervals[key];
        delete myRealorFake[key];
    }

    // also stop movements
    send_to_all_arduinos("stop");
}

function start_timer(current_row) { 
    console.log("[depricated] Start timer!");
    // Get variables of current rows
    var start_time = current_row.find("#timer").prop('value'); 

    function countdown() {
        var field = $(current_row).find('#time_left_field');
        $(field)[0].innerHTML = String( start_time );
        if (start_time > 0) {
            start_time--;
            setTimeout(countdown, 1000);
        }
        else {
            play_heartrates(current_row);
        }
    };

    setTimeout(countdown, 1000);
}


function changemidi_new() {
    var vakje = $(this)[0]
    vakje.id = "midi"+vakje.value
    console.log("Midi change: ", vakje.value)
}

function collapse(current_row) {
    var field = $(current_row).find('#collapse');
    var value = $(field).val();

    // change value
    if (value == "true") {
        $(field)[0].classList.remove("right");
        $(field)[0].classList.add("down");
        $(field)[0].value = "false";
    }
    else if (value == "false") {
        $(field)[0].classList.remove("down");
        $(field)[0].classList.add("right");
        $(field)[0].value = "true";
    }

    var close_children = $(field)[0].value
    var current_table = $(current_row).closest('table');
    var current_row_index = current_row.prop('rowIndex');
    var next_row_index = current_row_index += 1;
    var next_row_checked = true;

    // Iterate over all checked rows
    while (next_row_checked == true) {
        next_row = current_table.find('tr').eq(next_row_index);
        var follow = $(next_row).find('#follow').is(":checked");

        // Follow checkbox was checked, this row follows row above
        if (follow == true) {

            if (close_children == "true") {
                // $(next_row)[0].value = "hidden";
                $(next_row)[0].value = "true";
                $(next_row).hide(0);
                
            }
            else {
                $(next_row)[0].value = "false";
                $(next_row).show(0);
            }
            
            // Next round, check the next row
            next_row_index += 1;
        }

        // Follow checkbox was not checked, stop.
        else {
            next_row_checked = false;
        }
    }
}


// Function adds a row to end of table. 
function addrow() {
    // Clone last row.
    var newrow = $('#table tr').last().clone()

    // Change id of row and append to table. 
    var random_id =  Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
    newrow.prop('id', random_id);

    // add event listener for follow button
    var jsfollow = $(newrow).find('#follow')[0];
    jsfollow.addEventListener("change", followchange)

    // add event listener for heartrate button
    var jsfollow = $(newrow).find('#heartrate_mr')[0];
    jsfollow.addEventListener("change", followchange_hr)

    // Collapse row if necessary
    var jscollapse = $(newrow).find('#collapse')[0];
    jscollapse.value = "false";
    jscollapse.onclick  = function () {
        var current_row = $(this).closest('tr');
        collapse(current_row);
    };

    newrow.appendTo("table");

    var sendbutton = $(newrow).find('#sendbutton')[0];
    sendbutton.onclick  = function () {
        var current_row = $(newrow).closest('tr');
        play_heartrates(current_row);
    };
}

// Function deletes last row.
function delrow() {
    // Clone last row.
    $('#table tr').last().remove()
}


/******************************************************************************/
/* Everything related to saving/loading the table */
/******************************************************************************/

function save_current_table(){
    $.ajax({
        // url: 'data/control.json',
         url: '/api/save_data',
         type: 'POST',
         dataType: 'json',
         data: serialize_table("table"),
    });
}

function serialize_table(table_id) {
    var table = document.getElementById(table_id);
    var out = {};

    // Loop over rows, skip header
    for (var i = 1, row; row = table.rows[i]; i++) {
        console.log("[serialize_table] row ", i);
        var rowid = row.id;
        var serialized_row = serialize_row(rowid);
        out[rowid] = JSON.stringify(serialized_row)
    }
    return out;
}

// return hashtable mapping id of input to value
function serialize_row(row_id){
    var out = {};
    var relevant_ids = ["soundfile", "eyes", "midi", "comment",  "collapse", "ip_arduino", "timer", "speed"];
    $("#"+row_id).find("input")
        .each(function() {
            // checkboxes for follow
            if (this["id"] == "follow") {
                if (this["checked"]) {
                    out[this["id"]] = "true";
                }
                else {
                    out[this["id"]] = "false";
                }
            }

            // checkboxes for follow
            if (this["id"] == "heartrate_mr") {
                if (this["checked"]) {
                    out[this["id"]] = "true";
                }
                else {
                    out[this["id"]] = "false";
                }
            }

            if (this["id"] == "heartrate_fake") {
                out["heartrate"] = this["value"];
            }

            // all other relevant ids
            if (relevant_ids.includes(this["id"])){
                out[this["id"]] = this["value"];
            }
            else if (relevant_ids.includes(this.className)) {
                out[this.className] = this["value"];
            }
        })

    // also add texterea
    $("#"+row_id).find("textarea").each(function() {
        if (relevant_ids.includes(this["id"])){
            out[this["id"]] = this["value"];
        }
        else if (relevant_ids.includes(this.className)) {
            out[this.className] = this["value"];
        }
    })

    // also add select
    $("#"+row_id).find("select").each(function() {
        if (relevant_ids.includes(this.className)) {
            out[this.className] = this["value"];
        }
    })

    // also add collapse
    $("#"+row_id).find("i").each(function() {
        if (relevant_ids.includes(this["id"])){
            out[this["id"]] = this["value"];
        }
    })
    return out
}

/******************************************************************************/
/* Everything related to server */
/******************************************************************************/

function populate_table_new() {
    console.log("[populate_table_new] ")
    $.ajax({
        'url': 'api/get_data',
        'type': 'get',
        'dataType': 'json',

        success: function (json) {
            console.log(' [populate_table_new] read data success')
            // Iterate over the row id numbers
            Object.keys(json).forEach(function(rowid) {
                var rowdata = json[rowid];
                
                // get  table and insert row
                var table = document.getElementById("table");
                var tr = table.insertRow(-1);
                tr.id = rowid;

                // iterate over keys in dict and set values accordingly
                Object.keys(rowdata).forEach(function(key) {
                    var value = rowdata[key];
                    if (key == "timer") {
                        // Actual timer field
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input');
                        field.type="number";
                        field.id = key;
                        field.min = "0";
                        field.step = "1";
                        field.max = "1000";
                        field.value = value;
                        td.appendChild(field);

                        // Time left field
                        var td = tr.insertCell(-1);
                        var field = document.createElement('span');
                        field.id = "time_left_field";
                        td.appendChild(field);

                    }

                    if (key == "ip_arduino") {
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input');
                        field.type="number";
                        field.id = key;
                        field.min = "100";
                        field.step = "1";
                        field.max = "110";
                        field.value = value;
                        field.classList.add("ip_arduino_class");
                        td.appendChild(field);
                    }

                    
                    if (key == "soundfile") {
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input');
                        field.type="text";
                        
                        field.className = key;
                        field.value = value;
                        field.autoComplete = "off";
                        td.appendChild(field);
                    }

                    else if (key == "heartrate") {
                        var td = tr.insertCell(-1);
                        td.className = "heartrate_cell";

                        var field = document.createElement('input');
                        field.type="number";
                        field.id = key+"_fake";
                        field.min = "0";
                        field.step = "1";
                        field.max = "300";
                        field.value = value;
                        field.className = "heartrate_input";
                        td.appendChild(field);

                        var real_field = document.createElement('input');
                        real_field.type="number";
                        real_field.id = key+"_real";
                        real_field.min = "0";
                        real_field.step = "1";
                        real_field.max = "300";
                        real_field.value = "-";
                        real_field.className = "heartrate_input";
                        real_field.readOnly = true;
                        td.appendChild(real_field);
                    }

                    else if (key == "heartrate_mr") {
                        var td = $(tr).children(".heartrate_cell")[0];
                        var field = document.createElement('input'); 
                        field.type = "checkbox"; 
                        field.id = "heartrate_mr";
                        field.class = "heartrate_mr";

                        // Set appropriate follow value
                        if (value == "true") {
                            field.checked = "true";
                        }
                        else {
                            field.checked = "";
                        }
                        
                        // Keep on listening to changes in checkbox
                        field.addEventListener("change", followchange_hr);
                        td.appendChild(field);
                        
                        // Make sure fields are disabled;
                        followchange_hr.call(field);
                    }

                    if (key == "speed") {
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input');
                        field.type="number";
                        field.id = key;
                        field.min = "20";
                        field.step = "1";
                        field.max = "1000";
                        field.value = value;
                        td.appendChild(field);
                    }


                    else if (key == "comment") {
                        // Add a comment field
                        var td = tr.insertCell(-1);
                        var field = document.createElement('TEXTAREA');
                        field.id = "comment";
                        td.className = 'commentcell';
                        field.value = value;
                        td.appendChild(field);
                    }

                    else if (key == "midi" ) {
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input');

                        field.type="text";
                        field.value = value;
                        if (value !== '') {
                            field.id = "midi"+value;
                        }
                        field.classList.add(key);
                        field.className = key;
                        field.autoComplete = "off";
                        field.addEventListener('input', changemidi_new);
                        td.appendChild(field);
                    }

                    else if (key == "follow") {
                        var td = tr.insertCell(-1);
                        var field = document.createElement('input'); 
                        field.type = "checkbox"; 
                        field.id = "follow";
                        field.class = "follow";
                        
                        // Set appropriate follow value
                        if (value == "true") {
                            field.checked = "true";
                        }
                        else {
                            field.checked = "";
                        }

                        // Keep on listening to changes in checkbox
                        field.addEventListener("change", followchange);
                        td.appendChild(field);
                    }

                    else if (key == "collapse") {
                        var td = tr.insertCell(0);
                        var field = document.createElement("i");
                        field.classList.add("arrow");
                        field.id = "collapse";
                        field.value = value;

                        // Hide this row
                        if (value == "true") {
                            field.classList.add("right");
                            hide_children = true;
                        }
                        else if (value == "false") {
                            field.classList.add("down");
                        }

                        // Only show collapse button on row with children
                        var prevRow = $( tr ).prev()[0];
                        var prevRowIsFollower = $(prevRow).find('#follow').prop('checked')
                        $(field).addClass("disabled");

                        // If this row is child of row with children
                        if (!prevRowIsFollower && ($(tr).find('#follow').prop('checked'))) {
                            // Do not show collapse button for previous row
                            $(prevRow).find('#collapse').removeClass("disabled");
                        }

                        // if follow is set to true, and hide_children is set to true
                        if ($(tr).find('#follow').prop('checked') && hide_children == true) {
                            $(tr).addClass("hidden_child");
                            $(tr).hide();
                        }

                        // if follow is set to true, and hide_children is set to true
                        if ($(tr).find('#follow').prop('checked') && hide_children == false) {
                            $(tr).addClass("hidden_child");
                        }

                        // else if this is a row with send button, and collapse is set to false
                        else if (!$(tr).find('#follow').prop('checked') && value == "false") {
                            hide_children = false;
                        }

                        field.onclick  = function () {
                            var current_row = $(this).closest('tr');
                            collapse(current_row);
                        };
                        td.appendChild(field);
                    }
                })

                // Add a button
                var td = tr.insertCell(-1);
                var field = document.createElement('input');
                field.type="button";
                field.id = "sendbutton";
                field.value = "send";
                field.onclick  = function () {
                    var current_row = $(this).closest('tr');

                    // Option 1 (future)
                    // Play heartrate after timer;
                    // start_timer(current_row);

                    // option 2 
                    // play heartrate immediately
                    play_heartrates(current_row)
                };

                // Uncheck if followed, remove send button
                if ($(tr).find('#follow').prop('checked')) {
                    $(field).addClass("disabled");
                }

                // Remove timer (future)
                // if ($(tr).find('#follow').prop('checked')) {
                //     var timerfield =  ($(tr).find('#timer'))
                //     $(timerfield).addClass("disabled");
                // }

                td.appendChild(field);
            })
        }
    });
}


function refill_leds() {
    var childDivs = document.getElementById('ledcontainer').getElementsByTagName('span');
    for( i=0; i< childDivs.length; i++ )
    {
        var childDiv = childDivs[i];
        if (childDiv.id.length > 10) {
            var saved_before_refresh = localStorage.getItem("stored" + childDiv.id)
            if (saved_before_refresh == "on"){
                childDiv.classList.add("green");
            }
        }
    }
}

function populate_leds() {
    // Get all ips from database
    $.ajax({
        async: false,
        'url': 'api/get_data_ips',
        'type': 'get',
        'dataType': 'json',
        success: function (data) {
            var ip_form = document.getElementById("ledcontainer");

            // iterate over array of ips
            Object.keys(data).forEach(function(led_ip) {
                if (led_ip !== "server_ip") { 
                    var ledspan = document.createElement('span')
                    ledspan.id = led_ip;
                    ledspan.className = "led";
                    ledcontainer.appendChild(ledspan);

                    // Make sure IP is showed when hovered over .led div. 
                    var test = document.createElement('span');
                    test.className="tooltiptext";
                    test.innerHTML=led_ip;
                    document.getElementById(led_ip).appendChild(test);
                    }
            });
        }
    })
}

/******************************************************************************/
/* Everything related to webmidi api */
WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        console.log("Webmidi available inputs: ")
        WebMidi.inputs.forEach(input => {
            console.log('- id  :', input.id);
            console.log('- name:', input.name);
            console.log('- manu:', input.manufacturer);
            console.log('- conn:', input.connection);
            console.log('---');
        });
        console.log("Webmidi available outputs: ")
        WebMidi.outputs.forEach(output => {
            console.log('- id  :', output.id);
            console.log('- name:', output.name);
            console.log('- manu:', output.manufacturer);
            console.log('- conn:', output.connection);
            console.log('---');
        });


        var webmidi_name = 'IAC-besturingsbestand Bus 1';
        console.log("webmidi will listen to input: ", webmidi_name);
        WebMidi.getInputByName(webmidi_name).addListener('noteon', 'all', function(e) {
            // Generate special code for this note:
            var midicode_show = (e.note.octave + e.note.name).replace("#", "z");
            var midicode = ("midi" + midicode_show);
            var checkmidi = $("#webmidicheck")
            checkmidi.val(midicode_show);

            if($("#" + midicode).length > 0) {
                console.log("[received midicode exists] ", e.note);
                var current_row = $("#" + midicode).closest("tr")

                // if the row is set to "follow", don't send anything
                var isfollower = $(current_row).find('#follow').is(":checked");
                if (!isfollower) {
                    play_heartrates(current_row);
                    // start_timer(current_row);
                }
                else {
                    console.log("[row is disabled] -- ignore although midicue present")
                }
            }

            else {
                console.log("[received midicode not set in table] - ignore", e.note)
            }
        });
    }
});

/******************************************************************************/
/* Everything related to server */
/******************************************************************************/
// sets csrf token to enable POST request
function set_csrftoken(){
    var csrftoken = getCookie('csrftoken');
    console.log("cookie set: ", csrftoken)
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


$(document).ready(function() {
    // Connect to broker.
    MQTTconnect();

    // set csrftoken hook to enable POST requests
    set_csrftoken()
    
    // Create a table with rows, and settings.
    populate_table_new();
    populate_leds();

    // // send save request upon clicking on save button
    $("#save").click(function() {save_current_table()});

    // // Listener to add/delete a new row
    $("#addrow").click(function() {addrow()});
    $("#delrow").click(function() {delrow()});

    // // Make table rows draggable
    $('#table tbody').sortable();

    // Always reset volume on refresh. 
    setTimeout(function() {
        // send_main_vol(100);
        refill_leds()
        // client_check("all")
    }, 1000);
    
});

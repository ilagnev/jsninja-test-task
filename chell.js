var lastStateId = null,
    leveragesState = [null, null, null, null],
    turned = 1, unturned = 0;

if (WebSocket == undefined) var WebSocket = require('ws');

var webSocket = new WebSocket('ws://nuclear.t.javascript.ninja');
webSocket.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (!!data.newState) {
        console.log(data);
        if (data.newState == 'poweredOn') {
            // oh, that switches powered when set upside down
            for (i in leveragesState) leveragesState[i] ^= 1;
            console.log('revert all switchet, new state:', leveragesState);
        } else {
            // my job is done here, i hope to join the course :]
            return webSocket.close();
        }
    } else if (!!data.action && data.action == "check") {
        // compare and apply new data
        if (data.same) {
            // set initial state for first lever
            if (leveragesState[data.lever1] == null) 
                leveragesState[data.lever1] = turned;

            // set same state for next lever
            leveragesState[data.lever2] = leveragesState[data.lever1];
        }
    } else if (!!data.stateId) {
        // state changed
        lastStateId = data.stateId;

        // change pulled leverage state
        if (leveragesState[data.pulled] != null) {
            leveragesState[data.pulled] ^= 1;
        }

        console.log('current state:', leveragesState);

        // check unknown leverages state
        if (leveragesState.indexOf(null) > -1) 
            webSocket.send(JSON.stringify({
                action: "check", 
                "lever1": leveragesState.indexOf(null) ? leveragesState.indexOf(null) - 1 : 0,
                "lever2": leveragesState.indexOf(null) ? leveragesState.indexOf(null) : 1,
                stateId: lastStateId
            }));

        if (leveragesState == "1,1,1,1") {
            console.log('all leverages in same state, try to power off');
            webSocket.send(JSON.stringify({
                action: "powerOff",
                stateId: lastStateId
            }));
        }
    }
};
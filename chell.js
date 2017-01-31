var lastStateId = null;
var leveragesState = [null, null, null, null];
var turned = 1, unturned = 0;

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
    } else if (!!data.action) {
        // compare and apply new data
        compareLeverages(data);
    } else {
        // message about leverage pull
        lastStateId = data.stateId;

        // switch leverage state
        if (leveragesState[data.pulled] != null) {
            leveragesState[data.pulled] ^= 1;
        }

        // check unknown leverages state
        if (leveragesState.indexOf(null) > -1) 
            checkUnknownLeverages();

        console.log('current state:', leveragesState);

        if (leveragesState == "1,1,1,1") {
            console.log('all leverages in same state, try to power off');
            webSocket.send(JSON.stringify({
                action: "powerOff",
                stateId: lastStateId
            }));
        }
    }
};

function compareLeverages(state) {
    if (!state.same) return;

    // set initial state for first lever
    if (leveragesState[state.lever1] == null) 
        leveragesState[state.lever1] = turned;

    // set same state for next lever
    leveragesState[state.lever2] = leveragesState[state.lever1];
}

function checkUnknownLeverages() {
    var lever1 = leveragesState.indexOf(null) ? leveragesState.indexOf(null) - 1 : 0;
        lever2 = leveragesState.indexOf(null) ? leveragesState.indexOf(null) : 1 ;

    webSocket.send(JSON.stringify({
        action: "check", 
        "lever1": lever1,
        "lever2": lever2,
        stateId: lastStateId
    }));
}
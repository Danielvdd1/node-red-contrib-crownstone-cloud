module.exports = function (RED) {
    function CrownstoneSSEClient(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Libraries
        const sseLib = require("crownstone-sse");
        let sse = new sseLib.CrownstoneSSE();

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud;


        // create a callback function to print incoming data
        let eventHandler = (data) => {
            // console.log("Event received", data); // Debug

            var newMsg = {};
            newMsg.payload = data; // Add the event data to the message object

            if (data.type === "system" && data.subType === "TOKEN_EXPIRED") {
                // Token expired. Need to reauthenticate.
                node.error("Authorization Required", newMsg); // Catchable error so a catch node can catch it and trigger the authentication node
                sse.stop();
            }

            node.send(newMsg);
        }

        async function StartEventHandler() {
            console.log("Debug SSE access token: " + sse.accessToken);
            try {
                // Start the eventstream
                await sse.start(eventHandler);
                console.log("Event stream started");
            }
            catch (e) {
                var newMsg = {};
                if (e.statusCode === 401) {
                    newMsg.payload = e;
                    node.error("Authorization Required", newMsg);
                }
                else {
                    newMsg.payload = e;
                    node.error("There was a problem connecting to the event server", newMsg);
                }
            }
        }

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {
            cloud = globalContext.get("crownstoneCloud");
            if (cloud === undefined) { // Cloud object is not stored in global context. The authentication node is not used.
                node.error("The cloud object is not stored in global context. Use the Crownstone authenticate node.");
                return;
            }

            // Login the user after the access token is generated
            var myInterval = setInterval(function () {
                let accessToken = cloud.me().rest.tokenStore.accessToken;
                if (accessToken !== undefined) { // Check if the token is set
                    // Set the access token from the cloud object
                    sse.setAccessToken(accessToken);
                    StartEventHandler();
                    return clearInterval(myInterval);
                }
            }, 500); // Interval
            // TODO: infinite loop when the user is not authenticated
        });


        // Input event
        node.on('input', function (msg, send, done) {
            // Is the SSE connection open?
            let openConnection = (sse.eventSource !== undefined && sse.checkerInterval._destroyed === false);

            // Start or stop the event handler
            if (msg.start) {
                let accessToken = cloud.me().rest.tokenStore.accessToken;
                // Start the SSE client when the stream is closed
                if (!openConnection) {
                    if (sse.accessToken === null || sse.accessToken === undefined) {
                        // TODO: Add warning?
                        return;
                    }
                    if (sse.accessToken !== accessToken) { // Check if the token is changed
                        // Set the access token from the cloud object
                        sse.setAccessToken(accessToken);
                    }
                    // Start the event handler
                    StartEventHandler();
                    return;
                }
                // Start the SSE client again when the stream is open (Could mean the user re-authenticated)
                if (openConnection) {
                    if (sse.accessToken === accessToken) { // Check if the token is changed
                        return;
                    }
                    sse.stop();
                    // Set the access token from the cloud object
                    sse.setAccessToken(accessToken);
                    // Start the event handler
                    StartEventHandler();
                    return;
                }
            }
            // Stop the SSE client when the stream is open
            if (msg.stop && openConnection) {
                // Stop the event handler
                sse.stop();
                console.log("Event stream stopped");
                return;
            }
        });

        // Close event
        this.on('close', function (removed, done) {
            sse.stop();
            done();
        });
    }
    RED.nodes.registerType("crownstone sse client", CrownstoneSSEClient);
}

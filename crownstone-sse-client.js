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
            console.log("Event received", data);

            if (data.type === "system" && data.subType === "TOKEN_EXPIRED") {
                // Token expired. Need to reauthenticate.
            }

            // type: "system",
            // subType: "TOKEN_EXPIRED" | "NO_ACCESS_TOKEN"

            var newMsg = {};
            newMsg.payload = data;
            node.send(newMsg);
        }

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {
            cloud = globalContext.get("crownstoneCloud");
            if (cloud === undefined) { // Cloud object is not stored in global context // TODO: Check if there is a better way and compare it to the other nodes that do not have this check.
                console.log("Debug");
                var newMsg = {};
                node.error("Cloud object is not stored in global context", newMsg); // Authorization Required ?
                return;
            }

            let userInfo = cloud.me().rest.tokenStore.cloudUser; // When cloud is not defined, an error occurres. "Cannot read property 'me' of undefined"
            let email = userInfo.email;
            let passwordHash = userInfo.passwordSha1;

            (async function () {
                try {
                    // we will login to the Crownstone cloud to obtain an accessToken.
                    // It will be set automatically after successful login.
                    await sse.loginHashed(email, passwordHash); // Replace this with the same access token as the other nodes?
                    console.log(sse);

                    // Start the eventstream
                    await sse.start(eventHandler);
                    console.log(sse);
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
            })();
        });


        // Input event
        node.on('input', function (msg, send, done) {
            // Start or stop the SSE client
            if (msg.state.toLowerCase() === "on" || msg.state.toLowerCase() === "start") {
                // Start the event listener
                (async () => {
                    await sse.start(eventHandler); // TODO: Check the current state of the SSE listener
                    console.log(sse);
                    return;
                })();
            }
            if (msg.state.toLowerCase() === "off" || msg.state.toLowerCase() === "stop") {
                // Stop the event listener
                sse.stop(); // TODO: Check the current state of the SSE listener
                console.log(sse);
                return;
            }

            // Debug
            if (msg.state.toLowerCase() === "debug") { // TODO: Use something like this to check the current state of the SSE listener
                if (sse.eventSource !== undefined){
                    if (sse.checkerInterval._destroyed === true){
                        // Closed
                        console.log("Closed");
                        node.log("Closed");
                    }
                    else{
                        // Open
                        console.log("Open");
                        node.log("Open");
                    }
                }
                else{
                    // Close
                    console.log("Close");
                    node.log("Close");
                }
            }
        });

        // Close event
        this.on('close', function (removed, done) {
            if (removed) {
                // This node has been disabled/deleted
                sse.close();
            } else {
                // This node is being restarted
            }
            done();
        });
    }
    RED.nodes.registerType("crownstone sse client", CrownstoneSSEClient);
}

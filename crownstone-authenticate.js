module.exports = function (RED) {
    function CrownstoneAuthenticateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud");
        const cloud = new csLib.CrownstoneCloud();

        // Input field values
        if (node.credentials === undefined) {
            node.warn("No credentials");
            return;
        }
        var email = node.credentials.email;
        var password = node.credentials.password;
        if ((email === undefined || email === "") || (password === undefined || password === "")) {
            node.warn("No credentials");
            return;
        }


        // Login the user with the user credentials
        async function loginUser() {
            await cloud.loginHashed(email, cloud.hashPassword(password));
            var newMsg = { "start": true }; // This is to restart the Crownstone SSE client node
            node.send(newMsg);
            return;
        }

        // Authenticate at the start
        loginUser().catch((e) => {
            var newMsg = {};
            newMsg.payload = e;
            node.error("There was a problem authenticating the user", newMsg);
            return;
        });

        // Store the cloud object in global context
        var globalContext = node.context().global;
        globalContext.set("crownstoneCloud", cloud);


        // Input event. This code executes when the node gets triggered. 'msg' is the object that is received from the previous node.
        node.on('input', function (msg, send, done) {
            // Authenticate when the node is triggered
            loginUser().catch((e) => {
                msg.payload = e;
                node.error("There was a problem authenticating the user", msg);
                return;
            });
        });
    }
    RED.nodes.registerType("crownstone authenticate", CrownstoneAuthenticateNode, {
        credentials: {
            email: { type: "text" },
            password: { type: "password" }
        }
    });
}

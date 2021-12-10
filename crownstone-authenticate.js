module.exports = function (RED) {
    function CrownstoneAuthenticatetNode(config) {
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


        function loginUser(msg) {
            (async () => {
                await cloud.loginHashed(email, cloud.hashPassword(password));
            })().catch((e) => {
                msg.payload = e;
                node.error("There was a problem authenticating the user", msg);
            });
        }

        // Authenticate at the start
        var newMsg = {};
        loginUser(newMsg);


        // Store the cloud object in global context
        var globalContext = node.context().global;
        globalContext.set("crownstoneCloud", cloud);

        // Input event
        node.on('input', function (msg, send, done) {
            // Authenticate when the node is triggered
            loginUser(msg);

            done();
        });
    }
    RED.nodes.registerType("crownstone authenticate", CrownstoneAuthenticatetNode, {
        credentials: {
            email: { type: "text" },
            password: { type: "password" }
        }
    });
}

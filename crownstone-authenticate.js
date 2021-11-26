module.exports = function(RED) {
    function CrownstoneAuthenticatetNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")
        const cloud = new csLib.CrownstoneCloud();

        // Input field values
        var email = this.credentials.email;
        var password = this.credentials.password;

        // Login user
        async function loginUser() {
            await cloud.loginHashed(email, cloud.hashPassword(password));
        }
        loginUser().catch((e) => {
            node.error("There was a problem authenticating the user", msg);
        });


        // Store the cloud object in global context
        var globalContext = this.context().global;
        globalContext.set("crownstoneCloud", cloud);

        // Input event
        node.on('input', function(msg, send, done) {
            loginUser();
            
            done();
        });
    }
    RED.nodes.registerType("crownstone authenticate",CrownstoneAuthenticatetNode,{
        credentials: {
            email: {type:"text"},
            password: {type:"password"}
        }
    });
}

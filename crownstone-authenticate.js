module.exports = function(RED) {
    function CrownstoneAuthenticatetNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")
        const cloud = new csLib.CrownstoneCloud();
        var CryptoJS = require("crypto-js");

        // Input field values
        var email = this.credentials.email;
        var password = this.credentials.password;

        // Login user
        async function loginUser() {
            await cloud.loginHashed(email, CryptoJS.SHA1(password).toString());
        }
        loginUser().catch((e) => {
            console.log("There was a problem authenticating the user:", e);
            node.error("There was a problem authenticating the user");
        });


        // Store the cloud object in global context
        var globalContext = this.context().global;
        globalContext.set("crownstoneCloud", cloud)

        // Input event
        node.on('input', function(msg) {
            loginUser();
            
            node.send(msg);
        });
    }
    RED.nodes.registerType("crownstone authenticate",CrownstoneAuthenticatetNode,{
        credentials: {
            email: {type:"text"},
            password: {type:"password"}
        }
    });
}

module.exports = function(RED) {
    function CrownstoneAuthenticatetNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        const csLib = require("crownstone-cloud")
        const cloud = new csLib.CrownstoneCloud();

        var email = this.credentials.email;
        var password = this.credentials.password;

        async function loginUser() {
            //await cloud.login("danielvdd1.DVDD@gmail.com", "w_hbDa084PO!!MW");
            await cloud.login(email, password);
        }
        loginUser();



        var globalContext = this.context().global;
        if (globalContext.get("crownstoneCloud") === undefined) {
            console.log("Store cloud globaly");
            globalContext.set("crownstoneCloud", cloud)
        }

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

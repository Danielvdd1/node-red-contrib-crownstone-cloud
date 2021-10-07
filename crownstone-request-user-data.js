module.exports = function(RED) {
    function CrownstoneRequestUserData(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        const csLib = require("crownstone-cloud")

        var globalContext = this.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        node.on('input', function(msg) {
            console.log("Get cloud localy");
            

            let myUser = cloud.me();
            //console.log("User:");
            //console.log(myUser);
            msg.payload = myUser;

            node.send(msg);
        });
    }
    RED.nodes.registerType("crownstone request user data",CrownstoneRequestUserData);
}

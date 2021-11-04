module.exports = function(RED) {
    function CrownstoneRequestUserData(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Retreive the cloud object from global context
        var globalContext = this.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        // Input event
        node.on('input', function(msg, send, done) {
            let myUser = cloud.me();
            msg.payload = myUser;

            send(msg);
        });
    }
    RED.nodes.registerType("crownstone request user data",CrownstoneRequestUserData);
}

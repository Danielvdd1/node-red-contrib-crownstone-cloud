module.exports = function(RED) {
    function CrownstoneRequestUserData(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Retreive the cloud object from global context
        var globalContext = this.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {cloud = globalContext.get("crownstoneCloud");});

        // Input event
        node.on('input', function(msg, send, done) {
            let myUser = cloud.me();
            msg.payload = myUser;

            send(msg);
        });
    }
    RED.nodes.registerType("crownstone request user data",CrownstoneRequestUserData);
}

module.exports = function (RED) {
    function CrownstoneRequestUserData(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Retreive the cloud object from global context
        var globalContext = this.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {
            cloud = globalContext.get("crownstoneCloud");
            if (cloud === undefined) { // Cloud object is not stored in global context. The authentication node is not used.
                node.error("The cloud object is not stored in global context. Use the Crownstone authenticate node.");
                return;
            }
        });

        // Input event
        node.on('input', function (msg, send, done) {
            let myUser = cloud.me();
            msg.payload = myUser;

            send(msg);
        });
    }
    RED.nodes.registerType("crownstone request user data", CrownstoneRequestUserData);
}

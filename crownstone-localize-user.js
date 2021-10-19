module.exports = function(RED) {
    function CrownstoneLocalizeUser(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")

        // Input field values
        var username = config.username;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        
        // Input event
        node.on('input', function(msg) {

            async function asyncFunciton() {
                // Add localization code here.




                // Get all users in a sphere
                //let sphere = cloud.sphere("612f454b79ce050004a044b3");
                //let users  = await sphere.users();


                let sphere = cloud.sphere("612f454b79ce050004a044b3");
                let users  = await sphere.users();
                console.log(users);
                msg.payload = users;

                let user = users.admins[0];

                let location = await user.currentLocation();

                console.log(location);


                // Can I run currentLocation() on these users?



                // Localize user
                //let user = cloud.me();
                //let userLocation = await user.currentLocation();


                node.send(msg);
            }
            asyncFunciton().catch((e) => {
                if (e.statusCode === 401){
                    console.log("Authorization Required:", e);
                    node.error("Authorization Required");
                }
                else{
                    console.log("There was a problem localizing the user:", e);
                    node.warning("There was a problem localizing the user");
                }
            });
        });
    }
    RED.nodes.registerType("crownstone localize user", CrownstoneLocalizeUser);
}

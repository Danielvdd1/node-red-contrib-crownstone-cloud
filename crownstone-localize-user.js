module.exports = function(RED) {
    function CrownstoneLocalizeUser(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")

        // Input field values
        var sphereId = config.sphereId;
        var userId = config.userId;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        
        // Input event
        node.on('input', function(msg) {

            (async() => {
                // Get the sphere
                //let sphereId = "612f454b79ce050004a044b3";
                let sphere = cloud.sphere(sphereId); // TODO: Sphere selection

                // Get userId
                //let userId = "612f44c379ce050004a044a4"; // TODO: User selection


                console.log("Users in sphere locations:");
                let presentPeople = await sphere.presentPeople();
                console.log(presentPeople);

                /*
                example data for present people:
                [
                    {
                        userId: '612f44c379ce050004a044a4',
                        locations: [ '6135bac760260600040a98cb' ]
                    }
                ]
                */


                userLocation = presentPeople.find(person => person.userId === userId).locations[0];

                msg.userLocation = userLocation;

                node.send(msg);
            })().catch((e) => {
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

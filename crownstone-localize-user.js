module.exports = function(RED) {
    function CrownstoneLocalizeUser(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Input field values
        var sphereId = config.sphereId;
        var userId = config.userId;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        
        // Input event
        node.on('input', function(msg, send, done) {

            (async() => {
                // Get the sphere
                let sphere = cloud.sphere(sphereId);

                // Request present people in the sphere
                let presentPeople = await sphere.presentPeople();
                if (presentPeople.length === 0) { // No present people
                    send(msg);
                    return;
                }

                // Get location of selected user.
                let user = presentPeople.find(person => person.userId === userId);
                if (user === undefined) { // Choosen user not present
                    send(msg);
                    return;
                }
                
                if (user.locations.length === 0) { // User not in a location
                    send(msg);
                    return;
                }

                // Get location id
                let userLocationId = user.locations[0];
                msg.locationId = userLocationId;

                // Get location name
                let locations = await cloud.locations();
                let userLocationName = locations.find(location => location.id === userLocationId).name;
                msg.locationName = userLocationName;

                send(msg);
            })().catch((e) => {
                if (e.statusCode === 401){
                    console.log("Authorization Required:", e);
                    node.error("Authorization Required");
                }
                else{
                    console.log("There was a problem localizing the user:", e);
                    node.error("There was a problem localizing the user");
                }
            });
        });
    }
    RED.nodes.registerType("crownstone localize user", CrownstoneLocalizeUser);

    // This section is for the oneditprepare event in the browser to get a list of Crownstones.
    RED.httpAdmin.get("/users/:id/:sphereId", function(req,res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the durrent deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud"); // TODO: check if the global variable exists.

        let sphere = cloud.sphere(req.params.sphereId);

        (async() => {
            // Request users from the sphere
            let users = await sphere.users();

            // Map the list of users to a more compact format
            let usersMapped = [];
            for (let level in users) {
                for (let user of users[level]) {
                    usersMapped.push({"id":user.id, "firstName":user.firstName, "lastName":user.lastName});
                }
            }

            res.json({"users":usersMapped});
        })();
    });
}

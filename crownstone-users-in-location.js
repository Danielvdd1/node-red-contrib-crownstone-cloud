module.exports = function(RED) {
    function CrownstoneUsersInLocation(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Input field values
        var locationId = config.locationId;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {cloud = globalContext.get("crownstoneCloud");});

        
        // Input event
        node.on('input', function(msg, send, done) {

            (async() => {
                if (msg.locationId !== undefined){
                    locationId = msg.locationId;
                }

                // Request the sphere id from the location
                let locations = await cloud.locations(); // Note: Is it posible to avoid this delay
                let sphereId = locations.find(l => l.id === locationId).sphereId;

                // Get the sphere
                let sphere = cloud.sphere(sphereId);

                // Request present people in the sphere
                let presentPeople = await sphere.presentPeople();
                if (presentPeople.length === 0) { // No present people
                    send(msg);
                    return;
                }

                // Get users in selected location
                let users = [];
                for (let user of presentPeople) {
                    if(user.locations.find(l => l === locationId)){
                        users.push({"id":user.userId});
                    }
                }

                msg.users = users;

                // TODO: Get usernames ?

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
    RED.nodes.registerType("crownstone users in location", CrownstoneUsersInLocation);

    // This section is for the oneditprepare event in the browser to get a list of spheres.
    RED.httpAdmin.get("/locations/:id", function(req,res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the durrent deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud"); // TODO: check if the global variable exists.

        (async() => {
            // Request locations
            let locations = await cloud.locations();

            let locationsMapped = locations.map(location => ({"id":location.id, "name":location.name}));

            res.json({"locations":locationsMapped});
        })();
    });
}

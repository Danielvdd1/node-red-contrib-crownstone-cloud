module.exports = function (RED) {
    function CrownstoneLocalizeUser(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Input field values
        var sphereId = config.sphereId;
        var userId = config.userId;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => { cloud = globalContext.get("crownstoneCloud"); });


        // Input event
        node.on('input', function (msg, send, done) {

            (async () => {
                if (msg.userId !== undefined) {
                    userId = msg.userId;
                    if (msg.sphereId !== undefined) {
                        sphereId = msg.sphereId;
                    }
                }

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
                //msg.locationId = userLocationId;

                // Get location name
                let locations = await cloud.locations();
                let userLocationName = locations.find(location => location.id === userLocationId).name;
                //msg.locationName = userLocationName;

                msg.payload = { "locationName": userLocationName, "locationId": userLocationId };

                send(msg);
            })().catch((e) => {
                if (e.statusCode === 401) {
                    msg.payload = e;
                    node.error("Authorization Required", msg);
                }
                else {
                    msg.payload = e;
                    node.error("There was a problem localizing the user", msg);
                }
            });
        });
    }
    RED.nodes.registerType("crownstone localize user", CrownstoneLocalizeUser);

    // This section is for the oneditprepare event in the browser to get a list of spheres.
    RED.httpAdmin.get("/spheres/:id", function (req, res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the currently deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        if (node === null) { // Node with the given id does not exist
            res.statusCode = 400;
            res.end();
            return;
        }
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");
        if (cloud === undefined) { // Cloud object is not stored in global context
            res.statusCode = 401;
            res.end();
            return;
        }

        (async () => {
            // Request spheres
            let spheres = await cloud.spheres();

            // Map the list of spheres to a more compact format
            let spheresMapped = spheres.map(sphere => ({ "id": sphere.id, "name": sphere.name }));

            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.json(spheresMapped);
        })();
    });

    // This section is for the oneditprepare event in the browser to get a list of users.
    RED.httpAdmin.get("/users/:id/:sphereId", function (req, res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the currently deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        if (node === null) { // Node with the given id does not exist
            res.statusCode = 400;
            res.end();
            return;
        }
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");
        if (cloud === undefined) { // Cloud object is not stored in global context
            res.statusCode = 401;
            res.end();
            return;
        }

        let sphere = cloud.sphere(req.params.sphereId);
        if (sphere === undefined) { // Choosen sphere not present or accessable by this user
            res.statusCode = 403;
            res.json([]);
            return;
        }

        (async () => {
            // Request users from the sphere
            let users = await sphere.users();

            // Map the list of users to a more compact format
            let usersMapped = [];
            for (let level in users) {
                for (let user of users[level]) {
                    usersMapped.push({ "id": user.id, "firstName": user.firstName, "lastName": user.lastName });
                }
            }

            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.json(usersMapped);
        })();
    });
}

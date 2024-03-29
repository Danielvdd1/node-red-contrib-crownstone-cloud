module.exports = function (RED) {
    function CrownstoneUsersInLocation(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Input field values
        var locationId = config.locationId;

        // Retrieve the cloud object from global context
        var globalContext = node.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {
            cloud = globalContext.get("crownstoneCloud");
            if (cloud === undefined) { // Cloud object is not stored in global context. The authentication node is not used.
                node.error("The cloud object is not stored in global context. Use the Crownstone authenticate node.");
                return;
            }
        });


        // Input event. This code executes when the node gets triggered. 'msg' is the object that is received from the previous node.
        node.on('input', function (msg, send, done) {

            (async () => {
                // Overwrite a default node property with an incoming value
                if (msg.locationId !== undefined) {
                    locationId = msg.locationId;
                }

                // Request the sphere id from the location
                let locations = await cloud.locations(); // Note: This delay can be avoided by letting the user select the sphere.
                let sphereId = locations.find(l => l.id === locationId).sphereId;

                // Get the sphere
                let sphere = cloud.sphere(sphereId);

                // Request present people in the sphere
                let presentPeople = await sphere.presentPeople();
                if (presentPeople.length === 0) { // No present people
                    msg.payload = [];
                    send(msg);
                    return;
                }

                // Get users in selected location
                let users = [];
                for (let user of presentPeople) {
                    if (user.locations.find(l => l === locationId)) {
                        users.push({ "userId": user.userId });
                    }
                }
                //msg.users = users; // List of user ids

                // Get names of all users
                let allUsers = await sphere.users();
                let allUsersMapped = [];
                for (let level in allUsers) {
                    for (let user of allUsers[level]) {
                        allUsersMapped.push({ "userId": user.id, "firstName": user.firstName, "lastName": user.lastName });
                    }
                }

                // Map users to create a list of user ids and names from users that are present in a location
                let users2 = [];
                for (let user of users) {
                    let userData = allUsersMapped.find(u => u.userId === user.userId);
                    users2.push(userData);
                }
                msg.payload = users2; // List of ids, firstNames and lastNames

                send(msg);
            })().catch((e) => {
                if (e.statusCode === 401) {
                    msg.payload = e;
                    node.error("Authorization Required", msg);
                    return;
                }
                else {
                    msg.payload = e;
                    node.error("There was a problem requesting users in the location", msg);
                    return;
                }
            });
        });
    }
    RED.nodes.registerType("crownstone users in location", CrownstoneUsersInLocation);

    // This section is for the oneditprepare event in the browser to get a list of locations.
    RED.httpAdmin.get("/locations/:nodeId", function (req, res) {
        var node = RED.nodes.getNode(req.params.nodeId); // This is a reference to the currently deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        if (node === null) { // Node with the given id does not exist
            res.statusCode = 400;
            res.json({ "error": "Node with the given id does not exist" });
            return;
        }
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");
        if (cloud === undefined) { // Cloud object is not stored in global context
            res.statusCode = 401;
            res.json({ "error": "Cloud object is not available. You are unauthorized to make this request." });
            return;
        }

        (async () => {
            // Request locations
            let locations = await cloud.locations();
            // Request spheres
            let spheres = await cloud.spheres();

            // Map the list of locations to a more compact format
            let locationsMapped = [];
            for (let location of locations) {
                sphereName = spheres.find(sphere => sphere.id === location.sphereId).name;
                locationsMapped.push({ "id": location.id, "name": location.name, "sphereName": sphereName });
            }

            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.statusCode = 200;
            res.json(locationsMapped);
            return;
        })();
    });
}

module.exports = function (RED) {
    function CrownstoneSSEFilter(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Input field values
        var eventType = config.eventType; // "presence", "swith", other
        var enterExit = config.enterExit; // "enter", "exit", other
        var sphereId1 = config.sphereId1;
        var locationId = config.locationId;
        var userId = config.userId;
        var sphereId2 = config.sphereId2;
        var crownstoneId = config.crownstoneId;

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
            let event = msg.payload;

            // Check if the message object has a payload
            if (event === undefined) {
                return;
            }

            // Check if the payload contains an event
            if (event.type === undefined) {
                return;
            }

            switch (eventType) {
                case "presence": // Presence event
                    if (event.type !== "presence") {
                        break;
                    }
                    if (event.subType === "enterLocation" || event.subType === "exitLocation") {
                        if ((enterExit === "enter" && event.subType === "exitLocation") || (enterExit === "exit" && event.subType === "enterLocation")) {
                            break;
                        }
                        if (sphereId1 !== "" && event.sphere.id !== sphereId1) {
                            break;
                        }
                        if (locationId !== "" && event.location.id !== locationId) {
                            break;
                        }
                        if (userId !== "" && event.user.id !== userId) {
                            break;
                        }
                        node.send(msg);
                    }
                    else if (event.subType === "enterSphere" || event.subType === "exitSphere") {
                        if ((enterExit === "enter" && event.subType === "exitSphere") || (enterExit === "exit" && event.subType === "enterSphere")) {
                            break;
                        }
                        if (sphereId1 !== "" && event.sphere.id !== sphereId1) {
                            break;
                        }
                        if (userId !== "" && event.user.id !== userId) {
                            break;
                        }
                        node.send(msg);
                    }
                    break;

                case "switch": // Switch event
                    if (event.type === "command" || event.subType === "multiSwitch") {
                        if (sphereId2 !== "" && event.sphere.id !== sphereId2) {
                            break;
                        }
                        //if (crownstoneId !== "" && event.switchData[].id !== crownstoneId){
                        if (crownstoneId !== "" && event.switchData.find(d => d.id === crownstoneId) === undefined) { // Find a Crownstone with the Crownstone id
                            break;
                        }
                        node.send(msg);
                    }
                    else if (event.type === "switchStateUpdate" || event.subType === "stone") {
                        if (sphereId2 !== "" && event.sphere.id !== sphereId2) {
                            break;
                        }
                        if (crownstoneId !== "" && event.crownstone.id !== crownstoneId) {
                            break;
                        }
                        node.send(msg);
                    }
                    break;

                default: // Other event types
                    break;
            }
        });
    }
    RED.nodes.registerType("crownstone sse filter", CrownstoneSSEFilter);

    // This section is for the oneditprepare event in the browser to get a list of spheres.
    RED.httpAdmin.get("/spheres/:nodeId", function (req, res) {
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
            // Request spheres
            let spheres = await cloud.spheres();

            // Map the list of spheres to a more compact format
            let spheresMapped = spheres.map(sphere => ({ "id": sphere.id, "name": sphere.name }));

            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.statusCode = 200;
            res.json(spheresMapped);
            return;
        })();
    });

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

    // This section is for the oneditprepare event in the browser to get a list of users.
    RED.httpAdmin.get("/users/:nodeId/:sphereId", function (req, res) {
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

        let sphere = cloud.sphere(req.params.sphereId);
        if (sphere === undefined) { // Choosen sphere not present or accessable by this user
            res.statusCode = 403;
            res.json({ "error": "Choosen sphere not present or accessable by this user" });
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
            res.statusCode = 200;
            res.json(usersMapped);
            return;
        })();
    });

    // This section is for the oneditprepare event in the browser to get a list of Crownstones.
    RED.httpAdmin.get("/crownstones/:nodeId", function (req, res) {
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
            // Request data of all Crownstones
            let crownstones = await cloud.crownstones();

            // Map the list of crownstones to a more compact format
            let crownstonesMapped = crownstones.map(cs => ({ "id": cs.id, "name": cs.name, "location": cs.location.name, "dimming": cs.abilities.find(a => a.type === "dimming").enabled }));

            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.statusCode = 200;
            res.json(crownstonesMapped);
            return;
        })();
    });
}

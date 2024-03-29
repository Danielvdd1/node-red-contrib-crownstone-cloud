module.exports = function (RED) {
    function CrownstoneSwitchCrownstonesInLocation(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Input field values
        var locationId = config.locationId;
        var crownstoneOnOff = config.onOff;

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
                // Overwrite default node properties with incoming values
                if (msg.locationId !== undefined) {
                    locationId = msg.locationId;
                }
                if (msg.onOff !== undefined) {
                    crownstoneOnOff = msg.onOff;
                }

                let location = cloud.location(locationId);

                // Get crownstones in selected location
                let crownstones = await location.crownstones();
                let crownstoneIds = [];
                for (let crownstone of crownstones) {
                    crownstoneIds.push(crownstone.id);
                }

                // Create a list of promises to run parallel. This avoids waiting for every request individualy.
                let promises = [];
                for (let crownstoneId of crownstoneIds) {
                    let crownstone = cloud.crownstone(crownstoneId);
                    if (crownstoneOnOff) {
                        promises.push(crownstone.turnOn());
                    }
                    else {
                        promises.push(crownstone.turnOff());
                    }
                }
                await Promise.allSettled(promises); // Use allSettled to continue with other async functions after one fails. 'all' stops after a fail.

                done();
                return;
            })().catch((e) => {
                if (e.statusCode === 401) {
                    msg.payload = e;
                    node.error("Authorization Required", msg);
                    return;
                }
                else {
                    msg.payload = e;
                    node.error("There was a problem switching the Crownstones", msg);
                    return;
                }
            });
        });
    }
    RED.nodes.registerType("crownstone switch crownstones in location", CrownstoneSwitchCrownstonesInLocation);

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

module.exports = function(RED) {
    function CrownstoneSwitchCrownstone(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Input field values
        var crownstoneId = config.crownstoneId;
        var crownstoneOnOff = config.onOff;
        var crownstoneDimPercentage = config.dimPercentage;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud;

        // Wait one tick of the event loop in case the authenticate node runs later and did not yet store the cloud in global context
        setImmediate(() => {cloud = globalContext.get("crownstoneCloud");});

        
        // Input event
        node.on('input', function(msg, send, done) {

            (async() => {
                if (msg.crownstoneId !== undefined){
                    crownstoneId = msg.crownstoneId;
                }

                let crownstone = cloud.crownstone(crownstoneId);

                // Is the Crownstone dimmable
                let crownstoneData = await crownstone.data();
                let dimmable = crownstoneData.abilities.find(a => a.type === "dimming").enabled;

                // Switch the Crownstone
                if(dimmable){
                    if (msg.dimPercentage !== undefined) {
                        crownstoneDimPercentage = msg.dimPercentage;
                    }
                    else if (msg.onOff !== undefined) {
                        if(msg.onOff){
                            crownstoneDimPercentage = 100;
                        }
                        else{
                            crownstoneDimPercentage = 0;
                        }
                    }
                    await crownstone.setSwitch(crownstoneDimPercentage);
                    done();
                    return;
                }
                else{
                    if (msg.onOff !== undefined) {
                        crownstoneOnOff = msg.onOff;
                    }
                    if (crownstoneOnOff){
                        await crownstone.turnOn();
                        done();
                        return;
                    }
                    else{
                        await crownstone.turnOff();
                        done();
                        return;
                    }
                }
            })().catch((e) => {
                if (e.statusCode === 401){
                    node.error("Authorization Required", msg);
                }
                else{
                    node.error("There was a problem switching the Crownstone", msg);
                }
            });
        });
    }
    RED.nodes.registerType("crownstone switch crownstone", CrownstoneSwitchCrownstone);

    // This section is for the oneditprepare event in the browser to get a list of Crownstones.
    RED.httpAdmin.get("/crownstones/:id", function(req,res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the currently deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        if (node === null) { // Node with the given id does not exist
            res.statusCode = 400;
            res.json([]);
            return;
        }
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");
        if (cloud === undefined) { // Cloud object is not stored in global context
            res.statusCode = 400;
            res.json([]);
            return;
        }

        (async() => {
            // Request data of all Crownstones
            let crownstones = await cloud.crownstones();

            // Map the list of crownstones to a more compact format
            let crownstonesMapped = crownstones.map(cs => ({"id":cs.id, "name":cs.name, "location":cs.location.name, "dimming":cs.abilities.find(a => a.type === "dimming").enabled}));
            
            // res.setHeader('Cache-Control', 'max-age=120, public');
            res.json(crownstonesMapped);
        })()
    });
}

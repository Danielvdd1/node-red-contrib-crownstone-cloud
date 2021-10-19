module.exports = function(RED) {
    function CrownstoneSwitchCrownstone(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")

        // Input field values
        var crownstoneId = config.crownstone;
        node.context().set("crownstoneId", crownstoneId);
        var crownstoneState = config.state;
        var crownstonePercentage = config.percentage;

        // Retreive the cloud object from global context
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        /*
        async function requestCrownstones() {
            console.log("Debug: Crownstones");
            let cs = await cloud.crownstones();
            console.log(cs);
            // Lambda expression to filter the crownstones on their name and return only the id's
            //console.log(cs.map(cs => ({"name":cs.name, "id":cs.id})));
        }
        requestCrownstones().catch((e) => { console.log("There was a problem requesting Crownstone information at the beginning of the code:", e); });
        */

        
        // Input event
        node.on('input', function(msg) {

            async function asyncFunciton() {
                let crownstone  = cloud.crownstone(crownstoneId);

                // Is the Crownstone dimmable
                let crownstoneData = await crownstone.data();
                let dimmable = crownstoneData.abilities.find(a => a.type === "dimming").enabled;

                // Switch the crownstone
                if(dimmable){
                    //console.log("Dimmable: " + crownstonePercentage); // Debug
                    await crownstone.setSwitch(crownstonePercentage);
                }
                else{
                    //console.log("Not dimmable: " + crownstoneState); // Debug
                    if (crownstoneState){
                        await crownstone.turnOn();
                    }
                    else{
                        await crownstone.turnOff();
                    }
                }

                node.send(msg);
            }
            asyncFunciton().catch((e) => {
                if (e.statusCode === 401){
                    console.log("Authorization Required:", e);
                    node.error("Authorization Required");
                }
                else{
                    console.log("There was a problem switching Crownstone:", e);
                    node.warning("There was a problem switching crownstone");
                }
            });
        });
    }
    RED.nodes.registerType("crownstone switch crownstone", CrownstoneSwitchCrownstone);

    // This section is for the oneditprepare event in the browser to get a list of Crownstones.
    RED.httpAdmin.get("/crownstones/:id", function(req,res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the durrent deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud"); // TODO: check if the global variable exists.

        var selectedCrownstoneId = node.context().get("crownstoneId"); // Variables stored is context are not automaticaly updated like the other input values.


        async function asyncFunciton() {
            let crownstones = await cloud.crownstones();

            // Lambda expression to create a list of crownstone names and ids
            let crownstonesMapped = crownstones.map(cs => ({"name":cs.name, "id":cs.id, "dimming":cs.abilities.find(a => a.type === "dimming").enabled}));
            
            
            //console.log(selectedCrownstoneId); // Debug
            res.json({"crownstones":crownstonesMapped,"selectedCrownstoneId":selectedCrownstoneId});
        }
        asyncFunciton();
    });
}

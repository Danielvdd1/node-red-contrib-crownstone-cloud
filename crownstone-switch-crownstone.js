module.exports = function(RED) {
    function CrownstoneSwitchCrownstone(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        // Libraries
        const csLib = require("crownstone-cloud")

        // Input field values
        var crownstoneId = config.crownstone;
        var crownstoneState = config.state;

        // Retreive the cloud object from global context
        var globalContext = this.context().global;
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
            
            // Use this for dimmable Crownstones
            //crownstone.setSwitch(100);

            async function asyncFunciton() {

                let cs = await cloud.crownstones();
                console.log(cs);
                msg.crownstones = cs; // Debug

                let crownstone  = cloud.crownstone(crownstoneId);
                if (crownstoneState){
                    await crownstone.turnOn();
                }
                else{
                    await crownstone.turnOff();
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

    RED.httpAdmin.get("/crownstones/:id", function(req,res) {
        var node = RED.nodes.getNode(req.params.id); // This is a reference to the durrent deployed node in runtime. This does not work if the user just dragged the node on the workspace.
        var globalContext = node.context().global;
        var cloud = globalContext.get("crownstoneCloud"); // TODO: check if the global variable exists.


        async function asyncFunciton() {
            let crownstones = await cloud.crownstones();

            // Lambda expression to create a list of crownstone names and ids
            let crownstonesMapped = crownstones.map(cs => ({"name":cs.name, "id":cs.id, "dimming":cs.abilities.find(a => a.type === "dimming").enabled}));
            console.log(crownstonesMapped); // Debug
            res.json(crownstonesMapped);
        }
        asyncFunciton();
    });
}

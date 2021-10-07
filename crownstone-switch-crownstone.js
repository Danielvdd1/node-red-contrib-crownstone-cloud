module.exports = function(RED) {
    function CrownstoneSwitchCrownstone(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        const csLib = require("crownstone-cloud")

        var crownstoneName = config.crownstone;
        var crownstoneState = config.state;

        var globalContext = this.context().global;
        var cloud = globalContext.get("crownstoneCloud");

        /*async function requestCrownstoneId(name) {
            return "6135bace60260600040a98cc";
        }
        var crownstone = requestCrownstoneId(crownstoneName);
        */


        

        node.on('input', function(msg) {
            console.log(crownstoneName + ", " + crownstoneState);
            

            
            //crownstone.setSwitch(100);

            async function asyncFunciton() {

                let crownstones = await cloud.crownstones();

                // Lambda expression to filter the crownstones on their name and return only the id's
                let crownstones2 = crownstones.filter(cs => cs.name === crownstoneName).map(cs2 => cs2.id);

                // Debug information
                msg.crownstones = crownstones;
                msg.crownstones2 = crownstones2;

                // No Crownstone with the specified name
                if (crownstones2.length === 0) {
                    node.warn("No Crownstone with the specified name");
                    node.send(msg);
                }

                
                /*// Switch the first Crownstone with the specified name
                var crownstoneId = crownstones2[0];
                let crownstone  = cloud.crownstone(crownstoneId);

                if (crownstoneState){
                    await crownstone.turnOn();
                    node.send(msg);
                }
                else{
                    await crownstone.turnOff();
                    node.send(msg);
                }*/

                // Switch all Crownstones with the specified name
                async function asyncSwitchCrownstones(crownstoneId) {
                    let crownstone  = cloud.crownstone(crownstoneId);
                    if (crownstoneState){
                        await crownstone.turnOn();
                    }
                    else{
                        await crownstone.turnOff();
                    }
                }
                crownstones2.forEach(crownstoneId => {
                    console.log(crownstoneId);
                    asyncSwitchCrownstones(crownstoneId);
                });
                node.send(msg);
                
            }
            asyncFunciton();


            
        });
    }
    RED.nodes.registerType("crownstone switch crownstone",CrownstoneSwitchCrownstone);
}
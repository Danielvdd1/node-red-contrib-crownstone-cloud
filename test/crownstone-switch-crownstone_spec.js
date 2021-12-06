var helper = require("node-red-node-test-helper");
var SCNode = require("../crownstone-switch-crownstone.js");
const csLib = require("crownstone-cloud");

describe('crownstone switch crownstone Node', function () {

  afterEach(function () {
    helper.unload();
  });

  var accessToken = "";
  var crownstoneNotDimmableId = "";
  var crownstoneDimmableId = "";

  it('Load node', function (done) {
    var flow = [{id:"n1", type:"crownstone switch crownstone", name:"test name", crownstoneId:crownstoneNotDimmableId}];
    helper.load(SCNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('Cloud in global context', function (done) {
    var flow = [{id:"n1", type:"crownstone switch crownstone", name:"test name", crownstoneId:crownstoneNotDimmableId, wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(SCNode, flow, function () {
      var n1 = helper.getNode("n1");
      var n2 = helper.getNode("n2");

      n1.context().global.set("crownstoneCloud",cloud);
      setImmediate(() => {
        n2.on("input", function(msg) {
          n1.context().global.get("crownstoneCloud").should.not.equal(undefined);
          done();
        });
        n1.receive({});
      });
    });
  });

  // it('Switch crownstone', function (done) {
  //   this.timeout(5000);

  //   var flow = [{id:"n1", type:"crownstone switch crownstone", name:"test name", crownstoneId:crownstoneNotDimmableId, onOff:true}];
    
  //   const cloud = new csLib.CrownstoneCloud();
  //   cloud.setAccessToken(accessToken);

  //   helper.load(SCNode, flow, function () {
  //     var n1 = helper.getNode("n1");
  //     var n2 = helper.getNode("n2");

  //     n1.context().global.set("crownstoneCloud", cloud);
  //     setImmediate(() => {
  //       let crownstone = cloud.crownstone(crownstoneNotDimmableId);
  //       crownstone.turnOff(); // Reset

  //       setTimeout(function () {
  //         n1.receive({});

  //         setTimeout(function () {
  //           let crownstoneSwitchState = await crownstone.getCurrentSwitchState(); // TODO: asynchronous function
  //           console.log("Debug: Crownstone switch state" + crownstoneSwitchState);
  //           crownstoneSwitchState.should.equal(100);
  //           done();
  //         }, 1000);
  //       }, 1000);
  //     });
  //   });
  // });

  // it('Switch crownstone with message object', function (done) {
  //   this.timeout(5000);

  //   var flow = [{id:"n1", type:"crownstone switch crownstone", name:"test name", crownstoneId:"other Crownstone id", onOff:true}];
    
  //   const cloud = new csLib.CrownstoneCloud();
  //   cloud.setAccessToken(accessToken);

  //   helper.load(SCNode, flow, function () {
  //     var n1 = helper.getNode("n1");
  //     var n2 = helper.getNode("n2");

  //     n1.context().global.set("crownstoneCloud", cloud);
  //     setImmediate(() => {
  //       let crownstone = cloud.crownstone(crownstoneNotDimmableId);
  //       crownstone.turnOff(); // Reset

  //       setTimeout(function () {
  //         n1.receive({"crownstoneId":crownstoneNotDimmableId, "onOff":true});

  //         setTimeout(function () {
  //           let crownstoneSwitchState = await crownstone.getCurrentSwitchState(); // TODO: asynchronous function
  //           console.log("Debug: Crownstone switch state" + crownstoneSwitchState);
  //           crownstoneSwitchState.should.equal(100);
  //           done();
  //         }, 1000);
  //       }, 1000);
  //     });
  //   });
  // });
});
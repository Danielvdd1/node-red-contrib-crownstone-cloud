var helper = require("node-red-node-test-helper");
var UinLNode = require("../crownstone-users-in-location.js");
const csLib = require("crownstone-cloud");

describe('crownstone users in location Node', function () {

  afterEach(function () {
    helper.unload();
  });

  var accessToken = "";
  var sphereId = "";
  var location1Id = "";
  var location2Id = "";

  it('Load node', function (done) {
    var flow = [{id:"n1", type:"crownstone users in location", name:"test name", locationId:location1Id}];
    helper.load(UinLNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('Cloud in global context', function (done) {
    var flow = [{id:"n1", type:"crownstone users in location", name:"test name", locationId:location1Id, wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(UinLNode, flow, function () {
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

  it('Request location data', function (done) {
    var flow = [{id:"n1", type:"crownstone users in location", name:"test name", locationId:location1Id, wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(UinLNode, flow, function () {
      var n1 = helper.getNode("n1");
      var n2 = helper.getNode("n2");

      n1.context().global.set("crownstoneCloud", cloud);
      setImmediate(() => {
        n2.on("input", function(msg) {
          msg.should.have.property('payload');
          done();
        });
        n1.receive({});
      });
    });
  });
});
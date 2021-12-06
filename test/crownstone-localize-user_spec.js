var helper = require("node-red-node-test-helper");
var localizeNode = require("../crownstone-localize-user.js");
const csLib = require("crownstone-cloud");

describe('crownstone localize user Node', function () {

  afterEach(function () {
    helper.unload();
  });

  var accessToken = "";
  var userId = "";
  var sphereId = "";

  var location1Name = "";
  var location1Id = "";
  var location2Name = "";
  var location2Id = "";

  it('Load node', function (done) {
    var flow = [{id:"n1", type:"crownstone localize user", name:"test name", sphereId:sphereId, userId:userId}];
    helper.load(localizeNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('Cloud in global context', function (done) {
    var flow = [{id:"n1", type:"crownstone localize user", name:"test name", sphereId:sphereId, userId:userId, wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(localizeNode, flow, function () {
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
    //this.timeout(5000);

    var flow = [{id:"n1", type:"crownstone localize user", name:"test name", sphereId:sphereId, userId:userId, wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(localizeNode, flow, function () {
      var n1 = helper.getNode("n1");
      var n2 = helper.getNode("n2");

      n1.context().global.set("crownstoneCloud", cloud);
      setImmediate(() => {
        n2.on("input", function(msg) {
          msg.should.have.property('payload');
          
          // Specific location
          //msg.should.have.property('payload', {"locationName":location1Name,"locationId":location1Id});
          //msg.should.have.property('payload', {"locationName":location2Name,"locationId":location2Id});
          
          // One of a few locations
          msg.payload.should.be.oneOf({"locationName":location1Name,"locationId":location1Id}, {"locationName":location2Name,"locationId":location2Id});
          
          done();
        });
        n1.receive({});
      });
    });
  });

  it('Request location data with message object', function (done) {
    //this.timeout(5000);

    var flow = [{id:"n1", type:"crownstone localize user", name:"test name", wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(localizeNode, flow, function () {
      var n1 = helper.getNode("n1");
      var n2 = helper.getNode("n2");

      n1.context().global.set("crownstoneCloud", cloud);
      setImmediate(() => {
        n2.on("input", function(msg) {
          msg.should.have.property('payload');
          
          // Specific location
          //msg.should.have.property('payload', {"locationName":location1Name,"locationId":location1Id});
          //msg.should.have.property('payload', {"locationName":location2Name,"locationId":location2Id});
          
          // One of a few locations
          msg.payload.should.be.oneOf({"locationName":location1Name,"locationId":location1Id}, {"locationName":location2Name,"locationId":location2Id});
          
          done();
        });
        n1.receive({"sphereId":sphereId, "userId":userId});
      });
    });
  });
});
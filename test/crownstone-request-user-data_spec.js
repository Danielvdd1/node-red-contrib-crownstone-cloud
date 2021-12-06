var helper = require("node-red-node-test-helper");
var userDataNode = require("../crownstone-request-user-data.js");
const csLib = require("crownstone-cloud");

describe('crownstone request user data Node', function () {

  afterEach(function () {
    helper.unload();
  });

  var accessToken = "";

  it('Load node', function (done) {
    var flow = [{id:"n1", type:"crownstone request user data", name:"test name"}];
    helper.load(userDataNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('Cloud in global context', function (done) {
    var flow = [{id:"n1", type:"crownstone request user data", name:"test name", wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(userDataNode, flow, function () {
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

  it('Request user data', function (done) {
    var flow = [{id:"n1", type:"crownstone request user data", name:"test name", wires:[["n2"]]},
    {id:"n2", type:"helper", wires:[]}];
    
    const cloud = new csLib.CrownstoneCloud();
    cloud.setAccessToken(accessToken);

    helper.load(userDataNode, flow, function () {
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
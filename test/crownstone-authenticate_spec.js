var helper = require("node-red-node-test-helper");
var authNode = require("../crownstone-authenticate.js");

describe('crownstone authenticate Node', function () {

  afterEach(function () {
    helper.unload();
  });

  var credentialEmail = "";
  var credentialPassword = "";
  
  var credentials = {n1: {'email': credentialEmail, 'password': credentialPassword}};
  var credentialsWrong = {n1: {'email': credentialEmail, 'password': "wrong password"}};

  it('Load node', function (done) {
    var flow = [{ id: "n1", type: "crownstone authenticate", name: "test name"}];
    helper.load(authNode, flow, credentials, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name');
      done();
      return;
    });
  });

  it('Should set cloud in global context', function (done) {
    var flow = [{ id: "n1", type: "crownstone authenticate", name: "test name"}];
    helper.load(authNode, flow, credentials, function() {
      var n1 = helper.getNode("n1");
      
      setImmediate(() => {
        n1.context().global.get("crownstoneCloud").should.not.equal(undefined);
        done();
      });
    });
  });

  it('Should authenticate and request token', function (done) {
    this.timeout(5000);

    var flow = [{ id: "n1", type: "crownstone authenticate", name: "test name"}];
    helper.load(authNode, flow, credentials, function() {
      var n1 = helper.getNode("n1");
      
      setTimeout(function () {
        n1.context().global.get("crownstoneCloud").rest.tokenStore.should.have.property("accessToken")
        done();
      }, 1000);
    });
  });

  it('Should not authenticate user with wrong credentials', function (done) {
    this.timeout(5000);

    var flow = [{ id: "n1", type: "crownstone authenticate", name: "test name"}];
    helper.load(authNode, flow, credentialsWrong, function() {
      var n1 = helper.getNode("n1");
      
      setTimeout(function () {
        n1.context().global.get("crownstoneCloud").rest.tokenStore.should.not.have.property("accessToken")
        // TODO: catch the warning.
        done();
      }, 1000);
    });
  });

  it('Should warn the user about wrong credentials', function (done) {
    this.timeout(5000);

    var flow = [{ id: "n1", type: "crownstone authenticate", name: "test name"}];
    helper.load(authNode, flow, credentialsWrong, function() {
      var n1 = helper.getNode("n1");
      
      setTimeout(function () {
        n1.error.should.be.called()
        done();
      }, 1000);
    });
  });


  
});

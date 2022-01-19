# Example flows

Flows can be exported as json. This json text can be shared and imported on other Node-RED installations.

To import an example flow, go to the hamburger menu in Node-RED and click on import. Go to examples and select an exasmple flow from the node-red-contrib-crownstone-cloud repository. Press on import and place the flow in the editor.


## Authentication flow
Authenticates the user and starts the event stream.

Enter credentials for the [Crownstone cloud](https://cloud.crownstone.rocks/) in the authentication node. After deploying, the user gets automatically authenticated.

The flow has the option to manually re-authenticate the user and to start and stop the event stream.

When the access token expires. The Crownstone nodes will give an error that will be caught by the catch node. This will trigger the Crownstone authentication node to automatically re-authenticate the user.



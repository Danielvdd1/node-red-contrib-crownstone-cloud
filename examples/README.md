# Example flows

Flows can be exported as json. This json text can be shared and imported on other Node-RED installations.

To import a flow, go to the hamburger menu in Node-RED and click on import. Enter the json text or select a json file and press on import.


## Architecture
Authenticates the user and starts the event stream.

Enter credentials for the [Crownstone cloud](https://cloud.crownstone.rocks/) in the authentication node. After deploying, the user gets automatically authenticated.

The flow has the option to manually re-authenticate the user and to start and stop the event stream.

When the access token expires. The Crownstone nodes will give an error that will be caught by the catch node. This will trigger the Crownstone authentication node to automatically re-authenticate the user.



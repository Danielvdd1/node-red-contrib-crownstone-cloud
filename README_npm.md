# Node-RED Crownstone integration

A set of [Node-RED](http://nodered.org) nodes to make use of Crownstones. The nodes use the Crownstone REST API to communicate with the [Crownstone cloud](http://cloud.crownstone.rocks).
Visit our [website](http://crownstone.rocks) for more information about our product.

[Crownstone](http://crownstone.rocks) is a company that produces a smart plug that is built into the wall. This device, called Crownstone, makes it possible to switch devices, measure power usage and localize users.

The functionalities from the Crownstones can be used by communicating via Bluetooth or by communicating with the cloud. With Bluetooth is the connection faster than via the cloud but the Cloud is reachable from everywhere in the world. Power usage data is only available via Bluetooth. The nodes in this module use the **Crownstone cloud**.


## Features
The nodes in this module use the **Crownstone cloud**.

 - Switch and dim Crownstones
 - Localization
 - Receive events


## Install
To install, either use the manage palette option in the editor, or run the following command in your Node-RED user directory - typically `~/.node-red`

        cd ~/.node-red
        npm install node-red-contrib-crownstone-cloud


## Usage
Drag and drop the nodes in Node-RED.
Information about the individual nodes is added to the node. This is visible in the info tab in Node-RED.

Example flows are added to the examples folder.


### Authentication node
Authenticates the user.
#### Input
 - Email
 - Password

### Switch Crownstone node
Switch or dim a Crownstone.
#### Input
 - Crownstone name or `msg.crownstoneId` of type *string*

Depending on if the Crownstone is dimmable:
 - New state or `msg.onOff` of type *boolean*
 - Dim percentage or `msg.dimPercentage` of type *number*/*string*

### Localize user node
Get the location of a user.
#### Input
 - Sphere or `msg.sphereId` of type *string*
 - Username or `msg.userId` of type *string*
#### Output
 - `msg.payload` containing `{"locationId":string, "locationName":string}`

### Users in location node
Get a list of users in a location.
#### Input
 - Sphere or `msg.sphereId` of type *string*
 - Location or `msg.locationId` of type *string*
#### Output
 - `msg.payload` containing a list of users `[{"userId":string, "firstName":string, "lastName":string}, ...]`

### Switch Crownstones in location node
Switch all Crownstones in a location.
#### Input
 - Location name or `msg.locationId` of type *string*
 - New state or `msg.onOff` of type *boolean*


### SSE client node
Receive events from the cloud.
#### Input
 - `msg.start` of type *boolean*
 - `msg.stop` of type *boolean*
#### Output
 - `msg.payload` containing event information

### SSE filter node
Filter incoming events from the SSE client node.
#### Input
 - `msg.payload` containing event information
#### Output
 - `msg.payload` containing event information


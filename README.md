# Node-RED Crownstone integration
<img src="/icons/crownstone_logo_black.svg#gh-light-mode-only" alt="Crownstone logo dark" width="50%"/><img src="/icons/crownstone_logo_white.svg#gh-dark-mode-only" alt="Crownstone logo light" width="50%"/><img src="/images/node-red-icon.svg" alt="drawing" width="50%"/>


## About
This repository contains Node-RED nodes that make it possible to use Crownstone features in Node-RED. The nodes communicate with the Crownstone Cloud.

[Crownstone](http://crownstone.rocks) is a company that produces a smart plug that is built into the wall. This device, called Crownstone, makes it possible to switch devices, measure power usage and localize users. To extend the functionality, integrations with other smart home products are made.

[Node-RED](http://nodered.org) is opensource software that makes it easy to program with hardware, APIs, and other online services. It can be installed on almost any operating system like Windows, MacOS, Linux. So, it can also be installed on a Raspberry Pi or a server. A node.js installation is required. The program environment is available via a browser. Node-RED is often used by hobbyists that work with home automation. It is very easy to use Node-RED because the programming is done with nodes.

Some use cases:
- Someone wants to use social media to control a device.
- Someone wants to do an action with their smart home when someone gets home.
- Someone wants to keep track of how busy it is in a location and create a graph from it.
- Someone made a dashboard in Node-RED to control their home and wants to add Crownstones.
This and more is possible with the wide support of nodes available in Node-RED.

The functionalities from the Crownstones can be used by communicating via Bluetooth or by communicating with the cloud. With Bluetooth is the connection faster than via the cloud but the Cloud is reachable from everywhere in the world. Power usage data is only available via Bluetooth.


## Features
This repository contains nodes to make use of the Crownstones using the Crownstone Cloud. These nodes make use of the REST API and Server-Sent Events. Measuring power usage is not possible via the cloud.

The nodes in this repository make it possible to do the following things:
 - Switch and dim Crownstones
 - Switch all Crownstones in a location
 - Get location of a user
 - Get a list of users in a location
 - Receive events
 - Filter events (Switch and presence events)


## Install
Follow these [instructions](https://nodered.org/docs/getting-started/local) for instructions on how to install Node-RED. An installation of Node.js is required.

### Automatically
To install, either use the manage palette option in the editor, or run the following command in your Node-RED user directory - typically `~/.node-red`

        cd ~/.node-red
        npm install node-red-contrib-crownstone-rest-api

### Manually
Clone the code from this repository. Install the nodes by running the following command in your Node-RED user directory - typically `~/.node-red`

        cd ~/.node-red
        npm install <path to the cloned project folder>


## Included nodes

- **Authentication node**: Authenticates the user.
- **Switch Crownstone node**: Switch or dim a Crownstone.
- **Localize user node**: Get the location of a user.
- **Users in location node**: Get a list of users in a location.
- **Switch Crownstones in location node**: Switch all Crownstones in a location.
- **SSE client node**: Receive events from the cloud.
- **SSE filter node**: Filter incoming events from the SSE client node.


----

![dashboard](/images/use_case_dashboard.png)

![Switch devices depending on the presence of a user](/images/use_case_sse.png)

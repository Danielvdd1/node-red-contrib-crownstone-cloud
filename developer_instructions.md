# Node-RED developer introduction

Installation instructions for Node-RED: https://nodered.org/docs/getting-started/local
Create nodes: https://nodered.org/docs/creating-nodes/


## Architecture
![Node-RED](/images/nodered_diagram.png)
This is a simplifies version of a Node-RED installation. The main system has Node.js and Node-RED installed. The programming interface of Node-RED is accessed via a browser. Node.js can use the hardware of the system to communicate over the internet and Bluetooth, or use other connected hardware.


## File structure
A node is created with 3 files.
- 'package.json' This is a standard file used by Node.js modules to describe their contents.
- 'node-name.html' This file contains the node definition, html of the properties menu and the help text.
- 'node-name.js' This file contains the code for the inner behavior of the node.

Visit this [webpage](https://nodered.org/docs/creating-nodes/first-node/) for more information and an example.

Other directories:
- 'icons/' This directory contains the icon used for the nodes.
- 'examples/' This directory contains example flows.
- 'test/' This directory contains tests. Explained in a later section.


## Authentication
Authentication is done with the Crownstone authenticate node. The user needs to enter their credentials for the [Crownstone cloud](https://cloud.crownstone.rocks/).
In the background a Crownstone cloud object is created and an access token is requested from the cloud. The cloud object is stored in global context so all Crownstone nodes can access this object to use the REST API. Also, the Crownstone SSE client node uses the same access token, so they expire at the same time and reauthenticate at the same time.


## Testing
Tests are done with manual tests.

Some unit tests are made.
Open a terminal and go the main folder of this repository. Run the tests with 'npm test'.

Unit tests only test the working of a node and not test the graphical part of a node.

## HTTP endpoints
When the properties menu of a node is opened, the node in the browser receives an oneditprepare event. This calls a function that can be used to prepare the HTML of the properties menu. This code runs in the browser. In the case of some Crownstone nodes, the lists need to be filled with items. These items need to be requested from the Cloud. The node code in the browser does not have access to the cloud object. This is solved by making an http endpoint with the httpAdmin feature to give the list of items.

The items are requested from the Node-RED server with http requests. This is a simple API for the nodes. All HTTP endpoints are explained [here](API.md).

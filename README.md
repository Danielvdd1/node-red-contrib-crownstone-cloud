# Node-RED Crownstone integration

A set of [Node-RED](http://nodered.org) nodes to make use of Crownstones. The nodes use the Crownstone REST API to cummunicate with the [Crownstone cloud](http://cloud.crownstone.rocks).
Visit our [website](http://crownstone.rocks) for more information about our product.

## Features
 - Switch and dim Crownstones
 - Localization

## Install
To install, either use the manage palette option in the editor, or run the following command in your Node-RED user directory - typically `~/.node-red`

        cd ~/.node-red
        npm install node-red-contrib-crownstone-rest-api


## Usage

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
 - Dim percentage or `msg.dimPercentage` of type *string*

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
 - `msg.payload` containing a list of users `[{"userId":string, "firstName":string, "lastName":string},...]`


## Disclaimer
This repository is in the test phase.

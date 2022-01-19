
**Get list of spheres**
----
  Returns a list of spheres that are available to the authenticated user.

* **URL**

  /spheres/:nodeId

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `nodeId=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[{ "id": string, "name": string }, ...]`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{ error : "Node with the given id does not exist" }`

  OR

  * **Code:** 401 Unauthorized <br />
    **Content:** `{ error : "Cloud object is not available. You are unauthorized to make this request." }`

* **Sample Call:**

  ```javascript
    var nodeId = this.id;
    $.getJSON('spheres/' + nodeId, function (data) {
        for (let sphere of data) {
            console.log(sphere);
        }
    });
  ```


**Get list of users**
----
  Returns a list of users in a sphere that are available to the authenticated user.

* **URL**

  /users/:nodeId/:sphereId

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `nodeId=[integer]`
   `sphereId=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[{ "id": string, "firstName": string, "lastName": string }, ...]`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{ error : "Node with the given id does not exist" }`

  OR

  * **Code:** 401 Unauthorized <br />
    **Content:** `{ error : "Cloud object is not available. You are unauthorized to make this request." }`

  OR

  * **Code:** 403 Forbidden <br />
    **Content:** `{ error : "Choosen sphere not present or accessable by this user" }`

* **Sample Call:**

  ```javascript
    var nodeId = this.id;
    var sphereId = "xxxxxxxxxxxxxxxxxxxxxxxx";
    $.getJSON('users/' + nodeId + '/' + sphereId, function (data) {
        for (let user of data) {
            console.log(user);
        }
    });
  ```


**Get list of locations**
----
  Returns a list of locations that are available to the authenticated user.

* **URL**

  /locations/:nodeId

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `nodeId=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[{ "id": string, "name": string, "sphereName": string }, ...]`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{ error : "Node with the given id does not exist" }`

  OR

  * **Code:** 401 Unauthorized <br />
    **Content:** `{ error : "Cloud object is not available. You are unauthorized to make this request." }`

* **Sample Call:**

  ```javascript
    var nodeId = this.id;
    $.getJSON('locations/' + nodeId, function (data) {
        for (let location of data) {
            console.log(location);
        }
    });
  ```


**Get list of Crownstones**
----
  Returns a list of Crownstones that are available to the authenticated user.

* **URL**

  /crownstones/:nodeId

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `nodeId=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `[{ "id": string, "name": string, "location": string, "dimming": boolean }, ...]`
 
* **Error Response:**

  * **Code:** 400 Bad Request <br />
    **Content:** `{ error : "Node with the given id does not exist" }`

  OR

  * **Code:** 401 Unauthorized <br />
    **Content:** `{ error : "Cloud object is not available. You are unauthorized to make this request." }`

* **Sample Call:**

  ```javascript
    var nodeId = this.id;
    $.getJSON('crownstones/' + nodeId, function (data) {
        for (let crownstone of data) {
            console.log(crownstone);
        }
    });
  ```


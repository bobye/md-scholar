###License
>**This code is released under the MIT license. No guarantees are meant or implied. Use at your own risk.**

###Installation

This is the setup I'm using to host Pencil++. It might or might not work well for you.

* Nginx serves the static client side files (everything in the client directory).
* Requests to the server API are proxied via Nginx to nodejs(as upstream), dblp, and arXiv
* The node app requires the 'pg' package and some external packages, see server/package.json. 
* Create a postgres table with schema:
	* id SERIAL PKEY
	* note VARCHAR(3000)
	* hash VARCHAR UNIQUE
* Run appexpress.js using node.


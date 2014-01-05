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


Sample configuration for Nginx

    upstream app_nodejs {
	server localhost:20661;
    }

    server {
        listen             17735;
        passenger_enabled  off;
        server_name        localhost;

	location / {
		root  /home/robo/webapps/pencil_client/pencil/client;
		try_files 	$uri /index.html;
	}
	location /api {
		proxy_pass http://app_nodejs;
	}
	location /login {
		proxy_pass http://app_nodejs;
	}
	location /logout {
		proxy_pass http://app_nodejs;
	}

	location /dblp {
		proxy_pass http://dblp.uni-trier.de/rec/bibtex;
	}
	location /arxiv {
		proxy_pass http://export.arxiv.org/api;
	}
    }


Pencil - A Simple, Distraction Free Markdown Editor
========================================

I made Pencil because I needed an ** *immersive, distraction free and simple* ** environment to write out my ideas, blog posts, notes etc. Most of the 'distraction-free' editors available did not satisfy me. They either had interfaces that got in the way, or had hideous backgrounds, or had color schemes that hurt my eye. To top it off they were impossible to use on my phone or iPad. 

So, here's [Pencil](http://pencil.asleepysamurai.com). Handles the **tab key** properly, easy to use on any screen size and **extremely minimal interface**.

Just you, your text and Markdown.

Usage:

* Type all you want in edit mode. Markdown is supported.
* To preview, hit Ctrl/Cmd+P or click/tap to the right of the text. Do it again to get back in edit mode.
* To save, hit Ctrl/Cmd+S or click/tap to the left of the text. Save the URL you get.
* To edit your note later, just visit the URL of the note.
* Append #p to a URL to open it in Preview mode.

Our users are positively *gushing* about us:

>This is super awesome! If only, I had had Pencil before the elections, 
>I might have actually won!

>Matt Baloney, 2012 Presidential Contestant

*P.S.: Hit F11 for heaven ;)*

###License
>**This code is released under the MIT license. No guarantees are meant or implied. Use at your own risk.**

If you are using Pencil in your project, I would be really happy if you could link to this github repo. It's not mandatory, just a request.

###Installation

This is the setup I'm using to host Pencil. It might or might not work well for you.

* Nginx serves the static client side files (everything in the client directory).
* Requests to the server API are proxied via Nginx to nodejs(as upstream), dblp, and arXiv
* The node app requires the 'pg' package and some external packages, see server/package.json. 
* Create a postgres table with schema:
	* id SERIAL PKEY
	* note VARCHAR(3000)
	* hash VARCHAR UNIQUE
* Run appexpress.js using node.


Sample configuration for Nginx
```
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
```


*A (hopefully) quality product from a sleepy samurai*

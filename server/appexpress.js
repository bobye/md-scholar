var http = require('http');
var url = require('url');
var pg = require('pg');
var fs = require('fs');
var config = require('./config.js');
var conString = config.conString;

var express = require('express');
var app = express();

var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;

var users = config.users;

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
	fn(null, users[idx]);
    } else {
	fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
	var user = users[i];
	if (user.username === username) {
	    return fn(null, user);
	}
    }
    return fn(null, null);
}

// set strategies
passport.use(new LocalStrategy(
    function(username, password, done) {
	// asynchronous verification, for effect...
	process.nextTick(function () {
	    
	    // Find the user by username.  If there is no user with the given
	    // username, or the password is not correct, set the user to `false` to
	    // indicate failure and set a flash message.  Otherwise, return the
	    // authenticated `user`.
	    findByUsername(username, function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
		if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
		return done(null, user);
	    })
	});
    }
));

// middleware
app.configure(function() {
    app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    //app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});


app.enable('trust proxy');

// (de)serializeUser
passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    findById(id, function(err, user) {
	done(err, user);
    });
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.domain);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


app.post('/login', 
	 passport.authenticate('local', { failureRedirect: '/hello.txt'}),
	 function(req, res) {
	     req.session.IDs = [];// create list of POST.id
	     res.redirect('/');
	 });

/*
  app.get('/login', function(req,res) { // display login menu
  });
*/
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/', function(req, res) {
    console.log(req.session.passport);
    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('This server does not accept GET requests.');	
});


app.post('/api/note/edit', function(req, res) {
    pg.connect(conString, function(err, client, done){
        if(err){
            res.writeHead(500);
            res.end();
        }
        else{
	    var POST = req.body;
	    var hash = Date.now().toString(36)+parseInt(Math.random()*1000).toString(36);
	    var q = 'INSERT INTO notes (note, hash) VALUES ($1, $2)';
	    if(POST.id && POST.id.length > 0)
		q = 'UPDATE notes SET note = $1 WHERE hash = $2', hash = POST.id;
	    v = [POST.t, hash];
	    
	    client.query(q + ' RETURNING id', v, function(err, result){
		if (result && result.rows.length > 0) {
		    res.writeHead(200, {'Content-Type': 'text/plain'});
		    res.end(hash);
		}
		else if (req.session.passport.user) {
		    // working with filesystem may not be a good idea
		    var filePath = 'notes/' + req.session.passport.user + '/' + POST.id + '.md';
		    fs.exists(filePath, function (exists) {
			if (exists) {
			    console.log('File exists');
			    fs.writeFileSync(filePath, POST.t);
			    res.writeHead(200, {'Content-Type': 'text/plain'});
			    res.end(hash);					    
			} else {
			    console.log('File not exists');
			    res.writeHead(404);
			    res.end();
			}
		    });		    
		}
		else if (err || !result.rows){
		    res.writeHead(500);
		    res.end();
		}

	    });
	}
	done();						
    });	
});

app.post('/api/note/get', function(req, res) {
    var POST = req.body;
    pg.connect(conString, function(err, client, done){
        if(err){
            res.writeHead(500);
            res.end();
        }
        else{
	    if(POST.id && POST.id.length > 0){
		client.query('SELECT * FROM notes WHERE hash=$1', [POST.id], function(err, result){
		    if (err) {
			res.writeHead(500);
			res.end();
		    }
		    else if (result.rows && result.rows.length > 0) {//retrieve from postgres
			//res.writeHead(200, {'Content-Type': 'text/plain'});
			console.log('import');
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(result.rows[0].note);
		    }
		    else {
			// working with filesystem may not be a good idea
			var filePath = 'notes/' + req.session.passport.user + '/' + POST.id + '.md';
			fs.exists(filePath, function (exists) {
			    if (exists) {
				/* insert to the head of array */
				var present = req.session.IDs.indexOf(POST.id);
				if (present>-1) req.session.IDs.splice(present, 1);
				req.session.IDs.unshift(POST.id);
				//req.session.IDs.push(POST.id);
				if (req.session.IDs.length > 20) 
				    req.session.IDs.pop();

				//console.log(req.session.IDs);

				console.log('File exists');
				data = fs.readFileSync(filePath);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(data);					    
			    } else {
				filePath = 'notes/0/' + POST.id + '.md';
				fs.exists(filePath, function (exists) {
				    if (exists) {
					//read only
					//console.log('File exists');
					data = fs.readFileSync(filePath);
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end(data);					    
				    }
				    else {
					console.log('File not exists');
					res.writeHead(404);
					res.end();
				    }
				});
			    }
			});
		    }
		});
	    }		  
	}
	done();						
    })});

// registered user only methods
app.post('/api/note/create', function(req, res) {
    // working with filesystem may not be a good idea
    var POST = req.body;
    if (!req.session.passport.user) {
	console.log('unauthorized');
	res.writeHead(401);
	res.end();
    }
    else {
	var filePath = 'notes/' + req.session.passport.user + '/' + POST.id + '.md';
	fs.exists(filePath, function (exists) {
	    if (exists) {
		console.log('File exists');
		res.writeHead(500);
		res.end();					    
	    } else {
		console.log('File not exists');
		//create file
		var present = req.session.IDs.indexOf(POST.id);
		if (present>-1) req.session.IDs.splice(present, 1);
		req.session.IDs.unshift(POST.id);
		//req.session.IDs.push(POST.id);
		if (req.session.IDs.length > 20) 
		    req.session.IDs.pop();

		//console.log(req.session.IDs);

		fs.writeFileSync(filePath, POST.t);		
		res.writeHead(201);
		res.end(POST.id);
	    }
	});	
    }	    
});

app.post('/api/note/history', function(req, res) {
    res.writeHead(200);
    res.write(JSON.stringify(req.session.IDs));
    res.end();
});

app.post('/api/note/rename', function(req, res) {
});
app.post('/api/note/delete', function(req, res) {
});

app.get('/hello.txt', function(req, res){
    res.send('Hello World');
});

app.listen(config.port);
console.log('Server listening at port ' + config.port.toString());

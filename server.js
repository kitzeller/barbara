// Import
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const helmet = require('helmet');
const dotenv = require('dotenv');
dotenv.config();

// Mongo
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

var User = require('./models/user');
var Session = require('./models/session');

const app = express();
var port = process.env.PORT || 3000;

var http = require('http').Server(app);
http.listen(port, function () {
    console.log('listening on *:' + port);
});

// Middleware
app.use(express.static('public', {}));
app.use(favicon(path.join(__dirname, 'public', 'icon.png')));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json());
// app.use(bodyParser({limit: '50mb'}));
app.use(cookieParser());
app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(responseTime());
app.use(helmet());
app.use(compression());

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'html');

/**
 * Login
 */
passport.use('login', new LocalStrategy(
    function (username, password, done) {
        // check in mongo if a user with username exists or not
        User.findOne({'username': username},
            function (err, user) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log the error and redirect back
                if (!user) {
                    console.log('User Not Found with username ' + username);
                    return done(null, false, {message: 'No user found'});
                }

                if (password !== user.password) {
                    return done(null, false, {message: 'Invalid username & password.'});
                }

                // User and password both match, return user from done method
                return done(null, user);
            }
        );
    }
));

/**
 * Signup
 */
passport.use('signup', new LocalStrategy(
    {
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        findOrCreateUser = function () {
            // find a user in Mongo with provided username
            User.findOne({'username': username}, function (err, user) {
                // In case of any error, return using the done method
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: ' + username);
                    return done(null, false, {message: 'user exists.'});
                } else {
                    // if there is no user with that email create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.username = username;
                    newUser.password = password;
                    newUser.email = req.param('email');
                    newUser.firstName = req.param('firstName');
                    newUser.lastName = req.param('lastName');

                    // save the user
                    newUser.save(function (err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        }
                        console.log('User Registration succesful');
                        return done(null, newUser);
                    });
                }
            });
        };
        // Delay the execution of findOrCreateUser and execute the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
    }
));

// only the user ID is serialized and added to the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// for every request, the id is used to find the user, which will be restored
// to req.user.
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


/**
 * Routes
 */

app.get('/',
    loggedIn,
    function (req, res) {
        console.log("/ called");
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

app.get('/main',
    loggedIn,
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

// app.get('/me',
//     loggedIn,
//     function (req, res) {
//         res.sendFile(path.join(__dirname + '/public/profile.html'));
//     });

/**
 * Login & Sign-up
 */

// app.get('/login',
//     function (req, res) {
//         res.sendFile(path.join(__dirname + '/public/login.html'));
//     });
//
// app.post('/login',
//     passport.authenticate('login', {failureRedirect: '/'}),
//     function (req, res) {
//         res.redirect('/main');
//     });
//
// app.post('/signup',
//     passport.authenticate('signup', {failureRedirect: '/'}),
//     function (req, res) {
//         res.status(200).json({status: "ok"});
//     });
//
// app.get('/logout',
//     function (req, res) {
//         req.logout();
//         res.redirect('/');
//     });
//
/**
 * Save Session
 */
app.post('/savesession',
    function (req, res) {
        console.log(req.body);
        var session = new Session(req.body);
        session.save(function (err) {
            if (err) return handleError(err);
            console.log("saved session");
            res.status(200).json({status: "ok"});
        });
    });
//
// /**
//  * Deletes
//  */
// app.delete('/', function (req, res) {
//     console.log("DELETE");
//     console.log(req.query.id);
//
//     Session.deleteOne({"_id": req.query.id}, function (err, res) {
//     });
//     res.send('DELETE request to homepage');
// });
//
// /**
//  * Updates
//  */
// app.put('/', function (req, res) {
//     console.log("PUT");
//     console.log(req.body);
//     Session.updateOne({_id: req.body.id}, {hydra: req.body.hydra}, function (err, res) {
//     });
//     res.send('PUT request to homepage');
// });
//
/**
 * Get Sessions
 */
app.get('/sessions',
    function (req, res) {

        Session.find({}, function (err, data) {
            //console.log(data)
            res.send(data);
        })
        // console.log(req.query);
        // if (req.query.name) {
        //     Session.find({user: req.query.id, name: req.query.name}, function (error, data) {
        //         res.send(data);
        //     });
        // } else {
        //     Session.find({user: req.query.id}, function (error, data) {
        //         res.send(data);
        //     });
        // }
    });
//
// app.get('/loggeduser', function (req, res) {
//     if (req.user === undefined) {
//         // The user is not logged in
//         res.json({});
//     } else {
//         res.json({
//             username: req.user
//         });
//     }
// });


/**
 * Custom middleware
 * @param req
 * @param res
 * @param next
 */
function loggedIn(req, res, next) {
    console.log(req.user);
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

/**
 * Code for Barbara VM Server
 * @author Kit Zellerbach
 */

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
const { TwitterApi } = require('twitter-api-v2');
dotenv.config();

const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_KEY,
    accessSecret: process.env.ACCESS_SECRET
});
// Enable read and write permissions
const rwClient = client.readWrite;

// Mongo
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

// CHANGE from 1.x: need to pass in mongoose instance
var deepPopulate = require('mongoose-deep-populate')(mongoose);

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
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
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
        User.findOne({ 'username': username },
            function (err, user) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log the error and redirect back
                if (!user) {
                    console.log('User Not Found with username ' + username);
                    return done(null, false, { message: 'No user found' });
                }

                user.comparePassword(password, (error, isMatch) => {
                    if (!isMatch) {
                        console.log("Wrong password")
                        return done(null, false, { message: 'Invalid username & password.' });
                    }
                    return done(null, user);
                });
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
            User.findOne({ 'username': username }, function (err, user) {
                // In case of any error, return using the done method
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: ' + username);
                    return done(null, false, { message: 'user exists.' });
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
    function (req, res) {
        console.log("/ called");
        res.sendFile(path.join(__dirname + '/public/intro.html'));
    });

app.get('/about',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/about.html'));
    });


app.get('/playground',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/editor.html'));
    });

app.get('/editor',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/editor.html'));
    });

app.get('/target_lang',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/target_lang.html'));
    });

app.get('/tutorial',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/tutorial.html'));
    });

app.get('/quilting',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/quilting.html'));
    });

app.get('/variants',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/variants.html'));
    });

/**
 * Login & Sign-up
 */

app.get('/login',
    function (req, res) {
        res.sendFile(path.join(__dirname + '/public/intro.html'));
    });

app.post('/login',
    passport.authenticate('login', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('back');
    });

app.post('/signup',
    passport.authenticate('signup', { failureRedirect: '/' }),
    function (req, res) {
        res.status(200).json({ status: "ok" });
    });

app.get('/logout',
    function (req, res) {
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('back');
        });
    });

/**
 * Twitter
 */

app.post('/tweet', async function (req, res) {
    try {
        // Split the base64 image string from the 'img' field in the request body
        const base64Data = req.body.img.split(",")[1]; // Get the data part after the comma

        // Upload the media to Twitter
        const mediaId = await rwClient.v1.uploadMedia(Buffer.from(base64Data, 'base64'), { type: 'png' });

        // If media upload is successful, post a tweet with the media
        const tweetText = "A new pattern by " + req.body.name + " at https://www.barbara.graphics/playground?id=" + req.body.id;
        const tweet = await rwClient.v2.tweet(tweetText, { media: { media_ids: [mediaId] } });

        console.log("Successfully tweeted an image!");
        // Return tweet id to give user tweet url
        res.status(200).json({ id: tweet.data.id });
    } catch (error) {
        console.error("Failed to post tweet: ", error);
    }
});

/**
 * Save Session
 * TOOD: Refactor this mess
 */
app.post('/savesession',
    function (req, res) {
        var session = new Session(req.body);
        console.log(req.body);
        if (req.body.parent) {
            Session.findOne({ _id: req.body.parent }, function (err, parentSession) {
                session.parent = parentSession;
                parentSession.children.push(session);
                parentSession.save().then(() => {
                    session.save().then(() => {
                        console.log("saved session w/ parent & children");
                        if (req.body.user) {
                            User.findOne({ _id: req.body.user }, function (err, user) {
                                if (err) {
                                    console.log('Error: ' + err);
                                    res.status(400);
                                    throw err;
                                }
                                // Save to user
                                console.log(user);
                                user.sessions.push(session._id);
                                user.save(function (err) {
                                    if (err) {
                                        console.log('Error: ' + err);
                                        res.status(400);
                                        throw err;
                                    }
                                    // Seems like sending the session back exceeds the stack size
                                    res.status(200).json(session._id);
                                }
                                )
                            });
                        } else {
                            res.status(200).json(session._id);
                        }
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            });
        } else {
            session.save(function (err) {
                if (err) {
                    res.status(400);
                    throw err;
                }
                console.log("saved session w/out parent & children");
                if (req.body.user) {
                    User.findOne({ _id: req.body.user }, function (err, user) {
                        if (err) {
                            console.log('Error: ' + err);
                            res.status(400);
                            throw err;
                        }
                        // Save to user
                        console.log(user);
                        user.sessions.push(session._id);
                        user.save(function (err) {
                            if (err) {
                                console.log('Error: ' + err);
                                res.status(400);
                                throw err;
                            }
                            res.status(200).json(session._id);
                        }
                        )
                    });
                } else {
                    res.status(200).json(session._id);
                }
            });
        }
    });


/**
 * Delete
 */
app.delete('/session/:id', function (req, res) {
    console.log("DELETE");
    console.log(req.params.id);

    Session.findOneAndDelete({ "_id": req.params.id }, function (err, session) {
        if (err) {
            console.log('Error: ' + err);
            res.status(400);
            throw err;
        }

        // TODO: Delete from children/parent?
        // Delete from user
        User.findOne({ _id: session.user }, function (err, user) {
            if (err) {
                console.log('Error: ' + err);
                res.status(400);
                throw err;
            }
            user.sessions.pull(session._id);
            user.save(function (err) {
                if (err) {
                    console.log('Error: ' + err);
                    res.status(400);
                    throw err;
                }
                res.status(200).json({ status: "ok" });
            }
            )
        });
    });
});

/**
 * Get Sessions
 */
app.get('/sessions',
    function (req, res) {
        Session.find({}, { _id: 1, svg: 1, name: 1 }, function (err, data) {
            data.map(function (item) {
                item.children = undefined;
                return item;
            });
            res.send(data);
            // 15 most recent
            // TODO: Add pagination (mongoose-paginate?)
        }).sort({ _id: -1 }).limit(15);
    });

// Session by session id
app.get('/sessions/:id',
    function (req, res) {
        Session.findOne({ _id: req.params.id }, function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                res.status(400);
                throw err;
            }
            if (!data) {
                res.status(200).json({ "status": "no" });
            } else {
                res.send(data);
            }
        });
    });

// Session by user id
app.get('/sessions/user/:id',
    function (req, res) {
        User.findOne({ _id: req.params.id })
            .populate('sessions') // <==
            .exec(function (err, sessions) {
                if (err) {
                    console.log('Error: ' + err);
                    res.status(400);
                    throw err;
                }
                res.status(200).json(sessions);
            });
    });


// Session children
app.get('/sessions/children/:id',
    function (req, res) {
        Session.findOne({ _id: req.params.id }, function (err, data) {
            res.send(data);
        });
    });


// TODO: Sessions by parent id
// app.get('/sessions/parents/:id',
//     function (req, res) {
//         Session.findOne({_id: req.params.id}, function (err, data) {
//             // res.send(data);
//             data.deepPopulate('parent', function (err, _data) {
//                 // console.log(_data);
//                 res.send(_data)
//             });
//         });
//     });

app.get('/loggeduser', function (req, res) {
    if (req.user === undefined) {
        // The user is not logged in
        res.json({});
    } else {
        res.json({
            username: req.user
        });
    }
});


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

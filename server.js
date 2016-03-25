var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var qr = require('qr-image');
var fs = require('fs');
var crypto = require('crypto');
var randomHex = function(len){
  return crypto.randomBytes(Math.ceil(len/2))
    .toString('hex')
    .slice(0,len);
}

var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 8001;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
  res.send('API is located at http://localhost:' + port + '/api');
});

app.get('/admin-setup', function(req, res) {
  var admin = new User({
    username: 'admin',
    passwd: 'admin',
    email: 'admin@pg.manage',
    firstname: 'admin',
    lastname: 'admin',
    qrcode: 'admin-0000.svg'
  });

  admin.save(function(err) {
    if (err) {
      console.log('Admin not yet created');
      res.json({ success: false });
      return;
    }

    var code = qr.image('admin', {type: 'svg'});
    var output = fs.createWriteStream('mobile/www/img/qr/admin-0000.svg');
    code.pipe(output);

    console.log('Admin created successfully');
    res.json({ success: true });
  });
});

var routing = express.Router();

routing.post('/regis', function(req, res) {
  console.log('Regis a new user: ' + req.body.username);

  var qrcode = req.body.username + '-' + randomHex(4) + '.svg';
  var user = new User({
    username: req.body.username,
    passwd: req.body.passwd,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    qrcode: qrcode
  });

  if (req.body.username === undefined ||
      req.body.username === "null" ||
      req.body.username.length < 1)
  {
    console.log('User not yet created');
    res.json({ success: false, message: 'Username is missing'});
    return;
  }

  if (req.body.passwd === undefined) {
    console.log('User not yet created');
    res.json({ success: false, message: 'Password is missing'});
    return;
  }

  if (req.body.passwd.length < 4) {
    console.log('User not yet created');
    res.json({ success: false, message: 'Password needs more than 3 letters'});
    return;
  }

  if (req.body.firstname === undefined ||
      req.body.firstname === "null" ||
      req.body.firstname.length < 1)
  {
    console.log('User not yet created');
    res.json({ success: false, message: 'Firstname is missing'});
    return;
  }

  if (req.body.lastname === undefined ||
      req.body.lastname === "null" ||
      req.body.lastname.length < 1)
  {
    console.log('User not yet created');
    res.json({ success: false, message: 'Lastname is missing'});
    return;
  }

  if (req.body.email === undefined ||
      req.body.email === "null" ||
      req.body.email.length < 1)
  {
    console.log('User not yet created');
    res.json({ success: false, message: 'Email is missing'});
    return;
  }

  user.save(function(err) {
    if (err) {
      console.log('User not yet created');
      res.json({ success: false, message: 'Username or email has already taken'});
      return;
    }

    var code = qr.image(req.body.username, {type: 'svg'});
    var output = fs.createWriteStream('mobile/www/img/qr/' + qrcode);
    code.pipe(output);

    console.log('User created successfully');
    res.json({ success: true, message: 'New user created' });
  });
});

routing.post('/authen', function(req, res) {
  console.log('Authenticating user: ' + req.body.username);
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.'});
    } else if (user) {
      if (user.passwd != req.body.passwd) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.'});
      } else {
        res.json({
          success: true,
          username: user.username,
          data: {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            qrcode: user.qrcode
          },
          message: 'Authentication okay!',
          token: jwt.sign(user, app.get('superSecret'), {
            expiresInMinutes: 43200
          })
        });
      }
    }
  });
});

routing.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.'});
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'Undefined token.'
    });
  }
});

routing.get('/', function(req, res){
  res.json({ message: 'Welcome to PG Manage API!'});
});

routing.get('/userinfo', function(req, res) {
    User.findOne({
      username: req.query.username
    }, function(err, user) {
      if (err) {
        res.json({ success: false, message: 'Oops! cannot fetch user'});
        return;
      }
      if (!user) {
        res.json({ success: false, message: 'User does not exists'});
      } else {
        res.json({
          success: true,
          data: {
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            qrcode: user.qrcode
          }
        });
      }
    });
});

routing.post('/update', function(req, res) {
  User.update({ username: req.body.username }, {
    $set: {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email
    }}, function(err) {
      if (err) {
        res.json({ success: false, message: 'Email has already taken'});
        return;
      } else {
        res.json({ success: true, message: 'User is updated successfully'});
      }
    });
});

app.use('/api', routing);

app.listen(port);
console.log('Start pg-manage server at http://localhost:' + port);

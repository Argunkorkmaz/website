const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const formidable = require('formidable');

const userDataFileName = path.join(__dirname, '../../data/user.json');
var user = { emails: [], passwordHashes: [] };

if (fs.existsSync(userDataFileName)) {
    fs.readFile(userDataFileName, function read(err, data) {
        if (err) {
            throw err;
        }
        user = JSON.parse(data);
        console.log("Read user data.");
    });
}

function sendHTML(res, htmlFileName) {
    const filePath = path.join(__dirname, '../../views', htmlFileName);
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + htmlFileName);
        }
        res.writeHead(200);
        res.end(data);
    });
}

function sendHTMLWithEmail(res, htmlFileName, email) {
    const filePath = path.join(__dirname, '../../views', htmlFileName);
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + htmlFileName);
        }
        res.writeHead(200);
        var modifiedData = data.replace("Logged in", email + " logged in");
        res.end(modifiedData);
    }
    );
}

function userExists(userData) {
    console.log("Checking if " + userData.email + " exists.");
    if (fs.existsSync(userDataFileName)) {
        for (var i = 0; i < user.emails.length; i++) {
            console.log("Checking hash for " + user.emails[i]);
            if (userData.email === user.emails[i]) {
                if (bcrypt.compareSync(userData.password, user.passwordHashes[i])) {
                    console.log(userData.email + " matched.");
                    return true;
                }
            }
        }
    } else {
        console.log(userDataFileName + " does not exist. Not checking.")
    }
    return false;
}

router.post('/register', function (req, res) {
    console.log("Registration info: ", req.body);
    for (var i = 0; i < user.emails.length; i++) {
        if (req.body.email === user.emails[i]) {
            res.send("<h1>Email " + req.body.email + " already exists.</h1>");
            return;
        }
    }
    var hash = bcrypt.hashSync(req.body.password, 10);
    console.log("Added " + req.body.email);
    user.emails.push(req.body.email);
    user.passwordHashes.push(hash);
    json = JSON.stringify(user);
    fs.writeFile(userDataFileName, json, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(userDataFileName + " updated.");
        }
    });
    res.send("<h1>" + req.body.email + " registered.</h1>");
});

router.post('/login', function (req, res) {
    if (userExists(req.body)) {
        req.session.user = { email: req.body.email };
        sendHTMLWithEmail(res, 'loggedIn.html', req.body.email);
    } else {
        res.send('<h1>User name or password does not exit!</h1>');
    }
});

router.get('/termsAndPrivacy', function (req, res) {
    sendHTML(res, 'termsAndPrivacy.html');
});

router.get('/', function (req, res) {
    if (req.session.user) {
        console.log(req.session.user.email + " already logged in.")
        sendHTMLWithEmail(res, 'loggedIn.html', req.session.user.email);
    } else {
        console.log("Not logged in.");
        sendHTML(res, 'login.html');
    }
});

router.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

router.get('/login', function (req, res) {
    console.log("/login")
    sendHTML(res, 'login.html');
});

router.get('/mc', function (req, res) {
    console.log("/mc")
    sendHTML(res, 'mc/index.html');
});

router.get('/showRegistrationForm', function (req, res) {
    console.log("/showRegistrationForm")
    sendHTML(res, 'register.html');
});

router.post('/upload/fileupload', function(req, res) {
    console.log('fileupload')
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.filepath;
      var newpath = path.join(__dirname, '../../uploads', files.filetoupload.originalFilename);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });
});

module.exports = router;

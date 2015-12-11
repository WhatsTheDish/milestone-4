// Lectures 11 and 12 - CSC 210 Fall 2015
// Philip Guo

// This is the backend for the Fakebook web app, which demonstrates CRUD
// with Ajax using a REST API. (static_files/fakebook.html is the frontend)

// Prerequisites - first run:
//   npm install express
//   npm install body-parser
//   npm install sqlite3
//
// then run:
//   node server.js
//
// and the frontend can be viewed at http://localhost:3000/createaccount.html

var express = require('express');
var app = express();
//FROM: http://stackoverflow.com/questions/10358100/how-to-access-localstorage-in-node-js
//var LocalStorage = require('node-localstorage').LocalStorage,
//localStorage = new LocalStorage('./scratch');
//var userPeanutsInfo;
//var userMilkInfo;

// required to support parsing of POST request bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//DATABASE TAKE 2 source = http://blog.modulus.io/nodejs-and-sqlite
var fs = require("fs");
var file = "users.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists) {
    //db.run("CREATE TABLE Stuff (thing TEXT)");
    db.run("CREATE TABLE users(userName TEXT primary key, allergicToMilk BOOLEAN, allergicToPeanuts BOOLEAN)");
    db.run("CREATE TABLE recipes(title TEXT primary key, creator TEXT, recipe TEXT, allergicToMilk BOOLEAN, allergicToPeanuts BOOLEAN)");
  }
  
  //var stmt = db.prepare("INSERT INTO recipes VALUES (?, ?, ?, ?, ?)");
  //var stmt = db.prepare("INSERT INTO users VALUES(?, ?, ?)");
  //stmt.run('Pasta Primavera', 'Jeff', 'eggs and water', true, true);
  //stmt.finalize();
 
  db.each("SELECT rowid AS id, userName, allergicToMilk, allergicToPeanuts FROM users", function(err, row) {
  console.log(row.id + ": " + row.userName + " " + row.allergicToMilk + " " + row.allergicToPeanuts);
  });

  db.each("SELECT rowid AS id, title, creator, recipe, allergicToMilk, allergicToPeanuts FROM recipes", function(err, row) {
  console.log(row.id + ": " + row.title + " " + row.creator + " " + row.recipe + " " + row.allergicToMilk + " " + row.allergicToPeanuts);
  });
});

//db.close();
// put all of your static files (e.g., HTML, CSS, JS, JPG) in the static_files/
// sub-directory, and the server will serve them from there. e.g.,:
//
// http://localhost:3000/fakebook.html
// http://localhost:3000/cat.jpg
//
// will send the file static_files/cat.jpg to the user's Web browser
app.use(express.static('static_files'));


// simulates a database in memory, to make this example simple and
// self-contained (so that you don't need to set up a separate database).
// note that a real database will save its data to the hard drive so
// that they become persistent, but this fake database will be reset when
// this script restarts. however, as long as the script is running, this
// database can be modified at will.

// REST API as described in http://pgbovine.net/rest-web-api-basics.htm

// CREATE a new user
//
// To test with curl, run:
//   curl -X POST --data "name=Carol&job=scientist&pet=dog.jpg" http://localhost:3000/users
app.post('/users', function (req, res) {
  var postBody = req.body;
  var myName = postBody.name;
  //window.userPeanutsInfo = postBody.allergicToPeanut;
  //window.userMilkInfo = postBody.allergicToMilk;

  // must have a name!
  if (!myName) {
    res.send('ERROR');
    return; // return early!
  }
  var stmt = db.prepare("INSERT INTO users VALUES(?, ?, ?)");
  stmt.run(postBody.name, postBody.allergicToPeanut, postBody.allergicToMilk, function(error){
    if(error){
      console.log(error.message);
      res.send('DUPLICATE');
    }
    else{
      res.send('OK');
    }
  }
  );
  stmt.finalize();
});

// CREATE a new recipe
//
// To test with curl, run:
//   curl -X POST --data "name=Carol&job=scientist&pet=dog.jpg" http://localhost:3000/users
app.post('/recipes', function (req, res) {
  var postBody = req.body;
  var Title = postBody.title;
  var Recipe = postBody.recipe;
  var Peanuts = postBody.allergicToPeanut;
  var Milk = postBody.allergicToMilk;

  // must have a name!
  if (!Title) {
    res.send('ERROR');
    return; // return early!
  }
  var stmt = db.prepare("INSERT INTO recipes VALUES(?, ?, ?, ?, ?)");
  stmt.run(postBody.title, postBody.creator, postBody.recipe, postBody.allergicToMilk, postBody.allergicToPeanut, function(error){
    if(error){
      console.log(error.message);
      res.send('DUPLICATE');
    }
    else{
      res.send('OK');
    }
  }
  );
  stmt.finalize();
});

// DELETE a  recipe
//
// To test with curl, run:
//   curl -X POST --data "name=Carol&job=scientist&pet=dog.jpg" http://localhost:3000/users
app.delete('/recipes/delete/*', function (req, res) {
  var recipeToDelete = req.params[0];

  db.all("DELETE * FROM recipes WHERE title = ?", recipeToDelete, function(err, row){
    if(err){ 
      throw err;
    }  
    else{
       res.send("OK");
       return; 
    }
  });
  /*
  var postBody = req.body;
  var Title = postBody.title;
  var Recipe = postBody.recipe;
  var Peanuts = postBody.allergicToPeanut;
  var Milk = postBody.allergicToMilk;

  // must have a name!
  if (!Title) {
    res.send('ERROR');
    return; // return early!
  }
  var stmt = db.prepare("INSERT INTO recipes VALUES(?, ?, ?, ?, ?)");
  stmt.run(postBody.title, postBody.creator, postBody.recipe, postBody.allergicToMilk, postBody.allergicToPeanut, function(error){
    if(error){
      console.log(error.message);
      res.send('DUPLICATE');
    }
    else{
      res.send('OK');
    }
  }
  );
  stmt.finalize();
  */
});



// READ profile data for a user
//
app.get('/users/*', function (req, res) {
  var nameToLookup = req.params[0];
  console.log("BLAH: " + req.body);
  db.all("SELECT * FROM users WHERE userName = ?", nameToLookup, function(err, row){
    if(err) throw err;
    //console.log(row[0]);
    if(row[0] == undefined){
       res.send("{}"); 
    }
    else{
      res.send(row[0]);
    }
  });
});

// READ suitable recipes for a user
//
app.get('/recipes', function (req, res) {
  var milkCheck = req.query.milk; 
  var peanutCheck = req.query.peanuts;
  console.log(req.query.milk);
  db.all("SELECT * FROM recipes WHERE allergicToMilk = '"+ milkCheck +"' AND allergicToPeanuts ='"+peanutCheck+"'",function(err, row){
    if(err) throw err;
    console.log(row);
    if(row == undefined){
       res.send("{}"); 
    }
    else{
      res.send(row);
    }
  });
});

//TITLE SEARCH
// READ suitable recipes for a user ACCORDING TO SEARCH

app.get('/recipes/searchtitle/*', function (req, res) {
  
  var query = req.params[0];
  console.log(query);
  db.all("SELECT * FROM recipes WHERE title LIKE'%"+ query +"%'",function(err, row){
    if(err) throw err;
    console.log("RESULTS: " + row);
    if(row == ""){
       res.send("{}"); 
    }
    else{
      res.send(row);
    }
  });

});

//CREATOR SEARCH
app.get('/recipes/searchcreator/*', function (req, res) {
  
  var query = req.params[0];
  console.log(query);
  db.all("SELECT * FROM recipes WHERE creator LIKE'%"+ query +"%'",function(err, row){
    if(err) throw err;
    console.log("RESULTS: " + row);
    if(row == ""){
       res.send("{}"); 
    }
    else{
      res.send(row);
    }
  });

});

//CONTENT SEARCH
app.get('/recipes/searchcontent/*', function (req, res) {
  
  var query = req.params[0];
  console.log(query);
  db.all("SELECT * FROM recipes WHERE recipe LIKE'%"+ query +"%'",function(err, row){
    if(err) throw err;
    console.log("RESULTS: " + row);
    if(row == ""){
       res.send("{}"); 
    }
    else{
      res.send(row);
    }
  });

});


// UPDATE a user's profile with the data given in POST
app.put('/users/*', function (req, res) {
  var milkChange = req.body.allergicToMilk;
  var peanutChange = req.body.allergicToPeanut;
  var nameToLookup = req.params[0];
  var stmt = db.prepare("UPDATE users SET allergicToMilk=?, allergicToPeanuts=? WHERE userName=?");
  stmt.run(milkChange, peanutChange, nameToLookup, function(err){
    if(err){
      console.log(err.message);
      res.send('ERROR'); 
    } 
    else{
      res.send('OK');
    }
  });
});

/*
// READ profile data for a user
//
// To test with curl, run:
//   curl -X GET http://localhost:3000/users/Philip
//   curl -X GET http://localhost:3000/users/Jane
app.get('/users/*', function (req, res) {
  //var nameToLookup = req.;
  //console.log(nameToLookUp);
   // this matches the '*' part of '/users/*' above
  // try to look up in fakeDatabase
  //var postBody = req.body;
  //console.log(postBody);
  var nameToLookup = req.params[0];
  console.log(nameToLookup);
  db.run("SELECT * FROM users WHERE userName = " + nameToLookup, function(err, row) {
    //console.log(row.id + ": " + row.userName);
    //console.log(*);
      res.send(row);
      return;
  });
  //console.log("BOO");
  //res.send('{}');
});

/*
   // failed, so return an empty JSON object!
  db.each("SELECT rowid AS id, userName FROM users", function(row, err) {
    var e = row.userName;
    if (e == nameToLookup) {
      res.send(e);
    }
  });
*/

/*
// READ profile data for a user
//
// To test with curl, run:
//   curl -X GET http://localhost:3000/users/Philip
//   curl -X GET http://localhost:3000/users/Jane
app.get('/users/*', function (req, res) {
  var nameToLookup = req.params[0]; // this matches the '*' part of '/users/*' above
  // try to look up in fakeDatabase
  for (var i = 0; i < fakeDatabase.length; i++) {
    var e = fakeDatabase[i];
    if (e.name == nameToLookup) {
      res.send(e);
      return; // return early!
    }
  }

  res.send('{}'); // failed, so return an empty JSON object!
});


// READ a list of all usernames (note that there's no '*' at the end)
//
// To test with curl, run:
//   curl -X GET http://localhost:3000/users
app.get('/users', function (req, res) {
  var allUsernames = [];

  for (var i = 0; i < fakeDatabase.length; i++) {
    var e = fakeDatabase[i];
    allUsernames.push(e.name); // just record names
  }

  res.send(allUsernames);
});
*/

// DELETE a user
//
app.delete('/users/*', function (req, res) {
  var nameToLookup = req.params[0]; // this matches the '*' part of '/users/*' above
  // try to look up in fakeDatabase
  for (var i = 0; i < fakeDatabase.length; i++) {
    var e = fakeDatabase[i];
    if (e.name == nameToLookup) {
      fakeDatabase.splice(i, 1); // remove current element at index i
      res.send('OK');
      return; // return early!
    }
  }
  res.send('ERROR'); // nobody in the database matches nameToLookup
});


// start the server on http://localhost:3000/
var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Server started at http://localhost:%s/', port);
});
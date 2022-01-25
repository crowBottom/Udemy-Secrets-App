// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: "Tottenham7",
  resave: false,
  saveUninitialized: false
}));

app.use( passport.initialize() );
app.use( passport.session() );

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use( User.createStrategy() );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );


// root route d=redirects to home
app.get("/", (req, res) => {
  res.redirect("/home")
})
app.get("/home", (req, res) => {
  res.render("home")
})

// login routes
app.get("/login", (req, res) => {
  res.render("login")
})
app.post("/login", (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets")
      })
    }
  })
})

// register routes
app.get("/register", (req, res) => {
  res.render("register")
})
app.post("/register", (req, res) => {
  User.register( {username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register")
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets")
      })
    }
  } )
})

// secret route -- need to be authenticated to get this route
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets")
  }
  else {
    res.redirect("/login")
  }
})

// logoutthe user
app.get("/logout", (req, res) => {
  req.logout();
  console.log("logged out")
  res.redirect("/")
})


// listening on localhost: port 3000
app.listen(3000, () => {
  console.log("Server listening on port 3000");
})

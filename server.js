const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;
const passport = require('passport');

const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

//DB Config
const dbUrl = require("./config/keys").mongoURI;
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true }
);
const dbConnection = mongoose.connection;

dbConnection.once("open", () => {
  console.log("Mongo DB connected");
});
dbConnection.on("error", () => {
  console.log("Error connecting to database");
});

app.use(express.json());
app.use("/api/profiles", profiles);
app.use("/api/users", users);
app.use("/api/posts", posts);

//Passport middleware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

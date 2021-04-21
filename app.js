const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const content = require(__dirname + "/content.js");
const app = express();
require("dotenv").config();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI + "blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
});

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
  Blog.find({}, function (err, foundPosts) {
    if (!err) {
      if (foundPosts.length === 0) {
        const home = new Blog({
          title: "Home",
          content: content.homeContent,
        });
        home.save();
        res.redirect("/");
      } else {
        res.render("home", { posts: foundPosts });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about", { aboutContent: content.aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { contactContent: content.contactContent });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", (req, res) => {
  const post = new Blog({
    title: _.capitalize(req.body.postTitle),
    content: req.body.postBody,
  });
  post.save();
  res.redirect("/");
});

app.get("/posts/:postId", (req, res) => {
  Blog.findById(req.params.postId, function (err, foundPost) {
    if (!err) {
      if (foundPost) {
        res.render("post", {
          postTitle: foundPost.title,
          postContent: foundPost.content,
          postId: foundPost._id,
        });
      } else res.send("Post not found");
    }
  });
});

app.post("/delete", (req, res) => {
  Blog.findByIdAndDelete(req.body.id, function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.listen(process.env.port || 3000, function () {
  console.log("Server started running");
});

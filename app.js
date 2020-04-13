const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

mongoose
  .connect("mongodb://localhost/blog_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log("---DB Connected---");
  })
  .catch((err) => {
    console.log(err);
  });

// MODEL / SCHEMA
const blogSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  author: String,
  created: {
    type: Date,
    default: Date.now(),
  },
});

const Blog = mongoose.model("Blog", blogSchema);

// RESTful ROUTES

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
  Blog.find({}, (err, blogs) => {
    if (err) {
      return res.status(404).json({
        error: "Could not get blog posts",
      });
    } else {
      res.render("index", { blogs });
    }
  });
});

app.get("/blogs/new", (req, res) => {
  res.render("new");
});

// CREATE Route
app.post("/blogs", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.create(req.body.blog, (err, newBlog) => {
    if (err) {
      res.redirect("/blogs/new");
    }

    res.redirect("/blogs");
  });
});

// SHOW Route
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    if (err) {
      res.status(404).json({
        error: "Could not find the blog",
      });
    }

    res.render("show", { blog });
  });
});

// EDIT Route
app.get("/blogs/:id/edit", (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    if (err) {
      res.status(404).json({
        error: "Could not find the blog",
      });
    }

    res.render("edit", { blog });
  });
});

app.put("/blogs/:id", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, blog) => {
    if (err) {
      res.status(404).json({
        error: "Could not find the blog",
      });
    }

    res.redirect("/blogs/" + req.params.id);
  });
});

// DELETE Route
app.delete("/blogs/:id", (req, res) => {
  Blog.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      return res.status(400).json({
        error: "Could not delete the blog",
      });
    }

    res.redirect("/blogs");
  });
});

app.listen(5000);

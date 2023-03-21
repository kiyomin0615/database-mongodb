const express = require('express');
const mongodb = require("mongodb");

const db = require("../data/database");

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, 'author.name': 1 })
    .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function(req, res) {
  // 데이터베이스 읽기
  // blog 데이터베이스 - authors 컬렉션
  const authors = await db.getDb().collection("authors").find().toArray();
  
  res.render('create-post', { authors: authors  });
});

router.post("/posts", async function(req, res) {
  const authorId = new mongodb.ObjectId(req.body.author);
  const author = await db.getDb().collection("authors").findOne({ _id: authorId })

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  }

  // 데이터베이스 쓰기
  const result = await db.getDb().collection("posts").insertOne(newPost); // id 리턴
  
  res.redirect("/posts");
});

router.get("/posts/:id", async function(req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new mongodb.ObjectId(postId) }, { summary: 0 });
    // .project({ summary: 0 })

  if (!post) {
    res.status(404).render("404");
    return;
  }

  // 자바스크립트의 프로퍼티 추가 방법
  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  post.date = post.date.toISOString();

  res.render("post-detail", { post: post });
});

router.get("/posts/:id/edit", async function(req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new mongodb.ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

    if (!post) {
      res.status(404).render("404");
      return;
    }

    res.render("update-post", { post: post });
});

// 데이터베이스 갱신
router.post("/posts/:id/edit", async function(req, res) {
  const postId = new mongodb.ObjectId(req.params.id);

  const result = await db.getDb().collection("posts").updateOne({ _id: postId }, { $set: {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
  }});

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function(req, res) {
  const postId = new mongodb.ObjectId(req.params.id);

  const result = await db.getDb().collection("posts").deleteOne({ _id: postId });

  res.redirect("/posts");
});

module.exports = router;
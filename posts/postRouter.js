const express = require('express');
const posts = require('./postDb');
const router = express.Router();

router.get('/', (req, res) => {
  posts.get()
    .then(data => res.json(data))
    .catch(err => {
      res.status(400).json({
        message: "Could not find all posts", err
      });
    });
});

router.get('/:id', validatePostId(), (req, res) => {
  posts.getById(req.params.id)
    .then(post => res.json(post))
    .catch(err => {
      res.status(404).json({
        message: "Could not find posts with this ID", err
      });
    });
});

router.delete('/:id', validatePostId(), (req, res) => {
  posts.remove(req.params.id)
    .then(post => {
      res.status(200).json({
        message: "Post has been deleted"
      });
    });
});

router.put('/:id', validatePostId(), validatePost(), (req, res) => {
  posts.update(req.params.id, req.text)
    .then(data => res.json(data))
    .catch(err => {
      res.status(404).json({
        message: "Could not update post", err
      });
    });
});

// custom middleware

function validatePost(req, res, next) {
  return (req, res, next) => {
    resource = {
      text: req.body.text
    };

    if (req.body.text) {
      req.text = resource;
      next();
    } else {
      return res.status(404).json({
        errorMessage: "missing required text field"
      });
    };
  };
};

function validatePostId(req, res, next) {
  return (req, res, next) => {
    posts.getById(req.params.id)
      .then(post => {
        if (post) {
          req.post = post;
          next();
        } else {
          res.status(400).json({
            message: "invalid post id"
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message: "cannot find post", err
        });
      });
  };
};

module.exports = router;

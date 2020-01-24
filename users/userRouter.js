const express = require('express');

const users = require('./userDb');
const posts = require('../posts/postDb');
const postRouter = require('../posts/postRouter');
const router = express.Router();

router.use('/:id/posts', postRouter);

router.post('/', validateUser(), (req, res) => {
  users.insert(req.body)
    .then(data => res.json(data))
    .catch(err => {
      res.status(404).json({
        errorMessage: "cannot post user at this time", err
      });
    });
});

router.get('/', (req, res) => {
  users.get()
    .then(data => res.json(data))
    .catch(err => {
      res.status(404).json({
        message: "could not find users"
      });
    });
});

router.get('/:id', validateUserId(), (req, res) => {
  users.getById(req.params.id)
    .then(post => res.json(post))
    .catch(err => {
      res.status(404).json({
        message: "Could not find users with this ID", err
      });
    });
});

router.post('/:id/posts', validateUserId(), validatePost(), (req, res) => {
  console.log(req.text);
  posts.insert(req.text)
    .then(data => res.json(data))
    .catch(err => {
      res.status(500).json({
        error: "Post cannot be created"
      });
    });
});

router.delete('/:id', validateUserId(), (req, res) => {
  users.remove(req.params.id)
    .then(user => {
      res.status(200).json({
        message: "User has been deleted"
      });
    })
    .catch(err => {
      res.status(404).json({
        errorMessage: "Cannot delete user"
      });
    });
});

router.put('/:id', validateUser(), validateUserId(), (req, res) => {
  users.update(req.params.id, req.user)
    .then(data => res.json(data))
    .catch( err => {
      res.status(404).json({
        errorMessage: "Could not update this user", err
      });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  return (req, res, next) => {
    users.getById(req.params.id)
      .then(user => {
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(400).json({
            message: "invalid user id"
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          message: "Error getting user with this ID"
        });
      });
  };
};

function validateUser(req, res, next) {
  return (req, res, next) => {
    resource = {
      name: req.body.name
    };

    if (req.body.name) {
      req.user = resource;
      next();
    } else {
      return res.status(404).json({
        message: "missing required name field"
      });
    };
  };
};

function validatePost(req, res, next) {
  return (req, res, next) => {
    resource = {
      text: req.body.text,
      user_id: req.params.id
    };

    if (req.body.text) {
      req.text = resource;
      next();
    } else {
      return res.status(404).json({
        message: "missing required text field"
      });
    };
  };
}

module.exports = router;

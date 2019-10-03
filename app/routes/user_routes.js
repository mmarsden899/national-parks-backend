const express = require('express')

// see above for explanation of "salting", 10 rounds is recommended
// const bcryptSaltRounds = 10

// pull in error types and the logic to handle them and set status codes
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
// const errors = require('../../lib/custom_errors')

// const BadParamsError = errors.BadParamsError
// const BadCredentialsError = errors.BadCredentialsError

const User = require('../models/user')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`

// instantiate a router (mini app that only handles routes)
const router = express.Router()

router.post('/users', (req, res, next) => {
  // set owner of new user to be current user

  User.create(req.body.user)
    // respond to succesful `create` with status 201 and JSON of new "user"
    .then(user => {
      res.status(201).json({ user: user.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

router.get('/users', (req, res, next) => {
  User.find()
    .then(users => {
      // `users` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return users.map(user => user.toObject())
    })
    // respond with status 200 and JSON of the users
    .then(users => res.status(200).json({ users: users }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.get('/users/:nickname', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  User.find({'nickname': req.params.nickname})
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "User" JSON
    .then(User => res.status(200).json({ User: User }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.patch('/users/:nickname', (req, res, next) => {
  console.log('req.body', req.body)
  const visited = req.body.user.list

  User.find({'nickname': req.params.nickname})
    .then(handle404)
    .then(user => {
      console.log('heres the user', user[0])
      const hasVisited = user[0].list.some(visit => {
        console.log(visit)
        return visit.toString() === visited
      })
      if (hasVisited) {
        return user[0].update({$pull: {list: visited}})
      } else {
        return user[0].update({$push: {list: visited}})
      }
    })
    .then(user => res.sendStatus(204))
    .catch(next)
})

router.delete('/users/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(handle404)
    .then(user => {
      // throw an error if current user doesn't own `user`
      // delete the user ONLY IF the above didn't throw
      user.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router

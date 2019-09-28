// Express docs: http://expressjs.com/en/api.html
const express = require('express')

// pull in Mongoose model for parks
const Park = require('../models/park')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { park: { title: '', text: 'foo' } } -> { park: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /parks
router.get('/parks', (req, res, next) => {
  Park.find()
    .then(parks => {
      // `parks` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return parks.map(park => park.toObject())
    })
    // respond with status 200 and JSON of the parks
    .then(parks => res.status(200).json({ parks: parks }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /parks/5a7db6c74d55bc51bdf39793
router.get('/parks/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Park.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "park" JSON
    .then(park => res.status(200).json({ park: park.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /parks
router.post('/parks', (req, res, next) => {
  // set owner of new park to be current user

  Park.create(req.body.park)
    // respond to succesful `create` with status 201 and JSON of new "park"
    .then(park => {
      res.status(201).json({ park: park.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /parks/5a7db6c74d55bc51bdf39793
router.patch('/parks/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.park.owner

  Park.findById(req.params.id)
    .then(handle404)
    .then(park => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, park)

      // pass the result of Mongoose's `.update` to the next `.then`
      return park.updateOne(req.body.park)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /parks/5a7db6c74d55bc51bdf39793
router.delete('/parks/:id', (req, res, next) => {
  Park.findById(req.params.id)
    .then(handle404)
    .then(park => {
      // throw an error if current user doesn't own `park`
      requireOwnership(req, park)
      // delete the park ONLY IF the above didn't throw
      park.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router

const _ = require('lodash');
const bcrypt = require('bcrypt'); 
const Joi = require('joi');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) res.status(400).send('Invalid email or password.');
  
  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
    const schema = {
        email: Joi.string().min(4).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    };
// Check out joi-password-complexity
    return Joi.validate(req, schema);
}

module.exports = router;
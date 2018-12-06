const Joi = require('joi');
const mongoose = require('mongoose');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50
    },
    isGold: {
        type: Boolean,
        default: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 7,
        maxlength: 11
    }
  
}));


function validate(customer) {
    const schema = {
        name: Joi.string().min(3).required(),
        phone: Joi.string().min(7).max(11).required(),
        isGold: Joi.boolean()
    };

    return Joi.validate(customer, schema);
}

exports.User = Customer;
exports.validate = validate;
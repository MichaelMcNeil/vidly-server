const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const validate = require("../middleware/validate");
const moment = require("moment");
const Joi = require("joi");

router.post("/", [auth, validate(validateReturn)], async (req, res, next) => {
  const rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId
  });

  if (!rental) return res.status(404).send("Rental not found...");

  if (rental.dateReturned)
    return res.status(400).send("Movie already returned..");

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateRented, "days");
  rental.totalCost = rentalDays * rental.movie.dailyRentalRate;
  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 }
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;

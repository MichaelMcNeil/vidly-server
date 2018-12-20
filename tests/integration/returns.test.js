const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const request = require("supertest");
const moment = require("moment");

describe("/api/returns", () => {
  let server;
  let customerId;
  let movieId;
  let movie;
  let rental;
  let token;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 10
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "1234567"
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2
      }
    });

    await rental.save();
  });

  afterEach(async () => {
    server.close();
    Rental.remove({});
    Movie.remove({});
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for customer or movie", async () => {
    movieId = mongoose.Types.ObjectId();
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it("should return 400 is the rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if request is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it("should set the return date if input is valid", async () => {
    await exec();
    const rentalFromDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalFromDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the totalCost if input is valid", async () => {
    rental.dateRented = moment()
      .add(-7, "days")
      .toDate();

    await rental.save();
    await exec();

    const rentalFromDb = await Rental.findById(rental._id);
    expect(rentalFromDb.totalCost).toBe(14);
  });

  it("should increase the stock of the movie if input is valid", async () => {
    const res = await exec();

    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if input is valid", async () => {
    const res = await exec();
    expect(res.body).toHaveProperty("_id", rental._id.toHexString());
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateRented",
        "dateReturned",
        "totalCost",
        "customer",
        "movie"
      ])
    );
  });
});

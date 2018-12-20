const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await Genre.remove({});
    server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" }
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === "genre1")).toBeTruthy();
      expect(res.body.some(g => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return the genre with a given id", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if given id not found", async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });

    it("should return 404 if given id not found", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genres/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    //Define the happy path, then in each test change one param that aligns with the name of the test

    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return a 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();
      const genre = Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let genre;
    let id;

    const exec = () => {
      return request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: name });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "genre1";
      genre = new Genre({ name });
      await genre.save();
      name = "newName";
      id = genre._id;
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if the genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if the genre is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if the id is invalid", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre with given id is not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should update the genre if given genre is valid", async () => {
      await exec();
      const updatedGenre = await Genre.findById(genre._id);
      expect(updatedGenre.name).toBe(name);
    });

    it("should return the updated genre if valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let id;
    let token;
    let genre;

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      genre = new Genre({ name: "genre1" });
      await genre.save();
      id = genre._id;
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre with given id is not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the genre if given genre was valid", async () => {
      await exec();
      const genre = await Genre.findById(id);
      expect(genre).toBeNull();
    });

    it("should return the deleted genre", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});

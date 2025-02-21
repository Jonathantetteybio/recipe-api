const request = require("supertest");
const app = require("../index"); // Your main index.js file
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
require("dotenv").config();

let server; // Store the server instance

beforeAll(async () => {
  // Connect to MongoDB before running tests
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Start the Express server
  server = app.listen(0); // Let Express choose a random available port
});

afterAll(async () => {
  // Disconnect from MongoDB and close the server after all tests are done
  await mongoose.disconnect();
  server.close(); // Close the server
});

describe("Recipe API", () => {
  let createdRecipeId; // Store the ID of a created recipe

  it("should create a new recipe", async () => {
    const newRecipe = {
      name: "Test Recipe",
      ingredients: ["ing1", "ing2"],
      instructions: "Test instructions",
      country: "US",
      image_url: "test.jpg",
    };

    const res = await request(server).post("/recipes").send(newRecipe);

    console.log("Create recipe response:", res.body);

    expect(res.statusCode).toEqual(201);
    expect(res.body._id).toBeDefined(); // Check if ID is generated
    createdRecipeId = res.body._id; // Store ID for other tests

    console.log("Created recipe ID:", createdRecipeId);
  }, 10000);

  it("should get recipes by country", async () => {
    const res = await request(server).get("/recipes/US");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Add more specific assertions about the recipe data
    if (res.body.length > 0) {
      expect(res.body[0].country).toEqual("US");
    }
  });

  it("should handle invalid country code", async () => {
    const res = await request(server).get("/recipes/USA");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid country code" });
  });

  it("should update a recipe", async () => {
    const updatedRecipe = {
      name: "Updated Recipe",
      ingredients: ["ing1", "ing2", "ing3"],
    };

    const res = await request(server)
      .put(`/recipes/${createdRecipeId}`)
      .send(updatedRecipe);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual("Updated Recipe");
  });

  it("should delete a recipe", async () => {
    const res = await request(server).delete(`/recipes/${createdRecipeId}`);
    expect(res.statusCode).toEqual(204);

    // Verify that the recipe is actually deleted
    const verifyRes = await request(server).get(`/recipes/US`);
    const deletedRecipe = verifyRes.body.find(
      (recipe) => recipe._id === createdRecipeId
    );
    expect(deletedRecipe).toBeUndefined();
  });

  it("should handle recipe not found on update", async () => {
    const invalidObjectId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId
    const res = await request(server)
      .put(`/recipes/${invalidObjectId}`)
      .send({ name: "test" });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "Recipe not found" });
  });

  it("should handle recipe not found on delete", async () => {
    const invalidObjectId = new mongoose.Types.ObjectId();
    const res = await request(server).delete(`/recipes/${invalidObjectId}`); // Correct usage

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "Recipe not found" });
  });

  it("should handle no recipes for country", async () => {
    const res = await request(server).get("/recipes/ZZ");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "No recipes found for this country" });
  });

  it("should handle server error on get recipes", async () => {
    // Force an error by mocking the Recipe.find method
    const originalFind = Recipe.find;
    Recipe.find = jest.fn().mockRejectedValue(new Error("Test error"));

    const res = await request(server).get("/recipes/US");
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: "Server error" });

    // Restore the original Recipe.find method
    Recipe.find = originalFind;
  });

  it("should handle server error on create recipe", async () => {
    // Force an error by mocking the Recipe.save method
    const originalSave = Recipe.prototype.save;
    Recipe.prototype.save = jest
      .fn()
      .mockRejectedValue(new Error("Test error"));

    const res = await request(server).post("/recipes").send({ name: "Test" });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: "Failed to create recipe" });

    // Restore the original Recipe.prototype.save method
    Recipe.prototype.save = originalSave;
  });

  it("should handle server error on update recipe", async () => {
    // Force an error by mocking the Recipe.findByIdAndUpdate method
    const originalUpdate = Recipe.findByIdAndUpdate;
    Recipe.findByIdAndUpdate = jest
      .fn()
      .mockRejectedValue(new Error("Test error"));

    const res = await request(server)
      .put(`/recipes/someid`)
      .send({ name: "Test" });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: "Failed to update recipe" });

    // Restore the original Recipe.findByIdAndUpdate method
    Recipe.findByIdAndUpdate = originalUpdate;
  });

  it("should handle server error on delete recipe", async () => {
    // Force an error by mocking the Recipe.findByIdAndDelete method
    const originalDelete = Recipe.findByIdAndDelete;
    Recipe.findByIdAndDelete = jest
      .fn()
      .mockRejectedValue(new Error("Test error"));

    const res = await request(server).delete(`/recipes/someid`);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: "Failed to delete recipe" });

    // Restore the original Recipe.findByIdAndDelete method
    Recipe.findByIdAndDelete = originalDelete;
  });
});

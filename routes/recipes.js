const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

// GET recipes by country
router.get("/:countryCode", async (req, res) => {
  try {
    const countryCode = req.params.countryCode.toUpperCase(); // Case-insensitive
    if (countryCode.length !== 2) {
      return res.status(400).json({ error: "Invalid country code" });
    }

    const recipes = await Recipe.find({ country: countryCode });

    if (!recipes || recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "No recipes found for this country" });
    }
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new recipe
router.post("/", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe); // 201 Created
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// PUT update a recipe
router.put("/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// DELETE a recipe
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(204).end(); // 204 No Content
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

module.exports = router;

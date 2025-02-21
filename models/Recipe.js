const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [String],
  instructions: String,
  country: { type: String, required: true },
  image_url: String,
});

module.exports = mongoose.model("Recipe", recipeSchema);

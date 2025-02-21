const axios = require("axios");
const recipeData = require("./ghanaianRecipes.json");

async function addRecipes() {
  for (const recipe of recipeData) {
    try {
      const response = await axios.post(
        "http://localhost:5000/recipes",
        recipe
      );
      console.log(
        `Recipe "${recipe.name}" added successfully. Response:`,
        response.data
      );
    } catch (error) {
      console.error(
        `Error adding recipe "${recipe.name}":`,
        error.response ? error.response.data : error.message
      );
    }
  }
}

addRecipes();

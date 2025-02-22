const axios = require("axios");

const apiUrl = "http://localhost:5000/recipes/GH"; // Replace with your API URL

async function fetchRecipes() {
  try {
    const response = await axios.get(apiUrl);
    if (response.status === 200) {
      console.log("Recipes fetched successfully:");
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.error(`Error fetching recipes. Status: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
      console.error("Status Code:", error.response.status);
    } else if (error.request) {
      console.error("Network Error:", error.request);
    } else {
      console.error("Error:", error.message);
    }
  }
}

fetchRecipes();

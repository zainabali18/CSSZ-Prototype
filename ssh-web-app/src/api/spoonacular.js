const axios = require("axios");

const API_KEY = "df49e21c984f4e89a9f869dcad799782";
const BASE_URL = "https://api.spoonacular.com";

const spoonacularApi = {
  getRecipesByIngredients: async (ingredients, dietPreferences, intolerances) => {
    try {
      const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
        params: {
          apiKey: API_KEY,
          includeIngredients: ingredients.join(","),
          diet: dietPreferences.join(","),
          intolerances: intolerances.join(","),
          addRecipeInformation: true,
          addRecipeInstructions: true,
          number: 10, // Number of recipes to fetch
        },
      });
      return response.data.results;
    } catch (error) {
      console.error("Error fetching recipes:", error.message);
      throw new Error("Failed to fetch recipes from Spoonacular API");
    }
  },

  getRecipeDetails: async (recipeId) => {
    try {
      const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/information`, {
        params: {
          apiKey: API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching recipe details:", error.message);
      throw new Error("Failed to fetch recipe details from Spoonacular API");
    }
  },
};

module.exports = { spoonacularApi };

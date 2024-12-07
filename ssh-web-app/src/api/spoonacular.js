import axios from 'axios';

const API_KEY = '71daef02d9174e3899427995d97a3e7f';
const BASE_URL = 'https://api.spoonacular.com/';

export const spoonacularApi = {
    searchRecipes: async (query) => {
      try {
        const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
          params: {
            apiKey: API_KEY,
            query: query,
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
      }
    },
  
    getRecipeById: async (id) => {
      try {
        const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
          params: {
            apiKey: API_KEY,
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching recipe:', error);
        throw error;
      }
    }
  };
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

app.get('/api/search-ingredients', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/search`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                query: query,
                number: 5 // Limit results
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error searching ingredients:', error);
        res.status(500).json({ error: 'Failed to search ingredients' });
    }
});

app.get('/api/ingredient-info/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/${id}/information`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                amount: 1
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error getting ingredient info:', error);
        res.status(500).json({ error: 'Failed to get ingredient information' });
    }
});

app.get('/api/recipes/suggest', async (req, res) => {
    try {
        // Get ingredients from your storage
        const ingredientNames = ingredients.map(i => i.name).join(',');
        
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                ingredients: ingredientNames,
                number: 5,
                ranking: 2 // Maximize used ingredients
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error getting recipes:', error);
        res.status(500).json({ error: 'Failed to get recipe suggestions' });
    }
});

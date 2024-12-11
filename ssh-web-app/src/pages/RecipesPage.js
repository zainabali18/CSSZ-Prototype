import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const preferencesList = [
  { id: 1, name: "Vegetarian" },
  { id: 2, name: "Vegan" },
  { id: 3, name: "Keto" },
  { id: 4, name: "Gluten Free" },
  { id: 5, name: "Dairy Free" },
  { id: 6, name: "Nut Free" },
  { id: 7, name: "Shellfish Free" },
  { id: 8, name: "Egg Free" },
  { id: 9, name: "Soy Free" },
];

const RecipesPage = ({ userEmail }) => {
  const [recipes, setRecipes] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`http://localhost:5001/api/recipes/suggest?email=${userEmail}`);
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err.message || err);
        setError("Error fetching recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPreferences = async () => {
      try {
        const response = await fetch(`http://localhost:5001/preferences?email=${userEmail}`);
        if (!response.ok) {
          throw new Error("Failed to fetch preferences");
        }
        const data = await response.json();
        const mappedPreferences = data.preferences
          .map((id) => preferencesList.find((pref) => pref.id === id)?.name)
          .filter(Boolean);
        setPreferences(mappedPreferences || []);
      } catch (err) {
        console.error("Error fetching preferences:", err.message || err);
      }
    };

    if (userEmail) {
      fetchRecipes();
      fetchPreferences();
    }
  }, [userEmail]);

  const viewRecipe = (id) => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div>
      <div className="title-container">
        <h1 className="page-title">Recipes For You</h1>
        {preferences.length > 0 && (
          <p className="preferences">
            My Preferences: {preferences.join(", ")}.
          </p>
        )}
      </div>
      <div className="container-fluid" style={{ marginBottom: "5%", marginTop: "5%", paddingLeft: "20px", paddingRight: "20px" }}>
        {loading && <p>Loading recipes...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3 className="recipe-title">{recipe.title}</h3>
              <button
                onClick={() => viewRecipe(recipe.id)}
                className="view-recipe-button"
              >
                View Recipe
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;

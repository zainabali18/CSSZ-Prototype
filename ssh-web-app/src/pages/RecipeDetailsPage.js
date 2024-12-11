import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const RecipeDetailsPage = ({ userEmail }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5001/api/recipes/${id}?email=${userEmail}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipe details");
        }

        const data = await response.json();
        setRecipe(data);

        const imageResponse = await fetch(
          `http://localhost:5001/api/recipes/${id}/image?email=${userEmail}`
        );

        if (!imageResponse.ok) {
          throw new Error("Failed to fetch recipe image");
        }

        const imageData = await imageResponse.json();
        setImage(imageData.image);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recipe details or image.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id, userEmail]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div className="title-container">
        <h1 className="page-title">{recipe?.title}</h1>
      </div>
      <div className="container-fluid" style={{ marginBottom: "5%", marginTop: "5%", paddingLeft: "20px", paddingRight: "20px" }}>
      <div className="recipe-image-section">
        <img
          src={image || "https://via.placeholder.com/150"}
          alt={recipe?.title || "Recipe Image"}
          className="recipe-details-image"
        />
      </div>
      <div className="recipe-info-section">
        <div className="ingredients">
          <h2>Ingredients</h2>
          <ul>
            {recipe?.ingredients.map((ing, index) => (
              <li key={index}>
                {ing.amount} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="instructions">
          <h2>Instructions</h2>
          <ol>
            {recipe?.instructions.map((step, index) => (
              <li key={index}>{step.step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RecipeDetailsPage;

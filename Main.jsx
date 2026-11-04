import React from "react";
import IngredientsList from "./components/IngredientsList";
import GeminiRecipe from "./components/GeminiRecipe";
import { getRecipeFromChefGemini } from "./ai";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");

  async function getRecipe() {
    const recipeMarkdown = await getRecipeFromChefGemini(ingredients);
    setRecipe(recipeMarkdown);
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient").trim();

    // Don't add empty ingredients
    if (!newIngredient) return;

    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);

    // Clear previous recipe when ingredients change
    setRecipe("");
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>

      {ingredients.length > 0 && (
        <IngredientsList ingredients={ingredients} getRecipe={getRecipe} />
      )}

      {recipe && <GeminiRecipe recipe={recipe} />}
    </main>
  );
}

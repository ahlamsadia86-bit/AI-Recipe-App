export async function getRecipeFromChefClaude(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  try {
    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients: ingredientsString,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Recipe generation failed.");
    }

    return data.recipe;
  } catch (error) {
    console.error("Recipe generation error:", error);

    return "Sorry, I couldn't generate a recipe right now. " + error.message;
  }
}

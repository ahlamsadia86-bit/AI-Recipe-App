
const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients.

You don't need to use every ingredient they mention.
The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients.

Format your response in markdown to make it easier to render on a web page.
`;

export async function getRecipeFromMistral(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ");

    try {
        const response = await fetch(
            "/.netlify/functions/generate-recipe",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ingredients: ingredientsString
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `Request failed: ${response.status}`
            );
        }

        if (!data.recipe) {
            throw new Error("The API returned an empty recipe.");
        }

        return data.recipe;

    } catch (err) {
        console.error("Recipe generation error:", err);

        return "Sorry, I couldn't generate a recipe right now. Please try again.";
    }
}

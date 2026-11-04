import ReactMarkdown from "react-markdown";

export default function GeminiRecipe({ recipe }) {
  return (
    <section className="suggested-recipe-container">
      <h2>Chef Gemini Recommends:</h2>

      <ReactMarkdown>{recipe}</ReactMarkdown>
    </section>
  );
}

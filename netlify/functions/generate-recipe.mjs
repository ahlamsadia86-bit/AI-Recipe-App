export default async (request) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { ingredients } = await request.json();

    if (!ingredients || typeof ingredients !== "string") {
      return Response.json(
        { error: "Please provide ingredients." },
        { status: 400 },
      );
    }

    // Read the secret securely on the server
    const token = process.env.HF_ACCESS_TOKEN;
    const model = process.env.HF_MODEL;

    if (!token || !model) {
      return Response.json(
        { error: "Hugging Face configuration is missing." },
        { status: 500 },
      );
    }

    const hfResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are an assistant that suggests recipes using ingredients provided by the user. You may suggest a few additional ingredients. Format your recipe in Markdown.`,
            },
            {
              role: "user",
              content: `I have ${ingredients}. Please give me a recipe you'd recommend I make!`,
            },
          ],
          max_tokens: 1024,
        }),
      },
    );

    const result = await hfResponse.json();

    // Handle Hugging Face errors properly
    if (!hfResponse.ok) {
      console.error("Hugging Face API error:", result);

      return Response.json(
        {
          error:
            result.error?.message ||
            result.error ||
            `Hugging Face returned HTTP ${hfResponse.status}`,
        },
        { status: hfResponse.status },
      );
    }

    // Validate the response before accessing choices[0]
    const recipe = result.choices?.[0]?.message?.content;

    if (!recipe) {
      console.error("Unexpected Hugging Face response:", result);

      return Response.json(
        { error: "No recipe was returned by the AI model." },
        { status: 502 },
      );
    }

    return Response.json({ recipe });
  } catch (error) {
    console.error("Recipe function error:", error);

    return Response.json(
      { error: "Unable to generate a recipe. Please try again." },
      { status: 500 },
    );
  }
};

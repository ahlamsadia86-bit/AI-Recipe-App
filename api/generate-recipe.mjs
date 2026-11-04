export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { ingredients } = req.body || {};

    if (!ingredients) {
      return res.status(400).json({
        error: "Please provide ingredients.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is missing.",
      });
    }

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are Chef Gemini, a helpful recipe assistant. Suggest one delicious recipe using the ingredients provided. Format your response in Markdown. Include a recipe title, description, ingredients with quantities, and step-by-step cooking instructions.",
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `I have these ingredients: ${ingredients}. Please recommend a recipe I can make.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500,
            },
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        const recipe = data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim();

        if (!recipe) {
          return res.status(502).json({
            error: "Gemini did not return a recipe.",
          });
        }

        return res.status(200).json({ recipe });
      }

      // Retry only temporary server errors
      if (
        (response.status === 503 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 504) &&
        attempt < maxAttempts
      ) {
        console.log(
          `Gemini temporarily unavailable. Retry ${attempt} of ${maxAttempts - 1}.`,
        );

        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));

        continue;
      }

      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini recipe generation failed.",
      });
    }
  } catch (error) {
    console.error("Recipe function error:", error);

    return res.status(500).json({
      error: "Unable to generate a recipe.",
    });
  }
}

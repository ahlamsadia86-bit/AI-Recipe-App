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

    const token = process.env.HF_ACCESS_TOKEN;
    const model = process.env.HF_MODEL;

    if (!token || !model) {
      return res.status(500).json({
        error: "Hugging Face configuration is missing.",
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are Chef Claude, a helpful recipe assistant. Suggest a recipe using the ingredients provided. Format your response in Markdown.",
            },
            {
              role: "user",
              content: `I have ${ingredients}. Please recommend a recipe I can make.`,
            },
          ],
          max_tokens: 1024,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hugging Face error:", data);

      return res.status(response.status).json({
        error:
          data.error?.message || data.error || "Hugging Face request failed.",
      });
    }

    const recipe = data.choices?.[0]?.message?.content;

    if (!recipe) {
      return res.status(502).json({
        error: "The AI did not return a recipe.",
      });
    }

    return res.status(200).json({ recipe });
  } catch (error) {
    console.error("Recipe function error:", error);

    return res.status(500).json({
      error: "Unable to generate a recipe.",
    });
  }
}

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for dev/testing in the browser
});

export async function evaluateNote(noteText) {
  console.log("🧠 Calling OpenAI with note:", noteText);

  if (!noteText || noteText.trim().length < 10) {
    console.warn("⛔ Note skipped (too short or blank):", noteText);
    return {
      classification: "Unknown",
      explanation: "The input was too short or vague to analyze.",
      doctor_advice: "Try describing your habit or environment in more detail.",
    };
  }

  const prompt = `
You are a fall prevention expert with clinical training. 
Classify the following user-submitted behavior or habit in terms of fall risk:

"${noteText}"

Respond ONLY in valid JSON using this format:
{
  "classification": "Protective" | "Neutral" | "Harmful",
  "explanation": "Explain briefly why you classified it this way.",
  "doctor_advice": "Give practical advice a good doctor might give."
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    console.log("✅ Raw OpenAI response:", content);

    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}") + 1;
    const jsonString = content.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    console.log("🧾 Parsed AI result:", parsed);
    return parsed;
  } catch (e) {
    console.error("❌ Failed to parse OpenAI response or network error:", e.message);
    return {
      classification: "Unknown",
      explanation: "Unable to parse AI output or the model didn't return JSON.",
      doctor_advice: "Please consult a physician directly or try rewording your input.",
    };
  }
}
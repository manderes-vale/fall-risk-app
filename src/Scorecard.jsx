import React from "react";

const riskAdvice = {
  "Fall History": "Discuss fall prevention with a provider.",
  "Balance": "Consider a physical therapy balance program.",
  "Medications": "Ask your doctor to review your medications.",
  "Environment": "Remove tripping hazards and improve lighting.",
  "Safety": "Install grab bars and use non-slip mats.",
  "Activity": "Start a strength and balance exercise routine.",
  "Sensory": "Have your vision and hearing tested.",
  "Social": "Consider alert systems or support networks.",
};

const valeLinks = {
  "Fall History": "education",
  "Balance": "mobility",
  "Medications": "medication+review",
  "Environment": "lighting",
  "Safety": "grab+bars",
  "Activity": "exercise",
  "Sensory": "vision",
  "Social": "alert+systems",
};

export default function Scorecard({ responses, questions, noteSuggestions, onGeneratePDF }) {
  const categoryScores = {};
  let earned = 0;
  let possible = 0;

  responses.forEach(({ id, answer }) => {
    const baseId = id.toString().replace("-followUp", "");
    const q = questions.find((q) => q.id.toString() === baseId);
    if (!q || !q.category || q.isText) return;

    const fullPoints = Math.max(...Object.values(q.points || {}), ...(q.followUp?.points ? Object.values(q.followUp.points) : [0]));
    const score = q.points?.[answer] ?? q.followUp?.points?.[answer] ?? 0;

    earned += score;
    possible += answer === "I don't know" ? 0 : fullPoints;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
  });

  const overallScore = possible ? Math.round(100 - (earned / possible) * 100) : "N/A";

  return (
    <div className="p-6 max-w-xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Your Fall Risk Scorecard</h1>
      {overallScore !== "N/A" && (
        <p className="mb-4 text-lg">
          <strong>Overall Fall Risk Score:</strong> {overallScore}/100 (
          {overallScore >= 67 ? "Low" : overallScore >= 34 ? "Moderate" : "High"} Risk)
        </p>
      )}

      {Object.entries(categoryScores).map(([category, score]) => {
        const risk = score >= 6 ? "High" : score >= 3 ? "Moderate" : "Low";
        const advice = riskAdvice[category];
        const linkQuery = valeLinks[category];

        return (
          <div key={category} className="mb-4 border rounded p-4 bg-white shadow">
            <h2 className="text-lg font-semibold">{category}</h2>
            <p>Risk Level: <strong>{risk}</strong></p>
            <p className="mt-1">{advice}</p>
            {linkQuery && (
              <a
                className="text-blue-600 underline inline-block mt-2"
                href={`https://wellness.valehealth.com?query=${linkQuery}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Find products on ValeHealth
              </a>
            )}
          </div>
        );
      })}

      {noteSuggestions?.length > 0 && (
        <div className="mt-6 mb-4 border rounded p-4 bg-blue-50">
          <h2 className="font-semibold mb-2">Suggestions based on your comments:</h2>
          <ul className="list-disc ml-6">
            {noteSuggestions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onGeneratePDF}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download PDF Summary
      </button>
    </div>
  );
}
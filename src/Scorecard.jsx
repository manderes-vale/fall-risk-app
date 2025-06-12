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
  "Notes": "Additional notes considered."
};

const valeLinks = {
  "Fall History": "education",
  "Balance": "mobility",
  "Medications": "medication+review",
  "Environment": "lighting",
  "Safety": "grab+bars",
  "Activity": "exercise",
  "Sensory": "vision",
  "Social": "alert+systems"
};

export default function Scorecard({ responses, questions, onGeneratePDF }) {
  const categoryScores = {};

  responses.forEach(({ id, answer }) => {
    const baseId = id.toString().replace("-followUp", "");
    const q = questions.find((q) => q.id.toString() === baseId);
    if (!q || !q.category || q.isText) return;

    const score = q.points?.[answer] || q.followUp?.points?.[answer] || 0;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fall Risk Scorecard</h1>
      <p className="mb-6">Here’s your personalized risk overview and suggested next steps:</p>

      {Object.entries(categoryScores).map(([category, points]) => {
        const color = points >= 6 ? "Red (High)" : points >= 3 ? "Yellow (Moderate)" : "Green (Low)";
        const advice = riskAdvice[category];
        const linkQuery = valeLinks[category];
        return (
          <div key={category} className="mb-4 border rounded p-3 bg-white">
            <h2 className="font-semibold">{category}</h2>
            <p>Risk Level: {color}</p>
            <p>{advice}</p>
            {linkQuery && (
              <a
                className="text-blue-600 underline mt-1 inline-block"
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

      <button
        onClick={onGeneratePDF}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download PDF Summary
      </button>
    </div>
  );
}

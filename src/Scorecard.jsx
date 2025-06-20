import React, { useEffect, useState } from "react";
import generatePDF from "./generatePDF";
import { evaluateNote } from "./analyzeNotes";

const riskAdvice = {
  "Fall History": "Recent falls indicate higher risk and may warrant preventive strategies.",
  "Balance": "Poor balance increases fall risk — physical therapy may help.",
  "Medications": "Some medications increase fall risk due to dizziness or fatigue.",
  "Environment": "Home hazards like poor lighting or loose rugs raise the likelihood of falls.",
  "Safety": "Lack of grab bars or safety equipment increases risk in key areas like bathrooms.",
  "Activity": "Low physical activity reduces strength and stability, increasing fall likelihood.",
  "Sensory": "Uncorrected vision or hearing issues can affect balance and awareness.",
  "Social": "Living alone can delay emergency response after a fall.",
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

const icons = {
  "Fall History": "🩹",
  "Balance": "🧍‍♂️",
  "Medications": "💊",
  "Environment": "🏠",
  "Safety": "🛁",
  "Activity": "🏃",
  "Sensory": "👓",
  "Social": "🧑‍🤝‍🧑",
};

export default function Scorecard({ responses, questions, noteSuggestions }) {
  const [aiAdvice, setAiAdvice] = useState([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const categoryScores = {};
  let earned = 0;
  let possible = 0;

  responses.forEach(({ id, answer }) => {
    const baseId = id.toString().replace("-followUp", "");
    const q = questions.find((q) => q.id.toString() === baseId);
    if (!q || !q.category || q.isText) return;

    const max = Math.max(
      ...Object.values(q.points || {}),
      ...(q.followUp?.points ? Object.values(q.followUp.points) : [0])
    );
    const score = q.points?.[answer] ?? q.followUp?.points?.[answer] ?? 0;

    earned += score;
    possible += answer === "I don't know" ? 0 : max;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
  });

  const overallScore = possible
    ? Math.round(100 - (earned / possible) * 100)
    : "N/A";

  const getColor = (score) =>
    score >= 6
      ? "bg-red-100 border-red-400 text-red-800"
      : score >= 3
      ? "bg-yellow-100 border-yellow-400 text-yellow-800"
      : "bg-green-100 border-green-400 text-green-800";

  useEffect(() => {
    const runAIAnalysis = async () => {
      console.log("💬 noteSuggestions received:", noteSuggestions);
      if (!noteSuggestions || noteSuggestions.length === 0) return;

      const filtered = noteSuggestions.filter(
        (note) =>
          note &&
          note.trim().length >= 10 &&
          !["i", "yes", "no", "n/a"].includes(note.trim().toLowerCase())
      );

      if (filtered.length === 0) {
        console.warn("❌ All notes were too short or unhelpful.");
        return;
      }

      setIsLoadingAdvice(true);
      const results = await Promise.all(
        filtered.map(async (note) => {
          try {
            console.log("🧠 Submitting to OpenAI:", note);
            const result = await evaluateNote(note);
            return { note, ...result };
          } catch (err) {
            console.error("OpenAI call failed:", err);
            return {
              note,
              classification: "Unknown",
              explanation: "The model was unable to process this comment.",
              doctor_advice: "Try rewording the input or consult a physician directly.",
            };
          }
        })
      );

      setAiAdvice(results);
      setIsLoadingAdvice(false);
    };

    runAIAnalysis();
  }, [noteSuggestions]);

  return (
    <div
      id="scorecard-summary"
      className="bg-white p-6 mx-auto"
      style={{ maxWidth: "794px" }}
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Vale Health Fall-Risk Toolkit
        </h1>
        <p className="text-gray-600 mt-2 text-base">
          This scorecard reflects your responses based on clinical evidence.
        </p>
      </div>

      {overallScore !== "N/A" && (
        <div className="mb-6 text-center text-lg">
          <strong>Overall Score: </strong> {overallScore}/100 –{" "}
          <span
            className={
              overallScore >= 67
                ? "text-green-600"
                : overallScore >= 34
                ? "text-yellow-600"
                : "text-red-600"
            }
          >
            {overallScore >= 67
              ? "Low Risk"
              : overallScore >= 34
              ? "Moderate Risk"
              : "High Risk"}
          </span>
        </div>
      )}

      {Object.entries(categoryScores).map(([category, score]) => {
        const risk =
          score >= 6 ? "High Risk" : score >= 3 ? "Moderate Risk" : "Low Risk";
        const color = getColor(score);
        const advice = riskAdvice[category];
        const icon = icons[category];
        const link = valeLinks[category];

        return (
          <div
            key={category}
            className={`rounded-lg border p-4 mb-4 shadow ${color}`}
          >
            <div className="flex items-center text-lg font-semibold">
              <span className="mr-2 text-2xl">{icon}</span>
              {category}
            </div>
            <p className="mt-1">
              <strong>{risk}</strong>
            </p>
            <p className="text-sm mt-1">{advice}</p>
            {link && (
              <a
                href={`https://wellness.valehealth.com?query=${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-700 underline"
              >
                Find products on ValeHealth
              </a>
            )}
          </div>
        );
      })}

      <div className="mt-6 mb-4">
        <div className="p-4 border border-blue-300 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2 text-blue-800 text-center">
            What you said:
          </h2>
          {noteSuggestions?.length > 0 ? (
            <ul className="list-disc pl-6 text-sm text-blue-800">
              {noteSuggestions.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-700 italic text-center">
              No comments were submitted.
            </p>
          )}
        </div>
      </div>

      {isLoadingAdvice && (
        <div className="mt-6 mb-4 p-4 border border-yellow-300 bg-yellow-50 rounded text-yellow-800 text-sm text-center">
          🔄 Analyzing your comments for expert advice...
        </div>
      )}

      {aiAdvice.length > 0 && (
        <div className="mt-6 mb-4 p-4 border border-gray-300 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2 text-gray-800 text-center">
            Expert Evaluation of Your Notes
          </h2>
          <ul className="list-disc pl-6 text-sm text-gray-800 space-y-3">
            {aiAdvice.map((item, idx) => (
              <li key={idx}>
                <strong>{item.note}</strong>
                <br />
                🔍 <em>{item.classification}</em> — {item.explanation}
                <br />
                🩺 <strong>Expert Advice:</strong> {item.doctor_advice}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Download PDF Summary
        </button>
      </div>
    </div>
  );
}
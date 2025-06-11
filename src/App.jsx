import React, { useState } from "react";

const questions = [
  {
    id: 1,
    question: "Have you fallen in the past 12 months?",
    options: ["Yes", "No"],
    points: { Yes: 6, No: 0 },
    category: "Mobility"
  },
  {
    id: 2,
    question: "How many times?",
    options: ["Once", "2–3 times", "More than 3 times"],
    points: { "Once": 2, "2–3 times": 3, "More than 3 times": 4 },
    category: "Mobility"
  },
  {
    id: 3,
    question: "Do you feel unsteady when walking around your home?",
    options: ["Never", "Sometimes", "Often"],
    points: { Never: 0, Sometimes: 1, Often: 3 },
    category: "Mobility"
  },
  {
    id: 4,
    question: "Do you use any mobility aids (e.g., cane, walker)?",
    options: ["No", "Yes – Cane", "Yes – Walker", "Yes – Other"],
    points: { "No": 0, "Yes – Cane": 1, "Yes – Walker": 2, "Yes – Other": 2 },
    category: "Mobility"
  },
  {
    id: 5,
    question: "Do you have stairs inside your home?",
    options: ["No", "Yes – With a handrail on both sides", "Yes – With a handrail on one side only", "Yes – No handrails"],
    points: {
      "No": 0,
      "Yes – With a handrail on both sides": 0,
      "Yes – With a handrail on one side only": 2,
      "Yes – No handrails": 4
    },
    category: "Interior"
  },
  {
    id: 6,
    question: "Do any rugs or mats slide or curl at the edges?",
    options: ["Yes", "No"],
    points: { Yes: 3, No: 0 },
    category: "Interior"
  },
  {
    id: 7,
    question: "Is clutter present in walkways (e.g., cords, furniture, boxes)?",
    options: ["Yes", "No", "Sometimes"],
    points: { Yes: 3, No: 0, Sometimes: 1 },
    category: "Interior"
  },
  {
    id: 8,
    question: "Does your bathroom have grab bars (e.g. near the toilet or in the shower)?",
    options: ["Yes – both areas", "Yes – only in one area", "No"],
    points: { "Yes – both areas": 0, "Yes – only in one area": 3, "No": 5 },
    category: "Bathroom"
  },
  {
    id: 9,
    question: "Do you use non-slip mats in the shower or tub?",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 5 },
    category: "Bathroom"
  },
  {
    id: 10,
    question: "Do you use nightlights or motion-sensor lights?",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 4 },
    category: "Lighting"
  }
];

const MAX_SCORE = 50;

export default function App() {
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState("");

  const handleAnswer = (id, option) => {
    setAnswers({ ...answers, [id]: option });
  };

  const calculateScore = () => {
    let total = 0;
    questions.forEach(q => {
      const answer = answers[q.id];
      total += q.points[answer] || 0;
    });
    return 100 - (total / MAX_SCORE) * 100;
  };

  const getCategoryScores = () => {
    const categories = {};
    questions.forEach(q => {
      const answer = answers[q.id];
      const pts = q.points[answer] || 0;
      categories[q.category] = (categories[q.category] || 0) + pts;
    });
    return categories;
  };

  const getRiskColor = (score) => {
    if (score < 34) return "Red (High)";
    if (score < 67) return "Yellow (Moderate)";
    return "Green (Low)";
  };

  const overallScore = calculateScore();
  const categoryScores = getCategoryScores();

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Fall Risk Assessment
      </h1>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1rem" }}>
          <p style={{ fontWeight: "600" }}>{q.question}</p>
          {q.options.map((opt) => (
            <label key={opt} style={{ display: "block" }}>
              <input
                type="radio"
                name={`q${q.id}`}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => handleAnswer(q.id, opt)}
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      ))}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "0.25rem" }}>
          Additional Comments
        </label>
        <textarea
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px" }}
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        ></textarea>
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
        <p><strong>Overall Score:</strong> {overallScore.toFixed(0)} ({getRiskColor(overallScore)})</p>
        <h2 style={{ marginTop: "0.75rem" }}>Category Risk Summary:</h2>
        <ul>
          {Object.entries(categoryScores).map(([cat, val]) => {
            const categoryScore = 100 - (val / MAX_SCORE) * 100;
            return (
              <li key={cat}>{cat}: {getRiskColor(categoryScore)}</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
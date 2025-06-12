import React, { useState } from "react";
import Scorecard from "./Scorecard";
import generatePDF from "./generatePDF";

const questions = [
  {
    id: 1,
    text: "Have you fallen in the past 12 months?",
    category: "Fall History",
    followUp: {
      text: "How many times?",
      options: ["Once", "2–3 times", "More than 3 times"],
      points: { "Once": 2, "2–3 times": 4, "More than 3 times": 6 }
    },
    options: ["Yes", "No"],
    points: { Yes: 6, No: 0 }
  },
  {
    id: 2,
    text: "Do you feel unsteady when walking?",
    category: "Balance",
    followUp: {
      text: "Do you use a cane or walker?",
      options: ["Yes", "No"],
      points: { Yes: 2, No: 0 }
    },
    options: ["Yes", "No"],
    points: { Yes: 4, No: 0 }
  },
  {
    id: 3,
    text: "Do you take any medications that cause dizziness or drowsiness?",
    category: "Medications",
    options: ["Yes", "No"],
    points: { Yes: 4, No: 0 }
  },
  {
    id: 4,
    text: "Is your home well-lit at night (especially bedroom to bathroom)?",
    category: "Environment",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 3 }
  },
  {
    id: 5,
    text: "Do you have rugs or cords on your floor that could cause tripping?",
    category: "Environment",
    options: ["Yes", "No"],
    points: { Yes: 3, No: 0 }
  },
  {
    id: 6,
    text: "Do you have grab bars installed in your bathroom?",
    category: "Safety",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 3 }
  },
  {
    id: 7,
    text: "Do you exercise at least 2x/week to improve strength and balance?",
    category: "Activity",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 3 }
  },
  {
    id: 8,
    text: "Is your vision regularly checked (within the past year)?",
    category: "Sensory",
    options: ["Yes", "No"],
    points: { Yes: 0, No: 2 }
  },
  {
    id: 9,
    text: "Do you live alone?",
    category: "Social",
    options: ["Yes", "No"],
    points: { Yes: 2, No: 0 }
  },
  {
    id: 10,
    text: "Is there anything else you’d like to share about your home or health?",
    category: "Notes",
    isText: true
  }
];

export default function App() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const current = questions[Math.floor(step)];

  const handleAnswer = (answer) => {
    const updated = [...responses, { id: current.id, answer }];
    setResponses(updated);
    if (current.followUp && answer === "Yes") {
      setStep(step + 0.5); // show follow-up next
    } else {
      setStep(Math.floor(step) + 1);
    }
  };

  const handleFollowUp = (answer) => {
    const updated = [...responses, { id: `${Math.floor(step)}-followUp`, answer }];
    setResponses(updated);
    setStep(Math.floor(step) + 1);
  };

  const handleText = (text) => {
    const updated = [...responses, { id: current.id, answer: text }];
    setResponses(updated);
    setStep(step + 1);
  };

  if (step >= questions.length) {
    return (
      <Scorecard
        responses={responses}
        questions={questions}
        onGeneratePDF={() => generatePDF(responses, questions)}
      />
    );
  }

  // Show follow-up
  if (typeof step === "number" && step % 1 !== 0) {
    const parent = questions[Math.floor(step)];
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">{parent.followUp.text}</h2>
        {parent.followUp.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleFollowUp(opt)}
            className="block w-full text-left p-2 my-2 border rounded"
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{current.text}</h2>
      {current.isText ? (
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          onBlur={(e) => handleText(e.target.value)}
          placeholder="Type your answer and click outside this box to continue"
        />
      ) : (
        current.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="block w-full text-left p-2 my-2 border rounded"
          >
            {opt}
          </button>
        ))
      )}
    </div>
  );
}

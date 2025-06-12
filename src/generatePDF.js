import jsPDF from "jspdf";

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
  "Social": "alert+systems"
};

export default function generatePDF(responses, questions, noteSuggestions = []) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Fall Risk Scorecard", 15, 20);

  let y = 30;
  const categoryScores = {};
  let earned = 0;
  let possible = 0;

  responses.forEach(({ id, answer }) => {
    const baseId = id.toString().replace("-followUp", "");
    const q = questions.find((q) => q.id.toString() === baseId);
    if (!q || !q.category || q.isText) return;

    const maxPoints = Math.max(...Object.values(q.points || {}), ...(q.followUp?.points ? Object.values(q.followUp.points) : [0]));
    const score = q.points?.[answer] ?? q.followUp?.points?.[answer] ?? 0;

    earned += score;
    possible += answer === "I don't know" ? 0 : maxPoints;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
  });

  const overallScore = possible ? Math.round(100 - (earned / possible) * 100) : "N/A";
  doc.setFontSize(12);
  doc.text(`Overall Fall Risk Score: ${overallScore}/100`, 15, y);
  y += 10;

  Object.entries(categoryScores).forEach(([category, score]) => {
    const risk = score >= 6 ? "High" : score >= 3 ? "Moderate" : "Low";
    const advice = riskAdvice[category];
    const link = `https://wellness.valehealth.com?query=${valeLinks[category]}`;

    doc.text(`${category}: ${risk} Risk`, 15, y); y += 8;
    doc.text(`Advice: ${advice}`, 15, y); y += 8;
    doc.text(`Products: ${link}`, 15, y); y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  if (noteSuggestions.length > 0) {
    doc.setFontSize(14);
    doc.text("Suggestions Based on Your Comments:", 15, y);
    y += 8;
    doc.setFontSize(12);
    noteSuggestions.forEach((sugg) => {
      doc.text(`• ${sugg}`, 15, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save("fall-risk-scorecard.pdf");
}
// generatePDF.js
import jsPDF from "jspdf";

const riskAdvice = {
  "Fall History": "Discuss fall prevention with a provider.",
  "Balance": "Consider a physical therapy balance program.",
  "Medications": "Ask your doctor to review your medications.",
  "Environment": "Remove tripping hazards and improve lighting.",
  "Safety": "Install grab bars and use non-slip mats.",
  "Activity": "Start a strength and balance exercise routine.",
  "Sensory": "Have your vision and hearing tested.",
  "Social": "Consider alert systems or support networks."
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

export default function generatePDF(responses, questions) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Fall Risk Scorecard", 15, 20);

  let y = 30;
  const categoryScores = {};

  responses.forEach(({ id, answer }) => {
    const baseId = id.toString().replace("-followUp", "");
    const q = questions.find((q) => q.id.toString() === baseId);
    if (!q || !q.category || q.isText) return;

    const score = q.points?.[answer] || q.followUp?.points?.[answer] || 0;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + score;
  });

  Object.entries(categoryScores).forEach(([category, score]) => {
    const risk = score >= 6 ? "High" : score >= 3 ? "Moderate" : "Low";
    const advice = riskAdvice[category];
    const link = `https://wellness.valehealth.com?query=${valeLinks[category]}`;

    doc.text(`${category}: ${risk} Risk`, 15, y);
    y += 8;
    doc.text(`Advice: ${advice}`, 15, y);
    y += 8;
    doc.text(`Products: ${link}`, 15, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("fall-risk-scorecard.pdf");
}

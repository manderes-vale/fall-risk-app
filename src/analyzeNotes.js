// analyzeNotes.js
export default function analyzeNotes(text) {
  const suggestions = [];

  const patterns = [
    { keyword: /rug|carpet|mat/i, recommendation: "Consider removing loose rugs or securing carpets to reduce tripping hazards." },
    { keyword: /stairs|steps/i, recommendation: "Ensure stairs have handrails and are well lit." },
    { keyword: /shower|bathtub/i, recommendation: "Install grab bars and non-slip mats in the bathroom." },
    { keyword: /night|dark|light/i, recommendation: "Add nightlights or motion-sensor lights in walkways." },
    { keyword: /medication|dizzy|sleep/i, recommendation: "Review medications with your healthcare provider for fall-related side effects." },
    { keyword: /walker|cane|aid/i, recommendation: "Use appropriate mobility aids as prescribed." }
  ];

  patterns.forEach(({ keyword, recommendation }) => {
    if (keyword.test(text)) {
      suggestions.push(recommendation);
    }
  });

  return suggestions;
}

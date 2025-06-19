import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default async function generatePDF() {
  const element = document.getElementById("scorecard-summary");
  if (!element) {
    console.error("Element with id 'scorecard-summary' not found");
    return;
  }

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const padding = 40;
    const availableWidth = pageWidth - 2 * padding;

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const imgWidth = availableWidth;
      const imgHeight = imgWidth * aspectRatio;

      const centeredX = (pageWidth - imgWidth) / 2;
      let y = padding;

      pdf.addImage(img, "PNG", centeredX, y, imgWidth, imgHeight);

      y += imgHeight + 20;

      // Disclaimer
      const disclaimer =
        "This assessment is based on the answers provided and uses artificial intelligence to help define the results and recommendations. For this reason, know that it can make mistakes and you should evaluate any actions you take carefully and in collaboration with your doctor.";

      const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * padding);

      if (y + disclaimerLines.length * 10 > pageHeight - padding) {
        pdf.addPage();
        y = padding;
      }

      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(disclaimerLines, padding, y);

      // Footer date
      const date = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(80);
      pdf.text(date, pageWidth / 2, pageHeight - padding + 20, {
        align: "center",
      });

      pdf.save("fall-risk-scorecard.pdf");
    };
  } catch (error) {
    console.error("Error generating styled PDF:", error);
  }
}
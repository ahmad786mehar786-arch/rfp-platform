const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const buildExcelBuffer = async (rfp) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("RFP Responses");

  worksheet.columns = [
    { header: "Section", key: "section", width: 25 },
    { header: "Question", key: "question", width: 40 },
    { header: "Status", key: "status", width: 20 },
    { header: "Assigned To", key: "assignedTo", width: 25 },
    { header: "Answer", key: "answer", width: 60 }
  ];

  for (const section of rfp.sections) {
    for (const question of section.questions) {
      worksheet.addRow({
        section: section.title,
        question: question.text,
        status: question.status,
        assignedTo: question.assignedTo?.name || "",
        answer: question.answerHtml || ""
      });
    }
  }

  return workbook.xlsx.writeBuffer();
};

const buildPdfBuffer = async (rfp) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(`RFP: ${rfp.title}`);
    doc.moveDown();
    doc.fontSize(12).text(`Client: ${rfp.clientName}`);
    doc.text(`Deadline: ${new Date(rfp.deadline).toLocaleDateString()}`);
    doc.text(`Status: ${rfp.overallStatus}`);
    doc.moveDown();

    rfp.sections.forEach((section, sIndex) => {
      doc.fontSize(14).text(`${sIndex + 1}. ${section.title}`);
      doc.moveDown(0.5);

      section.questions.forEach((q, qIndex) => {
        doc.fontSize(11).text(`${sIndex + 1}.${qIndex + 1} ${q.text}`, {
          underline: true
        });
        doc.fontSize(10).text(`Status: ${q.status}`);
        doc.text(`Answer: ${q.answerHtml ? q.answerHtml.replace(/<[^>]*>/g, "") : "-"}`);
        doc.moveDown();
      });

      doc.moveDown();
    });

    doc.end();
  });
};

module.exports = { buildExcelBuffer, buildPdfBuffer };

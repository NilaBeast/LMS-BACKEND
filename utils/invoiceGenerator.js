const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/* ================= RUPEE WORD CONVERTER ================= */

function numberToWords(num) {

  const a = [
    "", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
    "Seventeen","Eighteen","Nineteen"
  ];

  const b = [
    "", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"
  ];

  if ((num = num.toString()).length > 9) return "Overflow";

  const n = ("000000000" + num)
    .substr(-9)
    .match(/(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})/);

  if (!n) return;

  let str = "";

  str += (n[1] != 0)
    ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
    : "";

  str += (n[2] != 0)
    ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
    : "";

  str += (n[3] != 0)
    ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
    : "";

  str += (n[4] != 0)
    ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
    : "";

  str += (n[5] != 0)
    ? ((str !== "") ? "and " : "") +
      (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + " "
    : "";

  return str.trim();

}

/* ================= DOWNLOAD LOGO ================= */

async function downloadLogo(url, invoiceId) {

  if (!url) return null;

  const logoPath = path.join(
    __dirname,
    `../tmp/logo-${invoiceId}.png`
  );

  const response = await axios({
    url,
    responseType: "arraybuffer"
  });

  fs.writeFileSync(logoPath, response.data);

  return logoPath;

}

/* ================= GENERATE INVOICE ================= */

exports.generateInvoice = async ({
  invoiceId,
  customerName,
  itemName,
  amount,
  business
}) => {

  const filePath = path.join(
    __dirname,
    `../tmp/invoice-${invoiceId}.pdf`
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 40
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* DOWNLOAD BUSINESS LOGO */

  let logoPath = null;

  if (business?.logo) {
    logoPath = await downloadLogo(
      business.logo,
      invoiceId
    );
  }

  const signature = path.join(
    __dirname,
    "../assets/signature.png"
  );

  /* ================= HEADER ================= */

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("SERVICE INVOICE", 40, 40);

  doc
    .fontSize(10)
    .text(`Invoice # ${invoiceId}`, 40, 70);

  /* LOGO */

  if (logoPath && fs.existsSync(logoPath)) {

    doc.image(
      logoPath,
      450,
      35,
      { width: 90 }
    );

  }

  /* BUSINESS NAME */

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(
      business?.name || "Business",
      330,
      115,
      { align: "right" }
    );

  /* ================= INVOICE META ================= */

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Invoice Date : ${new Date().toLocaleDateString()}`,
      40,
      110
    );

  doc.text("Terms : Due on Receipt", 40, 125);

  doc.text(
    `Due Date : ${new Date().toLocaleDateString()}`,
    40,
    140
  );

  /* ================= BILL TO ================= */

  doc
    .font("Helvetica-Bold")
    .text("Bill To", 40, 165);

  doc
    .font("Helvetica")
    .text(customerName || "Customer", 40, 180);

  /* ================= TABLE ================= */

  const tableTop = 230;

  doc
    .rect(40, tableTop, 515, 25)
    .fill("#444");

  doc
    .fillColor("#fff")
    .fontSize(10)
    .text("#", 50, tableTop + 7)
    .text("Item & Description", 80, tableTop + 7)
    .text("Qty", 370, tableTop + 7)
    .text("Rate", 420, tableTop + 7)
    .text("Amount", 480, tableTop + 7);

  doc.fillColor("#000");

  const rowY = tableTop + 35;

  doc
    .rect(40, rowY - 5, 515, 25)
    .stroke();

  doc.text("1", 50, rowY);
  doc.text(itemName, 80, rowY);
  doc.text("1.00", 370, rowY);
  doc.text(`₹${amount}`, 420, rowY);
  doc.text(`₹${amount}`, 480, rowY);

  /* ================= TOTALS ================= */

  const totalY = rowY + 60;

  doc.moveTo(350, totalY - 10).lineTo(555, totalY - 10).stroke();

  doc.font("Helvetica").text("Sub Total", 370, totalY);
  doc.text(`₹${amount}`, 480, totalY);

  doc.font("Helvetica-Bold").text("Total", 370, totalY + 20);
  doc.text(`₹${amount}`, 480, totalY + 20);

  doc.font("Helvetica").text("Payment Made", 370, totalY + 40);
  doc.text(`(-) ₹${amount}`, 480, totalY + 40);

  doc.font("Helvetica-Bold").text("Balance Due", 370, totalY + 60);
  doc.text("₹0.00", 480, totalY + 60);

  /* ================= WORDS ================= */

  const words = numberToWords(amount);

  doc
    .fontSize(9)
    .text(
      `Total In Words: Indian Rupee ${words} Only`,
      370,
      totalY + 90
    );

  /* ================= NOTES ================= */

  doc
    .fontSize(10)
    .text("Notes", 40, totalY + 120);

  doc
    .fontSize(9)
    .text("Thanks for your business.", 40, totalY + 135);

  /* ================= SIGNATURE ================= */

  // if (fs.existsSync(signature)) {

  //   doc.image(
  //     signature,
  //     40,
  //     totalY + 170,
  //     { width: 120 }
  //   );

  // }

  doc
    .fontSize(10)
    .text("Name",40, totalY + 210);

  doc.text("Authorized Signature", 40, totalY + 240);

  doc.end();

  return new Promise(resolve => {
    stream.on("finish", () => {

      if (logoPath && fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }

      resolve(filePath);

    });
  });

};
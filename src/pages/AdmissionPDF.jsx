import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const AdmissionPDF = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const [isReady, setIsReady] = useState(false);
  const pdfRef = useRef(null);

  // Helper: Create and prepare jsPDF, but do NOT download yet
  const preparePDF = useCallback(
    () =>
      new Promise((resolve) => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 0;

        // Draw optimized watermark for small PDF size
        const watermarkImg = new window.Image();
        watermarkImg.crossOrigin = "anonymous";
        watermarkImg.src = "/logo.png";
        watermarkImg.onload = () => {
          try {
            if (pdf.setGState) {
              pdf.setGState(new pdf.GState({ opacity: 0.08 })); // Very low opacity for minimal size impact
            }
            // Center the logo within safe margins and ensure it doesn't overflow
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10; // 10mm margin on all sides
            const maxLogoSize = Math.min(pageWidth, pageHeight) - margin * 2;
            const desiredSize = Math.min(80, maxLogoSize * 0.6); // scale relative to page, cap at 80mm
            const logoWidth = desiredSize;
            const logoHeight = desiredSize;
            const logoX = Math.max(margin, (pageWidth - logoWidth) / 2);
            const logoY = Math.max(margin, (pageHeight - logoHeight) / 2);
            pdf.addImage(watermarkImg, "PNG", logoX, logoY, logoWidth, logoHeight);
            if (pdf.setGState) {
              pdf.setGState(new pdf.GState({ opacity: 1 }));
            }
          } catch (e) { /* ignore logo errors */ }
          drawContent();
        };
        watermarkImg.onerror = () => {
          drawContent();
        };

        function drawContent() {
          // Letterhead - neutral light background
          pdf.setFillColor(240, 240, 240);
          pdf.rect(0, y, pageWidth, 34, "F"); // Slightly taller letterhead height

          // Title
          pdf.setTextColor(24, 43, 92);
          pdf.setFontSize(24); // Reduced from 18 to 16
          pdf.setFont("helvetica", "bold");
          pdf.text("Pranjal Pathshala", 10, y + 14); // Added top padding for header content

          // Contact information in white text on blue background
          pdf.setFontSize(11); // Reduced from 10 to 9
          // pdf.setTextColor(255, 145, 77); // White text for better contrast
          pdf.setFont("helvetica", "normal");
          pdf.text("Email: pranjaljain2422@gmail.com", 10, y + 20);
          pdf.text("Phone: +91 94794 80495", 10, y + 25);
          pdf.text(
            "Address: Near Kapoor Bangla, Premnagar, Satna, M.P. 485001",
            10,
            y + 30
          );

          // Add bottom border to separate letterhead
          pdf.setDrawColor(24, 43, 92); // Light grey border
          pdf.setLineWidth(0.5);
          pdf.line(0, y + 34, pageWidth, y + 34);


          // Reset text color to black for the rest of the document
          pdf.setTextColor(0, 0, 0);

          y += 38; // Adjust spacing after taller letterhead

          drawSection(
            "Personal Details",
            [
              `Name: ${formData.student_name}`,
              `Class: ${formData.class}`,

              `DOB: ${formData.dob}`,
              `Gender: ${formData.gender}`,
              `Whatsapp Contact: ${formData.contact_number}`,
              `School Name: ${formData.school_name}`,
              `Board: ${formData.board}`,
              `Interested Subjects: ${Array.isArray(formData.interested_subjects)
                ? formData.interested_subjects.join(", ")
                : formData.interested_subjects || ""
              }`,
              `Address: ${formData.address}`,
            ],
            formData.photo_url,
            () => drawContactDetails()
          );
        }

        function drawSection(title, lines, photoUrl, onSectionReady) {
          // Add space before section title (tighter)
          y += 3;

          // Section title
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(24, 43, 92); // Blue color for title
          pdf.text(title, 10, y);
          pdf.setDrawColor(24, 43, 92);
          pdf.line(10, y + 2, pdf.internal.pageSize.getWidth() - 10, y + 2);
          y += 7;

          // Reset text color
          pdf.setTextColor(0, 0, 0);

          // Special 3-column layout for Personal Details with merged image column
          if (title === "Personal Details") {
            const tableX = 10;
            const headerHeight = 8;
            const rowHeightPD = 6.5;
            const rowHeightPD_Address = 18; // <- Increased cell height for Address row
            const tableWidthPD = pageWidth - 20; // narrower layout
            const imageColWidth = 34; // right-most merged column
            const dataColsWidth = tableWidthPD - imageColWidth;
            const colWidthPD = dataColsWidth / 2;

            const tableStartYPD = y;

            // Header row (semi-transparent fill to let watermark show through)
            pdf.setFillColor(240, 240, 240);
            // if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 0.2 })); }
            pdf.rect(tableX, y, tableWidthPD, headerHeight, "F");
            // if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 1 })); }
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text("Field", tableX + 2, y + 4.5);
            pdf.text("Details", tableX + 2 + colWidthPD, y + 4.5);
            pdf.text("Photo", tableX + 2 + colWidthPD * 2, y + 4.5);
            y += headerHeight;

            // Data rows for left two columns
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            lines.forEach((line, index) => {
              const [field, value] = line.split(': ');
              // Find if this is the Address field
              const isAddressRow = (field || "").trim().toLowerCase() === "address";
              const rowH = isAddressRow ? rowHeightPD_Address : rowHeightPD;

              if (index % 2 === 0) {
                pdf.setFillColor(250, 250, 250);
                if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 0.2 })); }
                pdf.rect(tableX, y, dataColsWidth, rowH, "F");
                if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 1 })); }
              }
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(tableX, y, colWidthPD, rowH);
              pdf.rect(tableX + colWidthPD, y, colWidthPD, rowH);
              pdf.text(field || "", tableX + 2, y + 4.5);
              pdf.text(value || "", tableX + 2 + colWidthPD, y + 4.5);
              y += rowH;
            });

            // Merged photo column spanning all data rows
            // (rowHeightPD used for all rows except Address which uses rowHeightPD_Address)
            const numRows = lines.length;
            let imageCellHeight = 0;
            lines.forEach((line) => {
              const [field] = line.split(': ');
              const isAddressRow = (field || "").trim().toLowerCase() === "address";
              imageCellHeight += isAddressRow ? rowHeightPD_Address : rowHeightPD;
            });
            const imageCellY = tableStartYPD + headerHeight;
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(tableX + colWidthPD * 2, imageCellY, imageColWidth, imageCellHeight);

            // Outer border for entire table
            pdf.setDrawColor(24, 43, 92);
            pdf.setLineWidth(0.5);
            pdf.rect(tableX, tableStartYPD, tableWidthPD, y - tableStartYPD);

            // Place image centered inside merged cell using natural aspect ratio
            if (photoUrl) {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.src = photoUrl;
              img.onload = () => {
                try {
                  const padding = 1.5;
                  const maxW = imageColWidth - padding * 2;
                  const maxH = imageCellHeight - padding * 2;
                  // Fit image proportionally within cell (contain)
                  const imgPixelW = img.naturalWidth || img.width;
                  const imgPixelH = img.naturalHeight || img.height;
                  let drawW = maxW;
                  let drawH = maxH;
                  if (imgPixelW && imgPixelH) {
                    const imgRatio = imgPixelW / imgPixelH;
                    const cellRatio = maxW / maxH;
                    if (imgRatio > cellRatio) {
                      // image is wider; fit width
                      drawW = maxW;
                      drawH = maxW / imgRatio;
                    } else {
                      // image is taller; fit height
                      drawH = maxH;
                      drawW = maxH * imgRatio;
                    }
                  }
                  const imgX = tableX + colWidthPD * 2 + (imageColWidth - drawW) / 2;
                  const imgY = imageCellY + (imageCellHeight - drawH) / 2;
                  const lowerSrc = (photoUrl || '').toLowerCase();
                  const format = lowerSrc.endsWith('.png') ? 'PNG' : 'JPEG';
                  pdf.addImage(img, format, imgX, imgY, drawW, drawH);
                } catch (e) { /* ignore */ }
                y += 3;
                onSectionReady();
                resolve(pdf);
              };
              img.onerror = () => {
                y += 3;
                onSectionReady();
                resolve(pdf);
              };
              return;
            } else {
              y += 3;
              onSectionReady();
              resolve(pdf);
              return;
            }
          }

          // Create table structure
          const tableStartY = y;
          const tableWidth = pageWidth - 20;
          const rowHeight = 6.5;
          // Match field column width to Personal Details section (image column = 34)
          const fieldColWidth = (tableWidth - 34) / 2;
          const detailsColWidth = tableWidth - fieldColWidth;

          // Draw table header (semi-transparent fill)
          pdf.setFillColor(240, 240, 240); // Light gray background
          // if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 0.2 })); }
          pdf.rect(10, y, tableWidth, rowHeight, "F");
          // if (pdf.setGState) { pdf.setGState(new pdf.GState({ opacity: 1 })); }
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("Field", 12, y + 4.5);
          pdf.text("Details", 12 + fieldColWidth, y + 4.5);
          y += rowHeight;

          // Draw table rows with wrapping for long values (e.g., Address)
          lines.forEach((line, index) => {
            const parts = String(line || "").split(': ');
            const field = parts.shift() || "";
            const value = parts.join(': ') || "";

            const paddingX = 2;
            const paddingY = 2;
            const valueWrapWidth = Math.max(10, detailsColWidth - paddingX * 2);
            const valueLines = pdf.splitTextToSize(value, valueWrapWidth);
            const lineHeight = 4.5;
            const valueBlockHeight = Math.max(lineHeight, valueLines.length * lineHeight);

            // Extra space for Additional Notes row
            const isAdditionalNotes = field.toLowerCase().startsWith("additional notes");
            // INCREASE height for Address row too, in the non-Personal Details sections if you'd like
            const isAddress = field.toLowerCase() === "address";
            const minHeight =
              isAdditionalNotes
                ? 20
                : isAddress
                  ? 18 // increase Address cell height here too if desired outside Personal Details
                  : rowHeight;
            const cellHeight = Math.max(minHeight, valueBlockHeight + paddingY);

            // Alternate row colors background using dynamic height
            if (index % 2 === 0) {
              pdf.setFillColor(250, 250, 250);
              pdf.rect(10, y, tableWidth, cellHeight, "F");
            }

            // Cell borders with dynamic height
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(10, y, fieldColWidth, cellHeight);
            pdf.rect(10 + fieldColWidth, y, detailsColWidth, cellHeight);

            // Text
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(field, 12, y + 4.5);
            let textY = y + 4.5;
            valueLines.forEach((v) => {
              pdf.text(v, 12 + fieldColWidth, textY);
              textY += lineHeight;
            });

            y += cellHeight;
          });

          // Draw outer table border
          pdf.setDrawColor(24, 43, 92); // Blue border
          pdf.setLineWidth(0.5);
          pdf.rect(10, tableStartY, tableWidth, y - tableStartY);

          let advanceY = y - tableStartY + 3;

          // If photo is present and it's the Personal Details section
          if (photoUrl) {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.src = photoUrl;
            img.onload = () => {
              try {
                pdf.addImage(
                  img,
                  "JPEG",
                  pdf.internal.pageSize.getWidth() - 45,
                  tableStartY + 4,
                  24,
                  24
                );
              } catch (e) {/* ignore img errors*/ }
              y += 3;
              onSectionReady();
              resolve(pdf);
            };
            img.onerror = () => {
              y += 3;
              onSectionReady();
              resolve(pdf);
            };
            return;
          } else {
            y += 3;
            onSectionReady();
            resolve(pdf);
          }
        }

        function drawContactDetails() {
          drawSection(
            "Parental Details",
            [
              `Father's Name: ${formData.father_name}`,
              `Father's Occupation: ${formData.father_occupation}`,
              `Mother's Name: ${formData.mother_name}`,
              `Mother's Occupation: ${formData.mother_occupation}`,
              `Parent Contact: ${formData.parent_contact_number}`,
              `Email: ${formData.email}`,

            ],
            null,
            () => drawOtherDetails()
          );
        }
        // function drawAcademicDetails() {
        //   drawSection(
        //     "Academic Details",
        //     [

        //     ],
        //     null,
            
        //   );
        // }
        function drawOtherDetails() {
          drawSection(
            "Other Details",
            [
              `Previously Studied With Us: ${formData.studied_with_us}`,
              `Session: ${formData.session}`,
              `Referral Source: ${formData.referral_source}`,
              `Additional Notes: ${formData.additional_notes}`,
            ],
            null,
            () => {
              // end after Other Details
              resolve(pdf);
            }
          );
        }

      }),
    [formData]
  );

  useEffect(() => {
    let mounted = true;
    if (!formData) return;

    setIsReady(false);
    pdfRef.current = null;
    preparePDF().then((pdf) => {
      if (mounted) {
        pdfRef.current = pdf;
        setIsReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [formData, preparePDF]);

  const handleDownload = () => {
    if (isReady && pdfRef.current) {
      const name =
        String(formData.student_name || "Student") + "_Admission.pdf";
      pdfRef.current.save(name);
    } else {
      alert("PDF not ready yet. Please wait a moment and try again.");
    }
  };

  if (!formData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">No form data found!</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start mt-8 min-h-screen">
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-8 max-w-lg w-full flex flex-col items-center">
        <p className="text-lg text-center font-medium mb-6">
          {isReady ? "PDF is ready. Click the button below to download." : "Preparing your PDF..."}
        </p>
        <button
          onClick={handleDownload}
          className={`px-5 py-2 bg-[#60A5FA] text-white rounded-md font-semibold transition ${isReady ? "hover:bg-[#3B82F6]" : "opacity-50 cursor-not-allowed"
            }`}
          disabled={!isReady}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default AdmissionPDF;

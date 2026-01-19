// PDFDocument.js
import React from "react";
import { Page, Text, View, Document, Image, StyleSheet } from "@react-pdf/renderer";

// Icon URLs for Remix Icons (replace with actual SVGs)
const mailIcon = "/icons/mail.svg";
const phoneIcon = "/icons/phone.svg";
const locationIcon = "/icons/location.svg";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 12,
    position: "relative",
    minHeight: 900,
  },
  watermark: {
    position: "absolute",
    left: "50%",
    top: "48%",
    transform: "translate(-50%, -50%)",
    width: 400,
    height: 400,
    opacity: 0.17,
  },
  headerBox: {
    backgroundColor: "#182B5C",
    color: "#60A5FA",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "extrabold",
    marginBottom: 5,
  },
  headerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  headerInfoText: {
    fontSize: 11,
    marginLeft: 4,
  },
  section: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#182B5C",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  text: {
    marginBottom: 2,
    fontSize: 12,
  },
  image: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
  },
  grayText: {
    color: "#9CA3AF", // Tailwind gray-400
  },
  icon: {
    width: 12,
    height: 12,
  },
});

const PDFDocument = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      <Image src="/logo.png" style={styles.watermark} />

      {/* Letterhead Box */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Pranjal Pathshala</Text>
        <View style={styles.column}>
          <View style={styles.headerInfoRow}>
            <Image src={mailIcon} style={styles.icon} />
            <Text style={styles.headerInfoText}>pranjaljain2422@gmail.com</Text>
          </View>
          <View style={styles.headerInfoRow}>
            <Image src={phoneIcon} style={styles.icon} />
            <Text style={styles.headerInfoText}>+91 94794 80495</Text>
          </View>
          <View style={styles.headerInfoRow}>
            <Image src={locationIcon} style={styles.icon} />
            <Text style={styles.headerInfoText}>
              Near Kapoor Bangla, Premnagar, Satna, M.P. 485001
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Details</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Name:</Text> {formData.student_name}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Father's Name:</Text> {formData.father_name}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Mother's Name:</Text> {formData.mother_name}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>DOB:</Text> {formData.dob}
            </Text>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "bold" }}>Gender:</Text> {formData.gender}
            </Text>
          </View>
          {formData.photo_url && <Image src={formData.photo_url} style={styles.image} />}
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Contact Details</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Student Contact:</Text> {formData.contact_number}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Parent Contact:</Text> {formData.parent_contact_number}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
          {formData.email || <Text style={styles.grayText}>N/A</Text>}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Address:</Text> {formData.address}
        </Text>
      </View>

      {/* Academic Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Academic Details</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Class:</Text> {formData.class}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>School Name:</Text> {formData.school_name}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Board:</Text> {formData.board}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Interested Subjects:</Text>{" "}
          {(formData.interested_subjects && formData.interested_subjects.length > 0)
            ? formData.interested_subjects.join(", ")
            : <Text style={styles.grayText}>N/A</Text>}
        </Text>
      </View>

      {/* Other Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Other Details</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Previously Studied With Us:</Text>{" "}
          {formData.studied_with_us || <Text style={styles.grayText}>N/A</Text>}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Session:</Text>{" "}
          {formData.session || <Text style={styles.grayText}>N/A</Text>}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Referral Source:</Text>{" "}
          {formData.referral_source || <Text style={styles.grayText}>N/A</Text>}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>Additional Notes:</Text>{" "}
          {formData.additional_notes || <Text style={styles.grayText}>N/A</Text>}
        </Text>
      </View>
    </Page>
  </Document>
);

export default PDFDocument;

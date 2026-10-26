import { db } from "@/db";
import { users, alerts, assessments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ClientProfile from "./client-profile";
import { notFound } from "next/navigation";

export default async function PatientProfileServer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const patientRecords = await db.select().from(users).where(eq(users.id, id)).limit(1);
  
  if (!patientRecords || patientRecords.length === 0) {
    notFound();
  }

  const patient = patientRecords[0];

  const patientAlerts = await db.select().from(alerts).where(eq(alerts.patientId, patient.id));
  const hasMandatoryAlert = patientAlerts.some(a => a.severity === 'MANDATORY');

  const latestChat = await db.select().from(assessments)
    .where(and(eq(assessments.patientId, patient.id), eq(assessments.type, 'chat')))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  const latestPhoto = await db.select().from(assessments)
    .where(and(eq(assessments.patientId, patient.id), eq(assessments.type, 'photo')))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  const latestForm = await db.select().from(assessments)
    .where(and(eq(assessments.patientId, patient.id), eq(assessments.type, 'form_phq9')))
    .orderBy(desc(assessments.createdAt))
    .limit(1);

  const phq9Score = latestForm.length > 0 ? latestForm[0].phq9Score : null;

  // NEW: Fetch ALL assessments for the History tab
  const allAssessments = await db.select().from(assessments)
    .where(eq(assessments.patientId, patient.id))
    .orderBy(desc(assessments.createdAt));

  let contradictionFound = false;
  const chatText = latestChat.length > 0 ? latestChat[0].rawData?.toLowerCase() || "" : "";
  const pastHistory = patient.medicalHistory?.toLowerCase() || "";

  if (
    (chatText.includes("no history") || chatText.includes("never taken medication") || chatText.includes("no meds")) 
    && pastHistory.length > 0
  ) {
    contradictionFound = true;
  }

  const profileData = {
    id: patient.id,
    name: patient.name || `Patient ${patient.accessCode || patient.id.substring(0, 4)}`, 
    meta: `ID: ${patient.id.substring(0, 8)}`,
    risk: hasMandatoryAlert ? "Critical" : "Low",
    hasMandatoryAlert,
    bipolarFlag: patient.bipolarFlag || false,
    lastChat: latestChat.length > 0 ? latestChat[0].rawData : null,
    photoData: latestPhoto.length > 0 ? latestPhoto[0].photoData : null,
    contradictionFound,
    pastHistory: patient.medicalHistory || null,
    phq9Score,
    // Pass the list of assessments to the client
    historyRecords: allAssessments.map(a => ({
      id: a.id,
      type: a.type,
      createdAt: a.createdAt,
      rawData: a.rawData
    }))
  };

  return <ClientProfile patient={profileData} />;
}
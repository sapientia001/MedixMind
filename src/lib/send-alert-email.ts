import nodemailer from 'nodemailer';

// Create a transporter using Yandex SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAlertEmail(patientName: string, triggerReason: string) {
  try {
    const info = await transporter.sendMail({
      from: `"MedixMind Alerts" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Sending to the doctor (in this case, yourself)
      subject: `🚨 CRITICAL ALERT: ${patientName}`,
      text: `
        CRITICAL SAFETY ALERT
        
        Patient: ${patientName}
        Trigger: ${triggerReason}
        
        A safety keyword was detected in the patient's chat. Please review the patient profile immediately.
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #ef4444;">Critical Safety Alert</h2>
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Trigger:</strong> ${triggerReason}</p>
          <p>A safety keyword was detected in the patient's chat. Please review the patient profile immediately.</p>
          <a href="http://localhost:3000/ru/doctor" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </div>
      `,
    });
    console.log('Alert email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
}
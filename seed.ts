import { db } from './src/db/index';
import { users } from './src/db/schema';

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing.");
    process.exit(1);
  }

  console.log("✅ DATABASE_URL found. Seeding database...");

  try {
    const doctor = await db.insert(users).values({
      email: 'doctor@medixmind.com',
      role: 'doctor',
    }).returning();

    console.log("Doctor created:", doctor[0]);

    const patient = await db.insert(users).values({
      role: 'patient',
      accessCode: 'MD-12345', 
      doctorId: doctor[0].id,
    }).returning();

    console.log("Patient created:", patient[0]);
    console.log("Done!");
    process.exit(0);
    
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
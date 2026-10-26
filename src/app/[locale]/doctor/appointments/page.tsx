import { db } from "@/db";
import { users, assessments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DoctorShell } from "@/components/medix";
import { Calendar, Clock, Video, User } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage() {
  // Fetch patients and their latest assessment
  const patients = await db.select().from(users).where(eq(users.role, 'patient'));
  
  const schedule = await Promise.all(patients.map(async (p) => {
    const latest = await db.select().from(assessments)
      .where(eq(assessments.patientId, p.id))
      .orderBy(desc(assessments.createdAt))
      .limit(1);
      
    return {
      id: p.id,
      name: p.name || `Patient ${p.accessCode}`,
      accessCode: p.accessCode,
      lastAssessmentDate: latest.length > 0 ? latest[0].createdAt : null,
      type: latest.length > 0 ? latest[0].type : "None"
    };
  }));

  // Sort by last assessment date (newest first)
  schedule.sort((a, b) => {
    if (!a.lastAssessmentDate) return 1;
    if (!b.lastAssessmentDate) return -1;
    return new Date(b.lastAssessmentDate).getTime() - new Date(a.lastAssessmentDate).getTime();
  });

  return (
    <DoctorShell>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">Appointments & Follow-ups</h1>
          <p className="text-sm text-muted-foreground">Review patients who require clinical follow-up based on their latest assessments.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((item) => (
            <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.accessCode}</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  Follow-up
                </span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    {item.lastAssessmentDate 
                      ? new Date(item.lastAssessmentDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                      : "No recent assessment"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Last action: {item.type === 'chat' ? 'AI Chat' : item.type === 'form_phq9' ? 'PHQ-9 Form' : item.type === 'photo' ? 'Photo Upload' : 'None'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/doctor/patient/${item.id}`} className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Review Profile
                </Link>
                <button className="flex items-center justify-center rounded-md border border-primary/30 px-3 py-2 text-primary hover:bg-primary-soft transition-colors">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="col-span-full p-12 text-center border rounded-xl bg-muted/10">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No appointments or recent follow-ups found.</p>
            </div>
          )}
        </div>
      </div>
    </DoctorShell>
  );
}
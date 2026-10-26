"use client";

import { useState } from "react";
import { AdminShell } from "@/components/medix";
import { Users, Search, MoreHorizontal, ShieldCheck, UserX, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialMockUsers = [
  { id: "1", name: "Dr. Smith", email: "doctor@medixmind.com", role: "Doctor", status: "Active", joined: "Oct 12, 2025" },
  { id: "2", name: "Patient MD-12345", email: "patient@example.com", role: "Patient", status: "Active", joined: "Oct 10, 2025" },
  { id: "3", name: "Dr. Ivanov", email: "ivanov@hospital.ru", role: "Doctor", status: "Active", joined: "Oct 05, 2025" },
  { id: "4", name: "Sarah Johnson", email: "sarah@example.com", role: "Patient", status: "Suspended", joined: "Sep 28, 2025" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialMockUsers);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/create-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create doctor");

      toast.success("Doctor account provisioned successfully.");
      
      const newUser = {
        id: Date.now().toString(),
        name: `Dr. ${email.split('@')[0]}`,
        email: email,
        role: "Doctor",
        status: "Active",
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      
      setUsers([newUser, ...users]);
      setEmail("");
      setPassword("");
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* HEADER RESPONSIVE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage doctors, patients, and system access.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Create Doctor
          </button>
        </div>

        {/* SEARCH BAR RESPONSIVE */}
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 shadow-sm w-full md:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>

        {/* TABLE SCROLLABLE ON MOBILE */}
        <div className="border rounded-xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b text-left text-[13px] font-bold text-foreground bg-muted/10">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                        {user.name.substring(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap",
                      user.role === "Doctor" ? "bg-blue-100 text-blue-700" : "bg-success-soft text-success-foreground"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1 w-max text-xs font-semibold whitespace-nowrap",
                      user.status === "Active" ? "text-success" : "text-destructive"
                    )}>
                      {user.status === "Active" ? <ShieldCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toast.success(`Action menu opened for ${user.name}`)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DOCTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-4 bg-muted/10">
              <div>
                <h2 className="text-lg font-bold text-foreground">Provision New Doctor</h2>
                <p className="text-xs text-muted-foreground">Create a secure account for hospital staff.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Doctor's Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.smith@hospital.ru"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Temporary Password</label>
                <input 
                  type="text" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Provide a secure password"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Provisioning...</> : "Create Doctor Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
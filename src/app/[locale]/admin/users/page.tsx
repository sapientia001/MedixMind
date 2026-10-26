"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AdminShell } from "@/components/medix";
import { Search, MoreHorizontal, ShieldCheck, UserX, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePageTour } from "@/hooks/usePageTour";

const initialMockUsers = [
  { id: "1", name: "Dr. Smith", email: "doctor@medixmind.com", role: "Doctor", status: "Active", joined: "2025-10-12" },
  { id: "2", name: "Patient MD-12345", email: "patient@example.com", role: "Patient", status: "Active", joined: "2025-10-10" },
  { id: "3", name: "Dr. Ivanov", email: "ivanov@hospital.ru", role: "Doctor", status: "Active", joined: "2025-10-05" },
  { id: "4", name: "Sarah Johnson", email: "sarah@example.com", role: "Patient", status: "Suspended", joined: "2025-09-28" },
];

export default function AdminUsers() {
  const t = useTranslations("AdminUsers");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const dateLocale = locale === "ru" ? "ru-RU" : "en-GB";

  const [users, setUsers] = useState(initialMockUsers);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  usePageTour("admin-users", [
    {
      element: '[data-onboarding-id="admin-users-header"]',
      titleKey: "adminUsersHeaderTitle",
      descKey: "adminUsersHeaderDesc",
    },
  ]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" });

  const getRoleLabel = (role: string) => {
    if (role === "Doctor") return t("roleDoctor");
    if (role === "Patient") return t("rolePatient");
    return role;
  };

  const getStatusLabel = (status: string) => {
    if (status === "Active") return t("statusActive");
    if (status === "Suspended") return t("statusSuspended");
    return status;
  };

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
      if (!res.ok) throw new Error(data.error || t("createFailed"));

      toast.success(t("createSuccess"));

      const newUser = {
        id: Date.now().toString(),
        name: `${tNav("dr")} ${email.split("@")[0]}`,
        email: email,
        role: "Doctor",
        status: "Active",
        joined: new Date().toISOString(),
      };

      setUsers([newUser, ...users]);
      setEmail("");
      setPassword("");
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || t("createFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* HEADER RESPONSIVE */}
        <div
          data-onboarding-id="admin-users-header"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-[22px] font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> {t("createDoctor")}
          </button>
        </div>

        {/* SEARCH BAR RESPONSIVE */}
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 shadow-sm w-full md:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>

        {/* TABLE SCROLLABLE ON MOBILE */}
        <div className="border rounded-xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b text-left text-[13px] font-bold text-foreground bg-muted/10">
                <th className="px-6 py-4">{t("colUser")}</th>
                <th className="px-6 py-4">{t("colRole")}</th>
                <th className="px-6 py-4">{t("colStatus")}</th>
                <th className="px-6 py-4">{t("colJoined")}</th>
                <th className="px-6 py-4">{t("colAction")}</th>
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
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap",
                        user.role === "Doctor"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-success-soft text-success-foreground"
                      )}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "flex items-center gap-1 w-max text-xs font-semibold whitespace-nowrap",
                        user.status === "Active" ? "text-success" : "text-destructive"
                      )}
                    >
                      {user.status === "Active" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(user.joined)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toast.success(t("actionMenuOpened", { name: user.name }))}
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
                <h2 className="text-lg font-bold text-foreground">{t("modalTitle")}</h2>
                <p className="text-xs text-muted-foreground">{t("modalSubtitle")}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">{t("emailLabel")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">{t("passwordLabel")}</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("provisioning")}
                  </>
                ) : (
                  t("submitButton")
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
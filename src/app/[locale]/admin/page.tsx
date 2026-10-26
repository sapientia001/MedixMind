"use client";

import { useState } from "react";
import { AdminShell } from "@/components/medix";
import {
  Server,
  Cloud,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  ShieldAlert,
  BookOpen,
  UploadCloud,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminInfrastructure() {
  const [mode, setMode] = useState<"cloud" | "local">("cloud");

  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* ЗАГОЛОВОК И ПЕРЕКЛЮЧАТЕЛЬ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">ИИ-инфраструктура</h1>
            <p className="text-sm text-muted-foreground">
              Управление клиническим развёртыванием ИИ и мониторинг производительности.
            </p>
          </div>

          <div className="flex w-full md:w-auto bg-muted rounded-lg p-1 shrink-0 border border-border/50">
            <button
              onClick={() => setMode("cloud")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all",
                mode === "cloud" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Cloud className="h-4 w-4" /> Облачный API
            </button>
            <button
              onClick={() => setMode("local")}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all",
                mode === "local" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Server className="h-4 w-4" /> Локальный сервер
            </button>
          </div>
        </div>

        {/* МЕТРИКИ ОБЛАЧНОГО РЕЖИМА */}
        {mode === "cloud" && (
          <div className="grid gap-4 md:grid-cols-3 animate-in fade-in">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Статус API</p>
                <Activity className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">Работает</p>
              <p className="text-xs text-muted-foreground mt-1">GigaChat API v2 (Сбер)</p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Средняя задержка</p>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">1.2с</p>
              <p className="text-xs text-muted-foreground mt-1">Время обработки запроса</p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Хранение данных</p>
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">Российская Федерация</p>
              <p className="text-xs text-muted-foreground mt-1">Соответствие 152-ФЗ</p>
            </div>
          </div>
        )}

        {/* МЕТРИКИ ЛОКАЛЬНОГО РЕЖИМА */}
        {mode === "local" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">

            {/* ЗАГРУЗКА МОДЕЛИ */}
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
              <UploadCloud className="h-10 w-10 text-primary mx-auto mb-3 opacity-70" />
              <h3 className="text-lg font-bold text-foreground">Загрузка весов локальной модели</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Загрузите одобренную модель вашей больницы (.safetensors, .bin) или Vision-Language адаптер (LoRA),
                чтобы работать полностью офлайн на локальном GPU-сервере.
              </p>
              <button
                onClick={() => toast.success("Загрузка модели имитирована. Запущено выделение GPU.")}
                className="w-full md:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Выбрать файл модели (.safetensors)
              </button>
            </div>

            {/* ВИЗУАЛИЗАЦИЯ VPN-ТУННЕЛЯ */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Защищённый сетевой мост (VPN-туннель)
              </h3>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                {/* Публичный шлюз */}
                <div className="flex flex-col items-center text-center w-full md:w-1/3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white border border-indigo-200 shadow-sm mb-2">
                    <Globe className="h-6 w-6 text-indigo-500" />
                  </div>
                  <p className="text-xs font-bold text-indigo-900">Публичный шлюз</p>
                  <p className="text-[10px] text-indigo-700">Yandex Cloud</p>
                </div>

                {/* Линия соединения */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                  <div className="flex items-center gap-2 text-indigo-500 rotate-90 md:rotate-0 my-4 md:my-0">
                    <div className="h-0.5 w-12 bg-indigo-300"></div>
                    <Lock className="h-4 w-4" />
                    <div className="h-0.5 w-12 bg-indigo-300"></div>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-600 mt-1">Шифрование WireGuard</p>
                </div>

                {/* Локальный узел */}
                <div className="flex flex-col items-center text-center w-full md:w-1/3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white border border-indigo-200 shadow-sm mb-2">
                    <Server className="h-6 w-6 text-indigo-500" />
                  </div>
                  <p className="text-xs font-bold text-indigo-900">Локальный узел больницы</p>
                  <p className="text-[10px] text-indigo-700">Приватный GPU-сервер</p>
                </div>
              </div>
            </div>

            {/* СИСТЕМНЫЕ МЕТРИКИ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">Перплексия (PPL)</p>
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">4.21</p>
                <p className="text-[10px] text-muted-foreground mt-1">Чем ниже, тем лучше. Оценивает беглость языка.</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">TTFT</p>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">240мс</p>
                <p className="text-[10px] text-muted-foreground mt-1">Время до первого токена.</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">Скорость генерации</p>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">38.5 т/с</p>
                <p className="text-[10px] text-muted-foreground mt-1">Токенов в секунду.</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground">Занято VRAM</p>
                  <HardDrive className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">18.2 / 24 ГБ</p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>

            {/* СПЕЦИФИКАЦИЯ МОДЕЛИ И ГАЛЛЮЦИНАЦИИ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> Спецификация модели
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">Архитектура:</span> <span className="font-semibold">GigaChat 20B (MoE)</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Всего параметров:</span> <span className="font-semibold">20 млрд</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Квантование:</span> <span className="font-semibold">INT8 (8-бит)</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Vision-адаптер:</span> <span className="font-semibold">LoRA (анализ аффекта)</span></li>
                </ul>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-warning" /> Метрики галлюцинаций
                </h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">CHAIR (релевантность изображения)</p>
                    <p className="text-3xl font-bold text-warning">6.2%</p>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[150px] text-right">
                    Доля выдуманных объектов в описаниях изображений. Чем ниже, тем лучше.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
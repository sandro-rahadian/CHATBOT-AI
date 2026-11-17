"use client";

import { AnimatedList } from "@/components/ui/animated-list";

interface NotificationItem {
  name: string;
  description: string;
  time: string;
}

const notifications: NotificationItem[] = [
  {
    name: "Sesi Baru",
    description: "AI Chatbot siap menerima pertanyaan Anda.",
    time: "15m yang lalu",
  },
  {
    name: "Gemini 2.0 Flash",
    description: "Koneksi ke Google Generative AI berhasil.",
    time: "10m yang lalu",
  },
  {
    name: "Pesan Terkirim",
    description: "Permintaan sedang diproses oleh model.",
    time: "2m yang lalu",
  },
];

export default function AnimatedListDemo() {
  return (
    <div className="flex h-[400px] w-full max-w-md flex-col p-6 overflow-hidden">
      <AnimatedList delay={1500} autoAdd={true}>
        {notifications.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md shadow-lg"
          >
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {item.name}
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </AnimatedList>
    </div>
  );
}

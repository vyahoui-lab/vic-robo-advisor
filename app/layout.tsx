import type { Metadata } from "next";
import "./globals.css";
import { ToggleProvider } from "@/lib/toggle-context";

export const metadata: Metadata = {
  title: "VIC — Robo Advisor",
  description: "Vic Investment Club · AI-powered portfolio advisor with real ETFs, valid ISINs, and full cost transparency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToggleProvider>{children}</ToggleProvider>
      </body>
    </html>
  );
}

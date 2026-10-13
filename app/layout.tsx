import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Precision Metric-Imperial Converter | Telemetry Unit Engine",
  description: "A precision physical measurement unit conversion workstation bridging imperial and metric systems with real-time URL query integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#090d16] text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}

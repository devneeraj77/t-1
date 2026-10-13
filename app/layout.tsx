import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metric-Imperial Converter | Modern & Classic",
  description: "A precision unit converter bridging imperial and metric standards with elegance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fcfaf7] text-stone-900 selection:bg-amber-200 selection:text-amber-950">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyAbroad.AI — Your AI-Powered Study Abroad Advisor",
  description:
    "Autonomous AI platform with 12 specialized agents to help you find universities, generate SOPs, match scholarships, and manage your entire study abroad journey.",
  keywords: ["study abroad", "university matching", "SOP generator", "AI advisor", "scholarships"],
  openGraph: {
    title: "StudyAbroad.AI",
    description: "12 AI Agents. 0 Consultant Fees. Your complete study abroad platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

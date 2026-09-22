import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/theme";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('studyabroad-theme');var t=s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

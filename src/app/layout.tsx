import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanShelf India | Know what's in your pack",
  description: "Scan Indian food labels, audit a cart or shelf, and find practical swaps with evidence-led ingredient context.",
  applicationName: "CleanShelf India",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f4ee" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

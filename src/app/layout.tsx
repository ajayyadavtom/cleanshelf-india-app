import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanShelf India — Know what's in your snack",
  description: "A practical Indian packaged-food label and cart auditor. Understand visible ingredients, compare verified rules and find same-craving swaps.",
  applicationName: "CleanShelf India",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f4ee" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

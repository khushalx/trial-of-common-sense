import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Trial of Common Sense",
  description: "Any topic goes on trial. Common sense always loses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

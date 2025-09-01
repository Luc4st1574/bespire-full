import "./globals.css";
import { ReactNode } from "react";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Bespire",
  description: "Bespire — Design at Scale",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
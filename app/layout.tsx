import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://first-in.vercel.app"),
  applicationName: "FirstIn",
  title: "FirstIn",
  description: "Discovery, made visible. Recognize the earliest supporters in a creator’s story.",
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: { title: "FirstIn", description: "Discovery, made visible.", siteName: "FirstIn", images: ["/og/firstin-default.png"], type: "website" },
  twitter: { card: "summary_large_image", title: "FirstIn", description: "Discovery, made visible.", images: ["/og/firstin-default.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

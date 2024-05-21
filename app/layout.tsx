import Providers from "@/components/layout/providers";
// import { Toaster } from "@/components/ui/toaster";
// import "@uploadthing/react/styles.css";
// import { Inter } from "next/font/google";
import "./globals.css";
// import "../styles/globals.css";
// import React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";

// const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = "tmpSession";
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <Toaster position="top-center" />
      <Providers session={session}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!!} />
          {children}
        </Providers>
      </body>
    </html>
  );
}

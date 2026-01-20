import Providers from "@/components/layout/providers";
// import { Toaster } from "@/components/ui/toaster";
// import "@uploadthing/react/styles.css";
import "./globals.css";
// import "../styles/globals.css";
// import React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = "tmpSession";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Toaster position="top-center" />
        <Providers session={session}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!!} />
          {children}
        </Providers>
      </body>
    </html>
  );
}

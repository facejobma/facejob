import Script from 'next/script'
import React from "react";


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <head>

            <Script
                async
                src="https://www.googletagmanager.com/gtag/js?id=${'${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}'}"
            />

            <Script id="google-analytics">
                {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${'${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}'});
          `}
            </Script>
            <title>
                Facejob
            </title>
        </head>

        <body>
        {children}
        </body>
        </html>
    )
}
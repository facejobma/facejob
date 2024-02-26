import React from "react";


// export default function RootLayout({
//                                        children,
//                                    }: {
//     children: React.ReactNode
// }) {
//     return (
//         <Html lang="en">
//         <Head>
//
//             <Script
//                 async
//                 src="https://www.googletagmanager.com/gtag/js?id=${'${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}'}"
//             />
//
//             <Script id="google-analytics">
//                 {`
//               window.dataLayer = window.dataLayer || [];
//               function gtag(){dataLayer.push(arguments);}
//               gtag('js', new Date());
//               gtag('config', ${'${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}'});
//           `}
//             </Script>
//             <title>
//                 Facejob
//             </title>
//         </Head>
//
//         <Main>
//         {children}
//         </Main>
//         </Html>
//     )
// }
//

import Document, {Html, Head, Main, NextScript} from 'next/document'
import Script from "next/script";


export default class CustomDocument extends Document {
    render() {
        return (
            <Html>

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
                <Head/>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        )
    }
}
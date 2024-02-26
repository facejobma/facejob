import React from "react";
import Document, {Html, Head, Main, NextScript} from 'next/document'
import {GoogleAnalytics} from '@next/third-parties/google'


export default class CustomDocument extends Document {
    render() {
        return (
            <Html>
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!!}/>
                <Head/>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        )
    }
}
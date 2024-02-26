import "../styles/globals.css";
import type {AppProps} from "next/app";
import {Toaster} from "react-hot-toast";
import {GoogleAnalytics} from "@next/third-parties/google";
import React from "react";

export default function App({Component, pageProps}: AppProps) {
    return (
        <>
            <div className="font-default font-medium">
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!!}/>
                <Toaster position="top-center"/>
            </div>
            <Component {...pageProps} />
        </>
    );
}

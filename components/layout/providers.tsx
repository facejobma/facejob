"use client";
import React from "react";
import {SessionProvider} from "@/app/providers/SessionProvider";

export default function Providers({
                                      children
                                  }: {
    session: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <SessionProvider>{children}</SessionProvider>
        </>
    );
}

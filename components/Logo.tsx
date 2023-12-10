import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Logo() {
    return <Link href="/" className="flex items-center px-2 py-4">
        <Image
            src="/facejobLogo.png"
            alt="Logo"
            className="w-3/4 mr-2"
            width={100}
            height={100}
        />
    </Link>;
}
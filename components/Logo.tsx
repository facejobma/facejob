import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center pb-2">
      <Image
        src="/images/favicon2.png"
        alt="FaceJob Logo"
        className="h-10 w-auto sm:h-12"
        width={64}
        height={64}
      />
    </Link>
  );
}

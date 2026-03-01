import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center px-2 md:px-10 py-4">
      <Image
        src="/images/favicon.png"
        alt="Logo"
        className="h-8 w-auto md:h-10 mr-2"
        width={150}
        height={150}
      />
    </Link>
  );
}

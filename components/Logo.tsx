import Link from "next/link";
import Image from "next/image";
import React from "react";

export function Logo() {
    return <Link href="/" className="flex items-center px-2 md:px-10 py-4">
        {/*<Image*/}
        {/*    src="/facejobLogo.png"*/}
        {/*    alt="Logo"*/}
        {/*    className="w-full mr-2"*/}
        {/*    width={100}*/}
        {/*    height={100}*/}
        {/*/>*/}
        <iframe src="https://giphy.com/embed/3o7bu7wtT19WfBAt0Y" width="50" height="50" frameBorder="0"
                className="giphy-embed" allowFullScreen></iframe>
    </Link>;
}
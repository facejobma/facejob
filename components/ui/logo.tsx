import Image from "next/image";

export function Logo() {
  return (
    <Image
      src={"/facejobLogo.png"}
      width={120}
      height={120}
      alt={"face job logo"}
    />
  );
}

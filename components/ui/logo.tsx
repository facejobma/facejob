import Image from "next/image";

export function Logo() {
  return (
    <Image
      src={"/facejobLogo.png"}
      width={80}
      height={80}
      alt={"face job logo"}
    />
  );
}

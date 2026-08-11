import Image from "next/image";
export function HeroMedia() {
  return (
    <div className="hero-media" aria-hidden="true">
      <Image
        src="/hero/creative-pipeline-light.png"
        alt=""
        fill
        sizes="100vw"
        preload
        className="hero-image hero-image--light"
        data-theme-image="light"
      />
      <Image
        src="/hero/creative-pipeline-dark.png"
        alt=""
        fill
        sizes="100vw"
        preload
        className="hero-image hero-image--dark"
        data-theme-image="dark"
      />
    </div>
  );
}

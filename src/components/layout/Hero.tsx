import Image from "next/image";
import { categoryNames } from "@/data/products";
import { shop } from "@/data/shop";

export default function Hero() {
  return (
    <section className="relative h-[230px] overflow-hidden">
      <Image
        src={shop.heroImage}
        alt="새순꽃집 꽃다발"
        fill
        preload
        sizes="(max-width: 512px) 100vw, 512px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-hero-shade/90" />
      <div className="absolute inset-x-0 bottom-9 px-6 text-white">
        <h1 className="text-[28px] font-extrabold leading-tight">{categoryNames} 예약하기</h1>
        <p className="mt-2 text-[15px] text-white/90">{shop.tagline}</p>
      </div>
    </section>
  );
}

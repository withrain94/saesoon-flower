import Image from "next/image";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { Product } from "@/data/products";
import { MAX_QUANTITY } from "@/data/reservationOptions";
import { formatPrice } from "@/lib/format";
import ProductPhotos from "./ProductPhotos";

export default function ProductOption({
  product,
  categoryName,
  quantity,
  onQuantityChange,
  photosOpen,
  onTogglePhotos,
}: {
  product: Product;
  /** "꽃다발" / "꽃바구니" */
  categoryName: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  photosOpen: boolean;
  onTogglePhotos: () => void;
}) {
  const selected = quantity > 0;

  return (
    <li className={`-mx-5 px-5 py-5 transition-colors ${selected ? "bg-brand-tint" : ""}`}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-snug text-ink">{product.title}</h3>
          <ul className="mt-2 space-y-0.5 text-[13.5px] leading-relaxed text-sub">
            {product.points.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onTogglePhotos}
          aria-expanded={photosOpen}
          aria-label={`${product.label} ${categoryName} 사진 ${photosOpen ? "접기" : "더보기"}`}
          className="relative h-[124px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-soft"
        >
          <Image
            src={product.images[product.cover]}
            alt={`${product.label} ${categoryName} 대표 사진`}
            fill
            sizes="120px"
            className="object-cover"
          />
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
            {photosOpen ? "접기" : `사진 ${product.images.length}`}
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[17px] font-bold text-ink">{formatPrice(product.price)}</p>
        <QuantityStepper
          value={quantity}
          max={MAX_QUANTITY}
          label={`${product.label} ${categoryName}`}
          onChange={onQuantityChange}
        />
      </div>
      <p
        className={`mt-2 text-right text-[15px] font-bold ${selected ? "text-brand-dark" : "text-faint"}`}
      >
        {formatPrice(product.price * quantity)}
      </p>

      {photosOpen && <ProductPhotos product={product} categoryName={categoryName} />}
    </li>
  );
}

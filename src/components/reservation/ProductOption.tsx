import Image from "next/image";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { Product } from "@/data/products";
import { MAX_QUANTITY } from "@/data/reservationOptions";
import { useT } from "@/hooks/useLocale";
import { getItemName, getProductCopy } from "@/lib/selection";
import ProductPhotos from "./ProductPhotos";

export default function ProductOption({
  product,
  quantity,
  onQuantityChange,
  photosOpen,
  onTogglePhotos,
  featured = false,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  photosOpen: boolean;
  onTogglePhotos: () => void;
  /** 사진을 위에서 이미 크게 보여준 상품 — 옆 작은 사진·사진 펼치기 없이 설명·수량만 */
  featured?: boolean;
}) {
  const t = useT();
  const selected = quantity > 0;
  const copy = getProductCopy(product, t);
  const itemName = getItemName(product, t);

  return (
    <li className={`-mx-5 px-5 py-5 transition-colors ${selected ? "bg-brand-tint" : ""}`}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-snug text-ink">{copy.title}</h3>
          <ul className="mt-2 space-y-0.5 text-[13.5px] leading-relaxed text-sub">
            {copy.points.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </div>

        {!featured && (
          <button
            type="button"
            onClick={onTogglePhotos}
            aria-expanded={photosOpen}
            aria-label={t.productOption.photoToggle(itemName, photosOpen)}
            className="relative h-[124px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-soft"
          >
            <Image
              src={product.images[product.cover]}
              alt={t.productOption.coverAlt(itemName)}
              fill
              sizes="120px"
              className="object-cover"
            />
            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
              {photosOpen ? t.common.close : t.productOption.photoCount(product.images.length)}
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[17px] font-bold text-ink">{t.format.price(product.price)}</p>
        <QuantityStepper value={quantity} max={MAX_QUANTITY} label={itemName} onChange={onQuantityChange} />
      </div>
      <p
        className={`mt-2 text-right text-[15px] font-bold ${selected ? "text-brand-dark" : "text-faint"}`}
      >
        {t.format.price(product.price * quantity)}
      </p>

      {!featured && photosOpen && <ProductPhotos product={product} itemName={itemName} />}
    </li>
  );
}

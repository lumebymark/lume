// frontend/src/components/PropertyCard.tsx
import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from "lucide-react";
import type { Listing } from "@/lib/public-api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency = "EUR"): string {
  if (currency === "EUR") return `€${price.toLocaleString("en-IE")}`;
  return `${price.toLocaleString()} ${currency}`;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment:            "Apartment",
  penthouse:            "Penthouse",
  villa:                "Villa",
  townhouse:            "Townhouse",
  estate:               "Estate",
  farmhouse:            "Farmhouse",
  quinta:               "Quinta",
  land:                 "Land",
  new_development_unit: "New Development",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale:           "For Sale",
  rent:           "For Rent",
  seasonal_rent:  "Seasonal",
};

// ─── Grid Card ───────────────────────────────────────────────────────────────

interface PropertyCardProps {
  listing: Listing;
  view?: "grid" | "list";
}

export default function PropertyCard({ listing, view = "grid" }: PropertyCardProps) {
  const {
    slug, title, city, area, region,
    price, currency, listing_type, property_type,
    bedrooms, bathrooms, interior_living_area,
    cover_image, short_description, featured,
  } = listing;

  const href     = `/properties/${slug}`;
  const typeLabel = PROPERTY_TYPE_LABELS[property_type] ?? property_type;
  const saleLabel = LISTING_TYPE_LABELS[listing_type]   ?? listing_type;
  const location  = [area, city].filter(Boolean).join(", ");

  if (view === "list") {
    return (
      <Link
        to={href}
        className="group flex gap-0 overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:border-stone-300 hover:shadow-md"
      >
        {/* Image */}
        <div className="relative h-44 w-52 shrink-0 overflow-hidden sm:h-52 sm:w-64">
          <img
            src={cover_image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {featured && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-900">
              Featured
            </span>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
            {saleLabel}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-widest text-stone-400">
                {typeLabel}
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-stone-600" />
            </div>
            <h3 className="mb-1 line-clamp-1 text-base font-light tracking-tight text-stone-900 group-hover:text-stone-700">
              {title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-stone-400">
              <MapPin className="h-3 w-3" />
              {location || region}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
              {short_description}
            </p>
          </div>

          <div className="flex items-end justify-between pt-3">
            <div className="flex gap-4 text-xs text-stone-500">
              {bedrooms != null && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" /> {bedrooms}
                </span>
              )}
              {bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" /> {bathrooms}
                </span>
              )}
              {interior_living_area ? (
                <span className="flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5" /> {interior_living_area.toLocaleString()} m²
                </span>
              ) : null}
            </div>
            <p className="text-base font-light tracking-tight text-stone-900">
              {formatPrice(price, currency ?? "EUR")}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid view (default) ────────────────────────────────────────────────────
  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:border-stone-300 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cover_image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-900">
            Featured
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-stone-700 backdrop-blur-sm">
          {saleLabel}
        </span>
        <p className="absolute bottom-3 left-3 text-xl font-light tracking-tight text-white drop-shadow">
          {formatPrice(price, currency ?? "EUR")}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-stone-400">
            {typeLabel}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-stone-300 transition group-hover:text-stone-600" />
        </div>
        <h3 className="mb-1 line-clamp-1 text-sm font-light tracking-tight text-stone-900">
          {title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-stone-400">
          <MapPin className="h-3 w-3 shrink-0" />
          {location || region}
        </p>

        {/* Stats */}
        <div className="mt-auto flex gap-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" /> {bedrooms} bed
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" /> {bathrooms} bath
            </span>
          )}
          {interior_living_area ? (
            <span className="flex items-center gap-1">
              <Maximize className="h-3 w-3" /> {interior_living_area.toLocaleString()} m²
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

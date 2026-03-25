// frontend/src/components/ListingsSection.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchListings, type Listing } from "@/lib/public-api";

// ── Helpers ──────────────────────────────────────────────────────────────

function formatPrice(price: number, currency = "EUR", listingType = "sale"): string {
  const formatted = currency === "EUR"
    ? `€${price.toLocaleString("en-IE")}`
    : `${price.toLocaleString()} ${currency}`;
  return listingType === "rent" ? `${formatted}/mo` : formatted;
}

function formatSpecs(l: Listing): string {
  const parts: string[] = [];
  if (l.bedrooms != null) parts.push(`${l.bedrooms} Bed`);
  if (l.bathrooms != null) parts.push(`${l.bathrooms} Bath`);
  if (l.interior_living_area) parts.push(`${l.interior_living_area}m²`);
  return parts.join(" · ");
}

function getTag(l: Listing): string {
  if (l.views && l.views.length > 0) {
    const label = l.views[0].replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1) + " View";
  }
  if (l.featured) return "Featured";
  return l.property_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function locationString(l: Listing): string {
  const parts = [l.city, l.area].filter((v, i, a) => v && a.indexOf(v) === i);
  return parts.join(", ");
}

// ── Skeleton card ────────────────────────────────────────────────────────

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="mb-5 aspect-[4/5] bg-muted animate-pulse rounded-sm" />
      <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-2" />
      <div className="h-3 w-1/2 bg-muted animate-pulse rounded mb-3" />
      <div className="flex justify-between">
        <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────

const ListingsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-listings"],
    queryFn: () => fetchListings({ limit: 6 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const listings = data?.properties ?? [];

  return (
    <section id="listings" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Curated For You</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-foreground">
            Your Matched Properties
          </h2>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} delay={i * 0.15} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground font-body">
              New properties are being curated. Check back soon.
            </p>
          </motion.div>
        )}

        {/* Listing cards */}
        {!isLoading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.slice(0, 6).map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link
                  to={`/properties/${listing.slug}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden mb-5 aspect-[4/5]">
                    <img
                      src={listing.cover_image}
                      alt={listing.title}
                      loading={i < 3 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-background/90 text-foreground text-[10px] tracking-[0.2em] uppercase">
                        {getTag(listing)}
                      </span>
                    </div>
                    {listing.listing_type === "rent" && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-secondary/90 text-secondary-foreground text-[10px] tracking-[0.2em] uppercase">
                          Rent
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="font-display text-xl font-light text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {listing.title}
                    </h3>
                    <p className="text-xs tracking-wider text-muted-foreground mb-3">
                      {locationString(listing)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg text-primary">
                        {formatPrice(listing.price, listing.currency, listing.listing_type)}
                      </span>
                      <span className="text-[11px] tracking-wider text-muted-foreground">
                        {formatSpecs(listing)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all link */}
        {!isLoading && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link
              to="/properties"
              className="inline-block px-10 py-3.5 border border-border text-xs tracking-[0.2em] uppercase text-foreground font-body hover:bg-muted transition-colors duration-300"
            >
              View All Properties
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ListingsSection;

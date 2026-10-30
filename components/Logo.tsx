import Link from "next/link";
/** Lockup rebuilt from the brand logo: star, mixed-case wordmark, optional tagline between rules.
 *  TODO: replace with the supplied transparent SVG/PNG once available for exact letterforms. */
export function Star({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor"><path d="M12 0c.9 6.6 4.4 10.1 12 12-7.6 1.9-11.1 5.4-12 12-.9-6.6-4.4-10.1-12-12C7.600 10.100 11.100 6.600 12 0z" /></svg>;
}
export default function Logo({ tagline = false, tone = "dark" }: { tagline?: boolean; tone?: "dark" | "light" }) {
  const c = tone === "light" ? "text-champagne" : "text-gold";
  return (<Link href="/" aria-label="Sahayra home" className={`inline-flex flex-col items-center leading-none ${c}`}>
    <Star /><span className="mt-1 font-serif text-[1.9rem] font-medium">Sahayra</span>
    {tagline && <span className="mt-2 flex items-center gap-2 text-[0.6rem] tracking-[0.3em]"><i className="h-px w-5 bg-current" />YOU DESERVE THIS<i className="h-px w-5 bg-current" /></span>}
  </Link>);
}

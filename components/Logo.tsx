export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#inicio" aria-label="Distrito Villarreal, inicio">
      <span className="brand__mark" aria-hidden="true">
        <img src="/images/distrito-villarreal-logo.webp" alt="" />
      </span>
      <span className="brand__word" aria-hidden="true">
        <span>DISTRITO</span>
        <span>VILLARREAL</span>
      </span>
    </a>
  );
}

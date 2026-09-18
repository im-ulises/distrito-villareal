export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#inicio" aria-label="Distrito Villarreal, inicio">
      <img src="/images/distrito-villarreal-logo.png" alt="Distrito Villarreal" />
    </a>
  );
}

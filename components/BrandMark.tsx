type BrandMarkProps = {
  className?: string;
  ink?: string;
  accent?: string;
};

export function BrandMark({ className, ink = "#F7F2E7", accent = "#C8962F" }: BrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g fill={ink}>
        <rect x="13" y="9" width="10" height="46" rx="1.2" />
        <rect x="13" y="9" width="40" height="10" rx="1.2" />
        <rect x="13" y="27" width="27" height="10" rx="1.2" />
      </g>
      <circle cx="55" cy="14" r="7" fill={accent} />
    </svg>
  );
}

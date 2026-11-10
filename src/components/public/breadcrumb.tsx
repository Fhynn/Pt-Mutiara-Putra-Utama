import Link from "next/link";

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Beranda</Link>
      {items.map((item) => (
        <span key={`${item.label}-${item.href ?? "current"}`}>
          <span aria-hidden="true">/</span>{" "}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

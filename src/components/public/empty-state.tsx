import Link from "next/link";

export function EmptyState({
  title,
  description,
  href = "/kontak",
  label = "Hubungi Kami"
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button-primary" href={href}>
        {label}
      </Link>
    </div>
  );
}

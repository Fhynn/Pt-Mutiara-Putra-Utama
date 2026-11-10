import { Breadcrumb } from "@/components/public/breadcrumb";

export function PageHero({
  title,
  description,
  breadcrumb
}: {
  title: string;
  description: string;
  breadcrumb?: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        {breadcrumb ? <Breadcrumb items={[{ label: breadcrumb }]} /> : null}
        <h1 className="page-title">{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

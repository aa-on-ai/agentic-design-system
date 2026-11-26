import Link from "next/link";

export function PageRole({
  stage,
  title,
  description,
  link = { href: "/trace/002", label: "See a real run" },
}: {
  stage: string;
  title: string;
  description: string;
  link?: { href: string; label: string };
}) {
  return (
    <aside className="ads-page-role" aria-label={`${title} role in Agentic Design System`}>
      <div>
        <span>{stage}</span>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
      <Link className="focus-ring" href={link.href}>{link.label}</Link>
    </aside>
  );
}

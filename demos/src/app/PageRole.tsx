import Link from "next/link";

export function PageRole({
  stage,
  title,
  description,
}: {
  stage: string;
  title: string;
  description: string;
}) {
  return (
    <aside className="ads-page-role" aria-label={`${title} role in Agentic Design System`}>
      <div>
        <span>{stage}</span>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
      <Link className="focus-ring" href="/#assembly-line">See an interface run</Link>
    </aside>
  );
}

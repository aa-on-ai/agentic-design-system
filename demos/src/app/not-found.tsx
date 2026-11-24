import type { Metadata } from "next";
import { NotFoundView } from "./NotFoundView";
import { SITE_NAME } from "./site";

export const metadata: Metadata = {
  title: `Page not found / ${SITE_NAME}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}

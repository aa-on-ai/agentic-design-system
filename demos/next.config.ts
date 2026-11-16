import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/examples/account-settings/:file.html", headers: [
      { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'self'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ] }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

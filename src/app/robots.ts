import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/profile/edit"],
      },
    ],
    sitemap: "https://aurarank.me/sitemap.xml",
  };
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://objective-dev.vercel.app";

  // Define primary pages to map dynamically
  const routes = [
    "",
    "/files",
    "/folders",
    "/editor",
    "/search",
    "/about",
    "/contact",
    "/settings",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/files" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/files" ? 0.9 : 0.7,
  }));
}

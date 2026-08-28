const DEFAULT_APP_ORIGIN = "https://app.eduvero.com";

export function getAllowedClerkOrigins() {
  const origins = [
    process.env.NEXT_PUBLIC_APP_URL,
    DEFAULT_APP_ORIGIN,
    "https://eduvero.com",
  ].filter(Boolean) as string[];

  return Array.from(new Set(origins.map((origin) => origin.replace(/\/$/, ""))));
}

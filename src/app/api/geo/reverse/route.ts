import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lonNum}&format=json&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AuraRank/1.0 (aurarank.me)",
        "Accept-Language": "en",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error("Nominatim error");

    const data = await res.json();
    const addr = data.address ?? {};

    const countryCode = (addr.country_code ?? "").toUpperCase();
    const countryName = addr.country ?? "";
    const city =
      addr.city ??
      addr.town ??
      addr.municipality ??
      addr.county ??
      "";
    const town =
      addr.suburb ??
      addr.neighbourhood ??
      addr.village ??
      addr.hamlet ??
      "";

    return NextResponse.json({ countryCode, countryName, city, town });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }
}

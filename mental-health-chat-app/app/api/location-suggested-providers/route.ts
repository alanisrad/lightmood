import { NextResponse } from "next/server";

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

export async function GET(req: Request) {
  try {
    // Try to extract IP address from request headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = (forwardedFor?.split(",")?.[0] || "8.8.8.8").trim();

    const geoRes = await fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`);
    const geoData = await geoRes.json();

    const location =
        geoData?.city && geoData?.region
            ? `${geoData.city}, ${geoData.region}`
            : geoData?.city || geoData?.region || "your area";

    // Static list of providers for demo purposes
    const providers = [
      {
        name: "MindWell Therapy Center",
        address: "123 Wellness St, Demo City, FL",
        type: "Counseling & CBT",
        website: "https://example.com/mindwell"
      },
      {
        name: "CalmPath Mental Health",
        address: "456 Peace Ave, Demo City, FL",
        type: "Psychotherapy",
        website: "https://example.com/calmpath"
      },
      {
        name: "HeartSpace Therapy Group",
        address: "789 Reflection Blvd, Demo City, FL",
        type: "Group & Individual Therapy",
        website: "https://example.com/heartspace"
      }
    ];

    return NextResponse.json({
      location,
      providers
    });
  } catch (error) {
    console.error("❌ Error fetching location and providers:", error);
    return NextResponse.json(
      {
        location: "Unknown",
        providers: [],
        error: "Failed to retrieve location or providers."
      },
      { status: 500 }
    );
  }
}

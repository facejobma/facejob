import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "api.facejob.ma",
  "utfs.io",
  "lh3.googleusercontent.com",
  "media.licdn.com",
  "localhost",
  "127.0.0.1",
]);

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let imageUrl: URL;

  try {
    imageUrl = new URL(rawUrl.replace(/\\\//g, "/"));
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(imageUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported image URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(imageUrl.hostname)) {
    return NextResponse.json({ error: "Image host not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(imageUrl.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL is not an image" }, { status: 415 });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load image" }, { status: 502 });
  }
}

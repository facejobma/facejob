import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "api.facejob.ma",
  "utfs.io",
  "ufs.sh",
  "localhost",
  "127.0.0.1",
]);

const isAllowedHost = (hostname: string) =>
  ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".ufs.sh") || hostname.endsWith(".amazonaws.com");

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing video URL" }, { status: 400 });
  }

  let videoUrl: URL;

  try {
    videoUrl = new URL(rawUrl.replace(/\\\//g, "/"));
  } catch {
    return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(videoUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported video URL" }, { status: 400 });
  }

  if (!isAllowedHost(videoUrl.hostname)) {
    return NextResponse.json({ error: "Video host not allowed" }, { status: 403 });
  }

  const range = request.headers.get("range");

  try {
    const response = await fetch(videoUrl.toString(), {
      headers: {
        Accept: "video/*,*/*;q=0.8",
        ...(range ? { Range: range } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: "Video not found" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
    });

    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");

    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load video" }, { status: 502 });
  }
}

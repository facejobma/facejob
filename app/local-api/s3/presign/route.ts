import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash } from "crypto";

// ===== AWS Signature V4 presigned URL generator (no SDK needed) =====

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSHA256(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmacSHA256("AWS4" + secretKey, dateStamp);
  const kRegion = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, service);
  const kSigning = hmacSHA256(kService, "aws4_request");
  return kSigning;
}

function generatePresignedUrl(params: {
  bucket: string;
  key: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  contentType: string;
  expiresIn: number;
}): string {
  const { bucket, key, region, accessKeyId, secretAccessKey, contentType, expiresIn } = params;
  const service = "s3";
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const method = "PUT";

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dateOnly = dateStamp.substring(0, 8);
  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  // Canonical query string (sorted alphabetically)
  const queryParams: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": dateStamp,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host",
  };

  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join("&");

  // Canonical headers
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = "content-type;host";

  // Canonical request
  const canonicalRequest = [
    method,
    `/${encodeURIComponent(key).replace(/%2F/g, "/")}`,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  // String to sign
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    dateStamp,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  // Signature
  const signingKey = getSignatureKey(secretAccessKey, dateOnly, region, service);
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  // Final URL
  return `https://${host}/${encodeURIComponent(key).replace(/%2F/g, "/")}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

// ===== API Route Handler =====

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    const authResponse = await fetch(`${backendUrl}/api/v1/user`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
    });
    if (!authResponse.ok) {
      return NextResponse.json({ error: "Invalid or expired candidate session" }, { status: 401 });
    }

    const region = process.env.FACEJOB_AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-west-3";
    const accessKeyId = process.env.FACEJOB_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.FACEJOB_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.FACEJOB_AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET;

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { error: "S3 upload is not configured on this server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { filename, contentType, fileSize } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType are required" },
        { status: 400 }
      );
    }

    const allowedTypes: Record<string, { extension: string; maxBytes: number }> = {
      "video/mp4": { extension: "mp4", maxBytes: 50 * 1024 * 1024 },
      "video/webm": { extension: "webm", maxBytes: 50 * 1024 * 1024 },
      "video/quicktime": { extension: "mov", maxBytes: 50 * 1024 * 1024 },
      "image/jpeg": { extension: "jpg", maxBytes: 5 * 1024 * 1024 },
      "image/png": { extension: "png", maxBytes: 5 * 1024 * 1024 },
      "image/webp": { extension: "webp", maxBytes: 5 * 1024 * 1024 },
    };
    const uploadPolicy = allowedTypes[contentType];
    if (!uploadPolicy) {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 422 });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > uploadPolicy.maxBytes) {
      return NextResponse.json({ error: "File size exceeds the allowed limit" }, { status: 422 });
    }

    // Generate a secure random filename
    const extension = uploadPolicy.extension;
    const randomKey = `${crypto.randomUUID()}.${extension}`;

    // Generate presigned URL using pure Node.js crypto (no AWS SDK!)
    const presignedUrl = generatePresignedUrl({
      bucket: bucketName,
      key: randomKey,
      region,
      accessKeyId,
      secretAccessKey,
      contentType,
      expiresIn: 3600,
    });

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${randomKey}`;

    return NextResponse.json({
      presignedUrl,
      fileUrl,
      key: randomKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack?.substring(0, 300) },
      { status: 500 }
    );
  }
}

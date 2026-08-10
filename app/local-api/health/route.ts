import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env_check: {
      has_region: !!process.env.FACEJOB_AWS_REGION,
      has_access_key: !!process.env.FACEJOB_AWS_ACCESS_KEY_ID,
      has_secret_key: !!process.env.FACEJOB_AWS_SECRET_ACCESS_KEY,
      has_bucket: !!process.env.FACEJOB_AWS_S3_BUCKET_NAME,
      node_version: process.version,
    }
  });
}

export async function POST() {
  return NextResponse.json({ status: "ok", method: "POST" });
}

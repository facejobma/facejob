import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "videoUrl is required" },
        { status: 400 }
      );
    }

    // Check if it's an AWS S3 URL
    if (!videoUrl.includes("amazonaws.com")) {
      return NextResponse.json(
        { message: "Not an S3 URL, skipped S3 deletion" },
        { status: 200 }
      );
    }

    const region = process.env.FACEJOB_AWS_REGION || "eu-west-3";
    const accessKeyId = process.env.FACEJOB_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.FACEJOB_AWS_SECRET_ACCESS_KEY;
    const bucketName =
      process.env.FACEJOB_AWS_S3_BUCKET_NAME ||
      "facejob-videos-storage-883105811428-eu-west-3";

    if (!accessKeyId || !secretAccessKey) {
      console.error("AWS S3 credentials missing for delete route");
      return NextResponse.json(
        { error: "S3 credentials missing" },
        { status: 500 }
      );
    }

    // Extract key from URL (e.g. "https://bucket.s3.region.amazonaws.com/12345_video.mp4")
    const urlObj = new URL(videoUrl);
    const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ""));

    if (!key) {
      return NextResponse.json(
        { error: "Could not extract S3 key from URL" },
        { status: 400 }
      );
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

    console.log(`[S3 Delete] Successfully deleted ${key} from ${bucketName}`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${key} from S3`,
    });
  } catch (error: any) {
    console.error("[S3 Delete Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file from S3" },
      { status: 500 }
    );
  }
}

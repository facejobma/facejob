"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function TestUploadPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test UploadThing</h1>
      
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4">Image Upload Test</h2>
        <UploadDropzone<OurFileRouter, "imageUpload">
          endpoint="imageUpload"
          input={{
            profileUpdate: true,
            companyLogo: false
          }}
          onClientUploadComplete={(res) => {
            console.log("Upload completed:", res);
            alert("Upload completed successfully!");
          }}
          onUploadError={(error) => {
            console.error("Upload error:", error);
            alert(`Upload error: ${error.message}`);
          }}
          onUploadBegin={() => {
            console.log("Upload started");
          }}
        />
      </div>
    </div>
  );
}
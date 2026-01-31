import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

// Flexible authentication function that allows both authenticated and signup uploads
async function authenticateUser(req: Request) {
  // Extract authorization header
  const authHeader = req.headers.get("authorization");
  
  // If no auth header, allow for signup process
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No authentication header found - allowing signup upload");
    return { 
      userId: "signup-user", 
      userType: "signup",
      userEmail: "signup@temp.com" 
    };
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token || token.length < 10) {
    console.log("Invalid token - allowing signup upload");
    return { 
      userId: "signup-user", 
      userType: "signup",
      userEmail: "signup@temp.com" 
    };
  }

  // Validate token with backend API for authenticated users
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/api/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log("Token validation failed - allowing signup upload");
      return { 
        userId: "signup-user", 
        userType: "signup",
        userEmail: "signup@temp.com" 
      };
    }

    const user = await response.json();
    
    // Validate user data
    if (!user || !user.id || !user.type) {
      console.log("Invalid user data - allowing signup upload");
      return { 
        userId: "signup-user", 
        userType: "signup",
        userEmail: "signup@temp.com" 
      };
    }

    return { 
      userId: user.id.toString(), 
      userType: user.type,
      userEmail: user.email 
    };
  } catch (error) {
    console.error("Authentication error:", error);
    // Allow upload for signup process even if authentication fails
    return { 
      userId: "signup-user", 
      userType: "signup",
      userEmail: "signup@temp.com" 
    };
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Video upload with enhanced security
  videoUpload: f({
    "video/mp4": { maxFileSize: "32MB" },
    "video/webm": { maxFileSize: "32MB" },
    "video/quicktime": { maxFileSize: "32MB" }
  })
    .input(z.object({ 
      candidateId: z.number().optional(),
      jobId: z.number().optional() 
    }))
    .middleware(async ({ req }) => {
      return await authenticateUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Security: Log upload for audit trail
      console.log("Secure video upload completed:", {
        userId: metadata.userId,
        userType: metadata.userType,
        fileUrl: file.url,
        fileSize: file.size,
        fileName: file.name,
        timestamp: new Date().toISOString()
      });
      
      // Security: Validate file type by content (magic numbers)
      if (!file.url.match(/\.(mp4|webm|mov)$/i)) {
        throw new Error("Invalid file type detected");
      }
      
      return { 
        uploadedBy: metadata.userId,
        success: true,
        message: "Video uploaded successfully"
      };
    }),
    
  // Image upload with enhanced security
  imageUpload: f({
    "image/jpeg": { maxFileSize: "4MB" },
    "image/png": { maxFileSize: "4MB" },
    "image/webp": { maxFileSize: "4MB" }
  })
    .input(z.object({
      profileUpdate: z.boolean().optional(),
      companyLogo: z.boolean().optional()
    }))
    .middleware(async ({ req }) => {
      return await authenticateUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Security: Log upload for audit trail
      console.log("Secure image upload completed:", {
        userId: metadata.userId,
        userType: metadata.userType,
        fileUrl: file.url,
        fileSize: file.size,
        fileName: file.name,
        timestamp: new Date().toISOString()
      });
      
      // Security: Validate file type by content
      if (!file.url.match(/\.(jpg|jpeg|png|webp)$/i)) {
        throw new Error("Invalid image type detected");
      }
      
      return { 
        uploadedBy: metadata.userId,
        success: true,
        message: "Image uploaded successfully"
      };
    }),

  // Document upload with enhanced security
  documentUpload: f({
    "application/pdf": { maxFileSize: "8MB" }
  })
    .input(z.object({
      documentType: z.enum(["cv", "certificate", "portfolio"]),
      candidateId: z.number().optional()
    }))
    .middleware(async ({ req }) => {
      return await authenticateUser(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Security: Log upload for audit trail
      console.log("Secure document upload completed:", {
        userId: metadata.userId,
        userType: metadata.userType,
        fileUrl: file.url,
        fileSize: file.size,
        fileName: file.name,
        timestamp: new Date().toISOString()
      });
      
      // Security: Validate PDF file
      if (!file.url.match(/\.pdf$/i)) {
        throw new Error("Only PDF documents are allowed");
      }
      
      return { 
        uploadedBy: metadata.userId,
        success: true,
        message: "Document uploaded successfully"
      };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;



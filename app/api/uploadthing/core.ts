import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  videoUpload: f({ video: { maxFileSize: "32MB" }, image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      // return { uploadedBy: metadata.userId } as any as void;
    }),
  imageUpload: f({
    image: { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Image uploadée :", file.url);
  }),

  videoUploadOnly: f({
    video: { maxFileSize: "32MB" }, // seulement vidéo
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Vidéo uploadée :", file.url);
    // Tu peux stocker file.url dans ta DB ici si besoin
  }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;



import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { createHash } from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Function to upload image to Cloudinary
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  userId: string
): Promise<UploadApiResponse | undefined> {
  // create SHA-1 hash of the image buffer
  const hash = createHash("sha1").update(imageBuffer).digest("hex");
  // use the hash as the public_id
  const publicId = `${userId}/${hash}`;

  // folder based on development or production
  const folder =
    process.env.NODE_ENV === "development" ? "user-uploads-dev" : "user-uploads";

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          overwrite: false,
          folder: `${folder}/${userId}`,
        },
        (error, uploadResult) => {
          if (error) {
            console.error("Error uploading image:", error);
            reject(error);
          }
          resolve(uploadResult);
        }
      )
      .end(imageBuffer);
  });
}

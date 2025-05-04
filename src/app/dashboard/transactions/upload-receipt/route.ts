import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { createHash } from "crypto";

export async function POST(request: Request) {
  const userId = await getUserId();
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  try {
    // Run both operations in parallel
    const [uploadResult, aiResponse] = await Promise.all([
      uploadImageToCloudinary(imageBuffer, userId),
      analyzeImageWithAI(imageBuffer, file.type),
    ]);

    return new Response(
      JSON.stringify({ ...aiResponse.object, url: uploadResult?.url }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json(
      { error: "Failed to process the image" },
      { status: 500 }
    );
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  userId: string
): Promise<UploadApiResponse | undefined> {
  // create SHA-1 hash of the image buffer
  const hash = createHash("sha1").update(imageBuffer).digest("hex");
  // use the hash as the public_id
  const publicId = `${userId}/${hash}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          overwrite: false,
          folder: `user-uploads/${userId}`,
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

// Function to analyze image with AI
async function analyzeImageWithAI(imageBuffer: Buffer, fileType: string) {
  return generateObject({
    model: google("gemini-1.5-flash-latest"),
    schema: z.object({
      title: z
        .string()
        .describe(
          "Carefully analyze the attached receipt image. Detect and extract the main title — typically the store name, or if not available, a key product name. Ensure the result is concise and accurately reflects the most prominent text."
        ),
      description: z
        .string()
        .describe(
          "Analyze the receipt description carefully. Extract and identify each item purchased, along with its main category if available. Reformat the receipt into multiple lines, listing one item per line, for clear and easy reading."
        ),
      date: z
        .string()
        .describe(
          "Extract the transaction date from the receipt. Interpret it correctly based on local date format (e.g., DD.MM.YY) and convert it to ISO format: YYYY-MM-DD. Ensure the year is accurate and not misread as the day or month."
        ),
      paymentType: z
        .enum(["credit", "debit", "cash", "other"])
        .describe("Payment type"),
      total: z
        .number()
        .describe(
          "Extract the total amount from the receipt. Return it as a full numeric value exactly as shown, without converting it to a decimal or changing its format. Do not round or shorten the number."
        ),
    }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze the attached receipt image. Extract key details.",
          },
          {
            type: "image",
            image: imageBuffer,
            mimeType: fileType,
          },
        ],
      },
    ],
  });
}

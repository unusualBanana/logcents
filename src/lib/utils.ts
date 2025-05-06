import imageCompression from "browser-image-compression";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts HEIC/HEIF images to JPEG format
 * @param heicFile HEIC/HEIF file to convert
 * @returns Promise resolving to a converted JPEG File or null if conversion fails
 */
export async function convertHeicToJpeg(heicFile: File): Promise<File | null> {
  try {
    // Dynamic import
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default;

    // Convert the HEIC file to JPEG
    const convertedBlob = (await heic2any({
      blob: heicFile,
      toType: "image/jpeg",
      quality: 0.6,
    })) as Blob;

    // Create a new filename
    const newFilename = heicFile.name
      .replace(/\.(heic|heif)$/i, ".jpg")
      .replace(/\s+/g, "_");

    return new File([convertedBlob], newFilename, { type: "image/jpeg" });
  } catch (error) {
    console.error("HEIC conversion error:", error);
    return null;
  }
}

/**
 * Compresses a JPEG image file.
 * @param file The image file to compress.
 * @returns Promise resolving to a compressed File or null if compression fails.
 */
export const compressJpegImage = async (file: File): Promise<File | null> => {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.7,
    useWebWorker: true,
  });
  console.log("Compressed file:", compressedFile);
  return compressedFile;
};

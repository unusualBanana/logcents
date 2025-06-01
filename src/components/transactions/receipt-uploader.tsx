"use client";

import { uploadReceipt } from "@/app/dashboard/transactions/actions";
import { ReceiptAnalysis } from "@/lib/artificial-intelligence/receipt-image";
import { Transaction } from "@/lib/models/transaction";
import { compressJpegImage, convertHeicToJpeg } from "@/lib/utils";
import { useCategoryStore } from "@/store/useCategoryStore";
import { createHash } from "crypto";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";

// Types
interface ReceiptUploaderProps {
  onDataExtracted: (data: Partial<Transaction>) => void;
}

export interface ReceiptUploaderRef {
  triggerFileDialog: () => void;
}

type UploadReceiptResponse =
  | { success: false; error: string }
  | ({ success: true } & ReceiptAnalysis);

// Constants
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ReceiptUploader = forwardRef<ReceiptUploaderRef, ReceiptUploaderProps>(
  ({ onDataExtracted }, ref) => {
    // State
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      triggerFileDialog: () => {
        if (inputFileRef.current && !isUploading) {
          inputFileRef.current.click();
        }
      }
    }));

    // File validation
    const validateFile = (file: File): boolean => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File size exceeds 5 MB limit");
        return false;
      }

      const fileType = file.type.toLowerCase();
      if (!SUPPORTED_IMAGE_TYPES.includes(fileType)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP, or HEIC)");
        return false;
      }

      return true;
    };

    // File preparation
    const prepareFileForUpload = async (file: File): Promise<File | null> => {
      try {
        // Convert HEIC/HEIF if needed
        const fileType = file.type.toLowerCase();
        if (fileType === "image/heic" || fileType === "image/heif") {
          setStatus("Converting image format...");
          const convertedFile = await convertHeicToJpeg(file);
          if (!convertedFile) {
            toast.error("Failed to convert image format");
            return null;
          }
          file = convertedFile;
        }

        // Compress image
        setStatus("Compressing image...");
        const compressedFile = await compressJpegImage(file);
        if (!compressedFile) {
          toast.error("Failed to compress image");
          return null;
        }

        return compressedFile;
      } catch (error) {
        console.error("Error preparing file:", error);
        toast.error("Failed to prepare image for upload");
        return null;
      }
    };

    // Upload and extract data
    const uploadFileAndExtractData = async (file: File): Promise<Partial<Transaction> | null> => {
      try {
        setStatus("Analyzing receipt...");
        const formData = new FormData();
        formData.append("file", file);

        const result = (await uploadReceipt(formData)) as UploadReceiptResponse;
        if (!result.success) {
          toast.error(result.error || "Failed to extract data from image");
          return null;
        }

        // Map category name to ID
        const categoryId = useCategoryStore
          .getState()
          .categories.find(category => category.name === result.categoryName)?.id;

        return {
          name: result.title,
          description: result.description,
          amount: result.total,
          date: new Date(result.date),
          receiptUrl: result.url,
          categoryId: categoryId || "general",
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }
    };

    // File selection handler
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      // Generate file hash for tracking
      setStatus("Preparing file...");
      const arrayBuffer = await selectedFile.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const hash = createHash("sha1").update(imageBuffer).digest("hex");
      console.log("File hash:", hash);

      // Validate and process file
      if (!validateFile(selectedFile)) return;
      setIsUploading(true);

      try {
        // Prepare file
        const preparedFile = await prepareFileForUpload(selectedFile);
        if (!preparedFile) {
          setIsUploading(false);
          return;
        }

        // Upload and extract data
        const transactionData = await uploadFileAndExtractData(preparedFile);
        if (!transactionData) {
          setIsUploading(false);
          return;
        }

        // Clear input and notify parent
        if (inputFileRef.current) {
          inputFileRef.current.value = "";
        }
        onDataExtracted(transactionData);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <>
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {isUploading && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg mb-4">{status}</p>
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
      </>
    );
  }
);

ReceiptUploader.displayName = "ReceiptUploader";

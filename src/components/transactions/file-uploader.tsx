"use client";

import { Transaction } from "@/lib/models/transaction";
import { convertHeicToJpeg } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { uploadReceipt } from "@/app/dashboard/transactions/actions";
import { ReceiptAnalysis } from "@/lib/ai";
import { useCategoryStore } from "@/store/useCategoryStore";

interface FileUploaderProps {
  onDataExtracted: (data: Partial<Transaction>) => void;
  triggerUpload?: boolean;
  onUploadStateChange?: (isUploading: boolean) => void;
}

// Server action response type
type UploadReceiptResponse = 
  | { success: false; error: string }
  | ({ success: true } & ReceiptAnalysis)

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 
  'image/gif', 'image/webp', 'image/heic', 'image/heif'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; 

export default function FileUploader({ 
  onDataExtracted, 
  triggerUpload = false,
  onUploadStateChange
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  // Update parent component about upload state
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(isUploading);
    }
  }, [isUploading, onUploadStateChange]);

  // Trigger file dialog when requested
  useEffect(() => {
    if (triggerUpload && inputFileRef.current && !isUploading) {
      inputFileRef.current.click();
    }
  }, [triggerUpload, isUploading]);

  /**
   * Validates uploaded file size and type
   */
  const validateFile = (file: File): boolean => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 5 MB limit");
      return false;
    }
    
    // Validate file type
    const fileType = file.type.toLowerCase();
    if (!SUPPORTED_IMAGE_TYPES.includes(fileType)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WebP, or HEIC)");
      return false;
    }
    
    return true;
  };

  /**
   * Prepares file for upload, converting if necessary
   */
  const prepareFileForUpload = async (file: File): Promise<File | null> => {
    const fileType = file.type.toLowerCase();
    const needsConversion = fileType === "image/heic" || fileType === "image/heif";
    
    if (!needsConversion) {
      return file;
    }
    
    try {
      toast.info("Converting HEIC image...");
      const convertedFile = await convertHeicToJpeg(file);
      
      if (!convertedFile) {
        toast.error("Failed to convert HEIC image");
        return null;
      }
      
      return convertedFile;
    } catch (error) {
      console.error("Error converting file:", error);
      toast.error("Failed to convert image format");
      return null;
    }
  };

  /**
   * Uploads file to server and extracts receipt data
   */
  const uploadFileAndExtractData = async (fileToUpload: File): Promise<Partial<Transaction> | null> => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      toast.info("Analyzing receipt...");
      const result = await uploadReceipt(formData) as UploadReceiptResponse;

      if (!result.success) {
        toast.error(result.error || "Failed to extract data from image");
        return null;
      }

      // map the category name to the category id
      const categoryId = useCategoryStore.getState().categories.find(
        (category) => category.name === result.categoryName
      )?.id;

      // Map API response to transaction data
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

  /**
   * Handles file selection and processing
   */
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Log file details for debugging
    console.log("Selected file:", selectedFile.type, 
      `(${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`);
    
    // Validate selected file
    if (!validateFile(selectedFile)) return;
    
    setIsUploading(true);
    
    try {
      // Prepare file (convert if needed)
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
      
      // Clear input field
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      
      // Pass data to parent component
      onDataExtracted(transactionData);
      toast.success("Receipt data extracted successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      ref={inputFileRef}
      onChange={handleImageChange}
      className="hidden"
    />
  );
}
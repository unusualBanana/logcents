import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts HEIC/HEIF images to JPEG format with smart compression
 * @param heicFile HEIC/HEIF file to convert
 * @returns Promise resolving to a converted JPEG File or null if conversion fails
 */
export async function convertHeicToJpeg(heicFile: File): Promise<File | null> {
  try {
    // Dynamic import with reduced overhead
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default;
    
    // Target size in bytes (800KB)
    const TARGET_SIZE = 800 * 1024;
    
    // Initial quality based on file size
    let quality = 0.8;
    // For larger files, start with lower quality
    if (heicFile.size > 3 * 1024 * 1024) quality = 0.6;
    else if (heicFile.size > 1 * 1024 * 1024) quality = 0.7;
    
    console.time('HEIC conversion');
    console.log(`Starting HEIC conversion with quality: ${quality.toFixed(1)}`);
    
    let convertedBlob: Blob | null = null;
    let attempt = 0;
    const MAX_ATTEMPTS = 5;
    const MIN_QUALITY = 0.3;
    
    // Try converting with decreasing quality until size requirement is met
    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      
      try {
        convertedBlob = await heic2any({
          blob: heicFile,
          toType: "image/jpeg",
          quality: quality
        }) as Blob;
        
        console.log(`Attempt ${attempt}: ${(convertedBlob.size / 1024).toFixed(1)}KB (quality: ${quality.toFixed(1)})`);
        
        // If size is good or we've reached minimum quality, break the loop
        if (convertedBlob.size <= TARGET_SIZE || quality <= MIN_QUALITY) {
          break;
        }
        
        // Reduce quality for next attempt
        // More aggressive quality reduction for larger blobs
        const reductionFactor = convertedBlob.size > 2 * TARGET_SIZE ? 0.2 : 0.1;
        quality = Math.max(MIN_QUALITY, quality - reductionFactor);
        
      } catch (conversionError) {
        console.error(`Conversion attempt ${attempt} failed:`, conversionError);
        // If we already have a result from a previous attempt, break
        if (convertedBlob) break;
        // Otherwise reduce quality and try again
        quality = Math.max(MIN_QUALITY, quality - 0.2);
      }
    }
    
    // If all attempts failed, return null
    if (!convertedBlob) {
      console.error("All HEIC conversion attempts failed");
      return null;
    }
    
    console.timeEnd('HEIC conversion');
    console.log(`Final file size: ${(convertedBlob.size / 1024).toFixed(1)}KB`);

    // Create a more descriptive filename
    const newFilename = heicFile.name
      .replace(/\.(heic|heif)$/i, '.jpg')
      .replace(/\s+/g, '_');
    
    return new File(
      [convertedBlob], 
      newFilename, 
      { type: "image/jpeg" }
    );
  } catch (error) {
    console.error("HEIC conversion error:", error);
    return null;
  }
}

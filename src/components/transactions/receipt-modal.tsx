"use client";

import { Dialog, DialogContentWithoutCloseButton, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";

interface ReceiptModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string;
}

export default function ReceiptModal({ isOpen, onOpenChange, receiptUrl }: ReceiptModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Reset image loaded state when receipt URL changes
  useEffect(() => {
    setImageLoaded(false);
    
    // Preload the image before showing the dialog
    if (isOpen && receiptUrl) {
      const img = new Image();
      img.src = receiptUrl;
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        toast.error("Failed to load receipt image");
        onOpenChange(false);
      };
    }
  }, [receiptUrl, isOpen, onOpenChange]);
  
  // Control dialog visibility based on image loading
  useEffect(() => {
    if (isOpen && imageLoaded) {
      setShowDialog(true);
    } else if (!isOpen) {
      setShowDialog(false);
    }
  }, [isOpen, imageLoaded]);

  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
      <DialogContentWithoutCloseButton className="inline-flex p-0 overflow-visible bg-transparent border-0 shadow-none items-start justify-center">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt Image</DialogTitle>
        </DialogHeader>
        {/* Container for image and close button */}
        <div className="relative">
          {/* Close button positioned absolute relative to the dialog content */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            ref={imgRef}
            src={receiptUrl} 
            alt="Receipt" 
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain block"
            loading="eager"
          />
        </div>
      </DialogContentWithoutCloseButton>
    </Dialog>
  );
}
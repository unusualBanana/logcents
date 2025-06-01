"use client";

import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ReceiptDisplayProps {
  receiptUrl: string;
  onViewReceipt: () => void;
}

const ReceiptDisplay = memo(({
  receiptUrl,
  onViewReceipt
}: ReceiptDisplayProps) => {
  return (
    <div className="my-4 p-3 border rounded-md bg-background-50 dark:bg-background-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 relative border">
            <Image 
              src={receiptUrl} 
              alt="Receipt" 
              fill
              sizes="48px"
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Receipt</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Attached image
            </span>
          </div>
        </div>
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={onViewReceipt}
          className="text-xs hover:bg-primary/10 hover:text-primary"
        >
          View
        </Button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the URL actually changes
  return prevProps.receiptUrl === nextProps.receiptUrl;
});

ReceiptDisplay.displayName = "ReceiptDisplay";

export default ReceiptDisplay;
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, FileText, Mic, Plus } from "lucide-react";
import { useState } from "react";

interface MobileTransactionFabProps {
  onAddTransaction: () => void;
  onScanReceipt: () => void;
  onRecordTransaction: () => void;
}

export function MobileTransactionFab({
  onAddTransaction,
  onScanReceipt,
  onRecordTransaction,
}: MobileTransactionFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-22 right-6 z-50 flex flex-col items-end gap-3 md:hidden">
      {/* Option buttons - only visible when expanded */}
      <div
        className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300",
          isExpanded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="bg-background border border-border px-3 py-2 rounded-lg shadow-md text-sm font-medium">
            Record Transaction
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted"
            onClick={() => {
              onRecordTransaction();
              setIsExpanded(false);
            }}
          >
            <Mic className="h-5 w-5" />
            <span className="sr-only">Record Transaction</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-background border border-border px-3 py-2 rounded-lg shadow-md text-sm font-medium">
            Scan Receipt
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted"
            onClick={() => {
              onScanReceipt();
              setIsExpanded(false);
            }}
          >
            <Camera className="h-5 w-5" />
            <span className="sr-only">Scan Receipt</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-background border border-border px-3 py-2 rounded-lg shadow-md text-sm font-medium">
            Add Transaction
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg bg-background border-2 hover:bg-muted"
            onClick={() => {
              onAddTransaction();
              setIsExpanded(false);
            }}
          >
            <FileText className="h-5 w-5" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
        )}
        onClick={toggleExpand}
      >
        <Plus className={cn("transition-transform h-6 w-6", isExpanded && "rotate-45")} />
        <span className="sr-only">
          {isExpanded ? "Close menu" : "Open menu"}
        </span>
      </Button>
    </div>
  );
}

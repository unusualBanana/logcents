"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/lib/models/transaction";
import { useState, useEffect } from "react";
import ReceiptModal from "./receipt-modal";
import DeleteTransaction from "./delete-transaction";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

// Currency formatter helper function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete,
}: TransactionCardProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Only use isMobile state for JavaScript functionality that needs to know device type
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      onEdit(transaction);
    }
  };
  
  // Format the date
  const formattedDate = transaction.date && 
    (transaction.date instanceof Date
      ? transaction.date.toLocaleDateString()
      : transaction.date.toDate().toLocaleDateString());

  return (
    <Card 
      className="relative transition-all hover:shadow-md py-3 sm:py-4 hover:sm:bg-transparent hover:bg-accent/50 active:bg-accent/70 sm:active:bg-transparent"
      onClick={handleCardClick}
    >
      <CardContent className="px-4 py-0">
        {/* Responsive layout using CSS instead of conditional rendering */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {/* Transaction details section */}
          <div className="flex items-start gap-3">
            {/* Color indicator based on transaction type - hidden on mobile with CSS */}
            <div className={`hidden sm:block w-1.5 h-16 rounded-full mt-1 ${
              transaction.amount < 0 ? "bg-destructive" : "bg-primary"
            }`}></div>
            
            <div>
              {/* Amount - Extra prominent */}
              <span
                className={`font-bold text-2xl sm:text-3xl leading-none ${
                  transaction.amount < 0 ? "text-destructive" : "text-primary"
                }`}
              >
                {formatCurrency(transaction.amount)}
              </span>
              
              <div className="flex flex-col mt-1">
                {/* Title - medium */}
                <h3 className="text-base sm:text-lg font-medium line-clamp-1 text-foreground">
                  {transaction.name}
                </h3>
                
                {/* Date - small */}
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Modal */}
          {transaction.receiptUrl && (
            <ReceiptModal 
              isOpen={showReceiptModal}
              onOpenChange={setShowReceiptModal}
              receiptUrl={transaction.receiptUrl}
            />
          )}

          {/* Action buttons - hidden on mobile with CSS */}
          <div className="hidden sm:flex items-center gap-2 mt-2 sm:mt-0">
            {transaction.receiptUrl && (
              <Button 
                variant="ghost" 
                size="default"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReceiptModal(true);
                }}
              >
                View Receipt
              </Button>
            )}
            <Button
              variant="outline"
              size="default"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
            >
              Edit
            </Button>
            
            {/* Delete button with confirmation dialog */}
            <DeleteTransaction 
              transactionId={transaction.id}
              transactionName={transaction.name}
              onSuccess={() => onDelete(transaction.id)}
              buttonSize="default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
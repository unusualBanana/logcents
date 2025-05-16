"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/lib/models/transaction";
import { useState, useEffect, memo } from "react";
import ReceiptModal from "./receipt-modal";
import DeleteTransaction from "./delete-transaction";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Receipt, Pencil } from "lucide-react";
import { CurrencySetting } from "@/lib/models/currency-setting";
import { formatLongDate, formatCurrency } from "@/lib/utils";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  currencySetting: CurrencySetting;
}

export default memo(function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  currencySetting,
}: TransactionCardProps) {
  const { categories } = useCategoryStore();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if there's only one category (General)
  const hasOnlyDefaultCategory = categories.length === 1 && categories[0]?.id === "general";
  
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
  const formattedDate = formatLongDate(transaction.date, currencySetting.locale);

  const category = categories.find((cat) => cat.id === transaction.categoryId);

  return (
    <Card 
      className="relative transition-all hover:shadow-md py-3 sm:py-4 hover:sm:bg-transparent hover:bg-accent/50 active:bg-accent/70 sm:active:bg-transparent"
      onClick={handleCardClick}
    >
      <CardContent className="px-4 py-0">
        {/* Responsive layout using CSS instead of conditional rendering */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {/* Transaction details section */}
          <div className="flex items-center gap-3">
            {/* Color indicator based on category - hidden on mobile with CSS */}
            {!hasOnlyDefaultCategory && (
              <div 
                className="w-1.5 h-16 rounded-full mt-1"
                style={{ 
                  backgroundColor: category?.color || "#000000"
                }}
              ></div>
            )}
            
            <div>
              {/* Amount - Extra prominent */}
              <span
                className={`font-bold text-2xl sm:text-3xl leading-none ${
                  transaction.amount < 0 ? "text-destructive" : "text-primary"
                }`}
              >
                {formatCurrency(transaction.amount, currencySetting)}
              </span>
              
              <div className="flex flex-col mt-1">
                {/* Title - medium */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-medium line-clamp-1 text-foreground">
                    {transaction.name}
                  </h3>
                </div>
                
                {/* Date - small */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formattedDate}</span>
                  {!hasOnlyDefaultCategory && category && (
                    <>
                      <span>•</span>
                      <span>{category.name}</span>
                    </>
                  )}
                </div>
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
                <Receipt className="h-4 w-4" /> Receipt
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
              <Pencil className="h-4 w-4" /> Edit
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
});
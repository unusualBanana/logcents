"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import ReceiptModal from "../receipt-modal";
import ReceiptDisplay from "./receipt-display";
import TransactionForm from "./transaction-form";

// Actions
import {
  addTransaction,
  updateTransaction,
} from "@/app/dashboard/transactions/actions";

// Types
import { Transaction } from "@/lib/models/transaction";
import { useMediaQuery } from "@/lib/client-hooks";
import { DialogDescription } from "@radix-ui/react-dialog";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<Transaction>;
  editingTransactionId?: string | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  editingTransactionId,
}: TransactionModalProps) {
  // Check if on mobile
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleViewReceipt = useCallback(() => {
    setShowReceiptModal(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    onSuccess();
    onClose();
  }, [onSuccess, onClose]);

  const handleTransactionSubmit = useCallback(
    async (formData: FormData) => {
      let result;

      if (editingTransactionId) {
        // Update existing transaction
        result = await updateTransaction(editingTransactionId, formData);
        if (result.success) {
          toast.success("Transaction updated successfully!");
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || "Failed to update transaction");
        }
      } else {
        // Add new transaction
        result = await addTransaction(formData);
        if (result.success) {
          toast.success("Transaction added successfully!");
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || "Failed to add transaction");
        }
      }
    },
    [editingTransactionId, onSuccess, onClose]
  );

  // Memoize receipt URL to maintain referential equality
  const receiptUrl = useMemo(
    () => initialData?.receiptUrl || "",
    [initialData?.receiptUrl]
  );

  // Common form elements
  const transactionFormElement = (
    <>
      {/* Hidden input for receipt URL */}
      <input
        type="hidden"
        name="receiptUrl"
        value={receiptUrl}
        form="transaction-form"
      />

      {/* Transaction form with receipt display above the buttons */}
      <TransactionForm
        initialData={initialData}
        onSubmit={handleTransactionSubmit}
        onClose={onClose}
        editingTransactionId={editingTransactionId}
        handleDeleteSuccess={handleDeleteSuccess}
        receiptElement={receiptUrl ? (
          <ReceiptDisplay
            receiptUrl={receiptUrl}
            onViewReceipt={handleViewReceipt}
          />
        ) : null}
      />
    </>
  );

  // Title text for both dialog and drawer
  const titleText = editingTransactionId ? "Edit Transaction" : "Add Transaction";

  return (
    <>
      {isMobile ? (
        // Mobile: Use Drawer
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent>
            <DrawerDescription className="sr-only">Transaction</DrawerDescription>
            <DrawerHeader className="mx-auto">
              <DrawerTitle className="text-xl font-medium">{titleText}</DrawerTitle>
              <DrawerClose />
            </DrawerHeader>
            <div className="px-4 pb-4">
              {transactionFormElement}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        // Desktop: Use Dialog
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="w-[95%] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogDescription>Transaction Modal</DialogDescription>
            <DialogHeader>
              <DialogTitle className="text-xl font-medium pb-2">
                {titleText}
              </DialogTitle>
            </DialogHeader>
            {transactionFormElement}
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt modal - only rendered when needed */}
      {receiptUrl && showReceiptModal && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onOpenChange={setShowReceiptModal}
          receiptUrl={receiptUrl}
        />
      )}
    </>
  );
}

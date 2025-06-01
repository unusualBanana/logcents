"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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
import { Transaction, transactionZodSchema } from "@/lib/models/transaction";
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
      // Extract data from FormData
      const data = Object.fromEntries(formData.entries());

      let validatedData: Transaction;
      try {
        // Validate data using Zod schema
        validatedData = transactionZodSchema.parse({
          id: "", // will be set by the server
          ...data,
          amount: parseFloat(data.amount as string), // Convert amount to number
          date: new Date(data.date as string), // Convert date string to Date object
        });
      } catch (error: unknown) {
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
          console.log("error", error.errors);
          toast.error(error.errors[0].message || "Failed to validate transaction data.");
        } else {
          toast.error("An unexpected validation error occurred.");
        }
        return;
      }

      // Define a type for the action results based on the updated actions return type
      type ActionResult = { success: boolean; error?: string };

      let result: ActionResult;
      const operationType = editingTransactionId ? 'update' : 'add';

      if (operationType === 'update') {
        // Update existing transaction
        result = await updateTransaction(editingTransactionId!, validatedData);
      } else {
        // Add new transaction
        result = await addTransaction(validatedData);
      }

      // Handle action result
      if (result.success) {
        const successMessage = operationType === 'update' ? "Transaction updated successfully!" : "Transaction added successfully!";
        toast.success(successMessage);
        onSuccess();
        onClose();
      } else {
        const errorMessage = operationType === 'update' ? "Failed to update transaction" : "Failed to add transaction";
        toast.error(result.error || errorMessage);
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
              <DrawerTitle className="text-xl font-medium text-center">{titleText}</DrawerTitle>
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
            <DialogDescription className="sr-only">Transaction Modal</DialogDescription>
            <DialogHeader>
              <DialogTitle className="text-xl font-medium pb-2 text-center">
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

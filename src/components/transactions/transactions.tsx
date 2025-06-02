"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/models/transaction";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import TransactionModal from "./transaction-modal";
import TransactionCard from "./transaction-card";
import { MobileTransactionFab } from "./mobile-transaction-fab";
import { toast } from "sonner";
import { deleteTransaction } from "@/app/dashboard/transactions/actions";
import { formatLongDate } from "@/lib/utils";
import {
  ReceiptUploader,
  ReceiptUploaderRef,
} from "@/components/transactions/receipt-uploader";
import VoiceRecorderUI from "@/components/audio-recorder";

// Ensure the `date` field is valid before converting to a Date object
const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    let date: Date;
    try {
      date = new Date(transaction.date);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
    } catch {
      console.error("Invalid date value for transaction:", transaction);
      return; // Skip this transaction
    }

    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }

    groups[dateStr].push(transaction);
  });

  // Convert to array of [dateStr, transactions] pairs and sort by date (newest first)
  return Object.entries(groups).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
};

// Function to format date for display
const formatDateHeader = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Format date as "Today", "Yesterday", or the full date
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return formatLongDate(date, locale);
  }
};

// Custom hook for managing transaction modal state
const useTransactionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<
    Partial<Transaction> | undefined
  >(undefined);

  const openForCreate = useCallback(() => {
    setEditingId(null);
    setCurrentData(undefined);
    setIsOpen(true);
  }, []);

  const openForCreateWithData = useCallback((data: Partial<Transaction>) => {
    setEditingId(null);
    setCurrentData(data);
    setIsOpen(true);
  }, []);

  const openForEdit = useCallback((transaction: Transaction) => {
    setEditingId(transaction.id);
    setCurrentData(transaction);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingId(null);
    setCurrentData(undefined);
  }, []);

  return {
    isOpen,
    editingId,
    currentData,
    openForCreate,
    openForCreateWithData,
    openForEdit,
    setCurrentData,
    close,
  };
};

export default function Transactions() {
  const { user } = useAuthStore();
  const { currencySetting } = useCurrencyStore();
  const { transactions, loading, fetchTransactions, hasMore } =
    useTransactionStore();
  const modal = useTransactionModal();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const receiptUploaderRef = useRef<ReceiptUploaderRef>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleDataExtracted = (data: Partial<Transaction>) => {
    modal.openForCreateWithData(data);
  };

  const handleTriggerScan = () => {
    receiptUploaderRef.current?.triggerFileDialog();
  };

  useEffect(() => {
    if (user) {
      fetchTransactions(user.uid);
    }
  }, [user, fetchTransactions]);

  // Setup intersection observer for infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore && !loading && user) {
        fetchTransactions(user.uid, true);
      }
    },
    [hasMore, loading, fetchTransactions, user]
  );

  // Initialize and clean up the intersection observer
  useEffect(() => {
    const currentLoadMoreRef = loadMoreRef.current;

    if (currentLoadMoreRef) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      });
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, transactions]);

  const handleDeleteTransactionClick = useCallback(
    async (transactionId: string) => {
      if (!user) return;

      try {
        // Use the server action to delete the transaction
        const result = await deleteTransaction(transactionId);

        if (result.success) {
          // Refetch the transactions after successful deletion
          fetchTransactions(user.uid);
          toast.success("Transaction deleted successfully!");

          // If we were editing this transaction, close the modal
          if (modal.editingId === transactionId) {
            modal.close();
          }
        } else {
          toast.error(result.error || "Failed to delete transaction");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      }
    },
    [user, fetchTransactions, modal.close, modal.editingId]
  );

  const handleRecordingComplete = (data?: Partial<Transaction>) => {
    if (data) {
      handleDataExtracted(data);
    }
    setShowRecorder(false);
  };

  // Group transactions by date
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Transactions</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={modal.openForCreate} className="w-full sm:w-auto">
            Add Transaction
          </Button>
          <Button
            variant="outline"
            onClick={handleTriggerScan}
            className="w-full sm:w-auto"
          >
            Scan Receipt
          </Button>
        </div>
      </div>

      <ReceiptUploader
        ref={receiptUploaderRef}
        onDataExtracted={handleDataExtracted}
      />

      <TransactionModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSuccess={() => user && fetchTransactions(user.uid)}
        initialData={modal.currentData}
        editingTransactionId={modal.editingId}
      />

      {loading && transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Loading transactions...
        </p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No transactions yet. Create your first transaction!
        </p>
      ) : (
        <div>
          {groupedTransactions.map(([dateStr, dateTransactions]) => (
            <div key={dateStr} className="mb-6">
              <div className="sticky top-0 z-10 bg-background py-2 border-b mb-3">
                <h3 className="text-md font-medium text-gray-600 dark:text-gray-400">
                  {formatDateHeader(dateStr, currencySetting.locale)}
                </h3>
              </div>
              <div className="space-y-4">
                {dateTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={modal.openForEdit}
                    onDelete={handleDeleteTransactionClick}
                    currencySetting={currencySetting}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Intersection observer target element */}
          <div
            ref={loadMoreRef}
            className="h-0 flex justify-center items-center my-4"
          >
            {loading && transactions.length > 0 && (
              <p className="text-gray-500">Loading more transactions...</p>
            )}
          </div>

          {!hasMore && transactions.length > 0 && (
            <p className="text-gray-500 text-center pb-4">
              No more transactions to load
            </p>
          )}
        </div>
      )}

      {/* Mobile Transaction FAB - only visible on mobile screens */}
      <MobileTransactionFab
        onAddTransaction={modal.openForCreate}
        onScanReceipt={handleTriggerScan}
        onRecordTransaction={() => setShowRecorder(true)}
      />

      {/* Audio Recorder Overlay */}
      {showRecorder && (
        <VoiceRecorderUI
          onComplete={handleRecordingComplete}
          onClose={() => setShowRecorder(false)}
        />
      )}
    </div>
  );
}

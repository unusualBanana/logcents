"use client";

import { deleteTransaction } from "@/app/dashboard/transactions/actions";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface DeleteTransactionProps {
  transactionId: string;
  transactionName: string;
  onSuccess?: () => void;
  triggerClassName?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export default function DeleteTransaction({
  transactionId,
  transactionName,
  onSuccess,
  triggerClassName,
  buttonSize = "default",
}: DeleteTransactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!transactionId) return;

    setIsDeleting(true);
    try {
      const result = await deleteTransaction(transactionId);
      if (result.success) {
        toast.success("Transaction deleted successfully!");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size={buttonSize}
          className={triggerClassName}
        >
          <Trash className="h-4 w-4 hidden sm:block" /> <span className="block sm:hidden">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the transaction <br />
            &quot;{transactionName || "Unnamed transaction"}&quot;.
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

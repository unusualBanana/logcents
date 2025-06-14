"use client";

import { useState, memo, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Timestamp } from "firebase-admin/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import DeleteTransaction from "../delete-transaction";
import { Transaction } from "@/lib/models/transaction";
import { useMediaQuery } from "@/lib/client-hooks";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
  editingTransactionId?: string | null;
  handleDeleteSuccess: () => void;
  receiptElement?: React.ReactNode;
}

interface TransactionFormState {
  name: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
}

// Helper function
const formatDateForForm = (date?: Date | Timestamp): string => {
  if (!date) {
    return new Date().toISOString().split("T")[0]; // Default to today
  }

  // Handle both JavaScript Date and Firestore Timestamp
  const dateObject = date instanceof Date ? date : date.toDate();
  return dateObject.toISOString().split("T")[0];
};

// Transaction form component
const TransactionForm = memo(
  ({
    initialData,
    onSubmit,
    onClose,
    editingTransactionId,
    handleDeleteSuccess,
    receiptElement,
  }: TransactionFormProps) => {
    const { categories } = useCategoryStore();
    const { currencySetting } = useCurrencyStore();

    // Check if there's only one category (General)
    const hasOnlyDefaultCategory =
      categories.length === 1 && categories[0]?.id === "general";

    // Form state
    const [form, setForm] = useState<TransactionFormState>({
      name: initialData?.name || "",
      description: initialData?.description || "",
      amount: initialData?.amount ? Number(initialData.amount) : 0,
      date: formatDateForForm(initialData?.date),
      categoryId: initialData?.categoryId || categories[0]?.id || "",
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      initialData?.date instanceof Date
        ? initialData.date
        : initialData?.date
        ? new Date((initialData.date as Timestamp).toDate())
        : new Date()
    );

    // Check if on mobile
    const isMobile = useMediaQuery("(max-width: 640px)");

    // Update form when initialData changes
    useEffect(() => {
      if (initialData) {
        setForm({
          name: initialData.name || "",
          description: initialData.description || "",
          amount: initialData.amount ? Number(initialData.amount) : 0,
          date: formatDateForForm(initialData?.date),
          categoryId: initialData.categoryId || categories[0]?.id || "",
        });

        setSelectedDate(
          initialData?.date instanceof Date
            ? initialData.date
            : initialData?.date
            ? new Date((initialData.date as Timestamp).toDate())
            : new Date()
        );
      }
    }, [initialData]);

    return (
      <form action={onSubmit} id="transaction-form" className="space-y-6 py-2">
        {/* Clean Amount Display - Fullwidth without Rp on side */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-1 text-center">
            {/* Dynamically display currency name */}
            Amount ({currencySetting.name})
          </div>
          <div className="w-full">
            <input
              type="hidden"
              id="amount"
              name="amount"
              value={form.amount.toString()}
            />
            <CurrencyInput
              value={form.amount}
              onChange={(value) => setForm({ ...form, amount: value })}
              currency={currencySetting.currency}
              locale={currencySetting.locale}
              showCurrencyPrefix={true}
              placeholder="0"
              className="w-full text-4xl font-bold text-center outline-none border-none focus:ring-0 focus:outline-none rounded-lg h-auto p-3 md:text-4xl"
              aria-label="Transaction amount"
            />
          </div>
        </div>

        {/* Form Fields with Horizontal Layout */}
        <div className="space-y-4 rounded-lg border p-4">
          {/* Name field */}
          <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-sm font-medium w-1/3">
              Name
            </Label>
            <div className="w-2/3">
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Transaction name"
                required
                className="text-sm"
              />
            </div>
          </div>

          {/* Date picker */}
          <div className="flex items-center justify-between">
            <Label htmlFor="date" className="text-sm font-medium w-1/3">
              When
            </Label>
            <div className="w-2/3">
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
              <input
                type="hidden"
                name="date"
                value={formatDateForForm(selectedDate)}
              />
            </div>
          </div>

          {/* Description field */}
          <div className="flex items-start justify-between">
            <Label
              htmlFor="description"
              className="text-sm font-medium w-1/3 pt-2"
            >
              Description
            </Label>
            <div className="w-2/3">
              <textarea
                id="description"
                name="description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Transaction description (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Category selector - only show if there are multiple categories */}
          {!hasOnlyDefaultCategory && (
            <div className="flex items-center justify-between">
              <Label htmlFor="categoryId" className="text-sm font-medium w-1/3">
                Category
              </Label>
              <div className="w-2/3">
                <Select
                  value={form.categoryId}
                  onValueChange={(value: string) =>
                    setForm({ ...form, categoryId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={categories[0].id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categories[0].color }}
                          />
                          General
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="categoryId"
                  value={form.categoryId}
                />
              </div>
            </div>
          )}

          {/* Hidden category input when there's only one category */}
          {hasOnlyDefaultCategory && (
            <input type="hidden" name="categoryId" value={categories[0]?.id} />
          )}
        </div>

        {/* Receipt Display - placed above the buttons */}
        {receiptElement}

        {/* Form actions - Use DialogFooter on desktop, regular div on mobile */}
        <div
          className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2 pt-4 ${
            !isMobile ? "justify-end" : ""
          }`}
        >
          {/* Cancel button */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className={`${isMobile ? "w-full order-3" : "order-2"}`}
          >
            Cancel
          </Button>

          {/* Delete button (only for editing) */}
          {editingTransactionId && (
            <div className={`${isMobile ? "order-2 w-full" : "order-1"}`}>
              <DeleteTransaction
                transactionId={editingTransactionId}
                transactionName={form.name}
                onSuccess={handleDeleteSuccess}
                triggerClassName={isMobile ? "w-full" : ""}
              />
            </div>
          )}

          <div className={`${isMobile ? "w-full order-1" : "order-3"}`}>
            <SubmitButton />
          </div>
        </div>
      </form>
    );
  }
);

// Inline submit button component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving..." : "Save Transaction"}
    </Button>
  );
}

TransactionForm.displayName = "TransactionForm";

export default TransactionForm;
export { formatDateForForm };

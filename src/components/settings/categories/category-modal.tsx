"use client";

import { useCallback, useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { ColorPicker } from "@/components/color-picker";

// Actions
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  ExpenseCategory,
  DEFAULT_CATEGORIES,
} from "@/lib/models/expense-category";
import { useMediaQuery } from "@/lib/client-hooks";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ExpenseCategory> | null;
  editingCategoryId?: string | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  initialData,
  editingCategoryId,
}: CategoryModalProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [categoryName, setCategoryName] = useState(initialData?.name || "");
  const [categoryColor, setCategoryColor] = useState(
    initialData?.color || "#000000"
  );

  const isDefaultCategory =
    editingCategoryId &&
    DEFAULT_CATEGORIES.some((cat) => cat.id === editingCategoryId);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || "");
      setCategoryColor(initialData.color || "#000000");
    }
  }, [initialData]);

  const handleSave = useCallback(async () => {
    const categoryData = {
      id: editingCategoryId || "", // if inserting, id is empty string, it will be set by the server
      name: categoryName,
      color: categoryColor,
      order: editingCategoryId ? initialData?.order || 0 : 0,
    };

    if (editingCategoryId) {
      await updateCategory(categoryData);
      toast.success("Category updated successfully!");
    } else {
      await addCategory(categoryData);
      toast.success("Category added successfully!");
    }

    onClose();
  }, [
    editingCategoryId,
    categoryName,
    categoryColor,
    initialData?.order,
    addCategory,
    updateCategory,
    onClose,
  ]);

  const handleDelete = async () => {
    if (!editingCategoryId) return;

    try {
      await deleteCategory(editingCategoryId);
      toast.success("Category deleted successfully!");
      onClose();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
    }
  };

  const titleText = editingCategoryId ? "Edit Category" : "Add Category";

  const renderForm = () => (
    <form className="space-y-6 py-2">
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="name" className="text-sm font-medium w-1/3">
            Name
          </Label>
          <div className="w-2/3">
            <Input
              id="name"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="text-sm"
              required
              disabled={!!isDefaultCategory}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="color" className="text-sm font-medium w-1/3">
            Color
          </Label>
          <div className="w-2/3">
            <ColorPicker
              value={categoryColor}
              onChange={setCategoryColor}
              disabled={!!isDefaultCategory}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4 sm:justify-end">
        {!isMobile && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="sm:order-2"
          >
            Cancel
          </Button>
        )}
        {editingCategoryId && !isDefaultCategory && (
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="sm:order-1"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button
          type="button"
          onClick={handleSave}
          className="sm:order-3"
          disabled={!!isDefaultCategory}
        >
          {titleText}
        </Button>
      </div>
    </form>
  );

  const renderDrawer = () => (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerDescription className="sr-only">Category</DrawerDescription>
        <DrawerHeader className="mx-auto">
          <DrawerTitle className="text-xl font-medium">{titleText}</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <div className="px-4 pb-4">{renderForm()}</div>
      </DrawerContent>
    </Drawer>
  );

  const renderDialog = () => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium pb-2">
            {titleText}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );

  return isMobile ? renderDrawer() : renderDialog();
}

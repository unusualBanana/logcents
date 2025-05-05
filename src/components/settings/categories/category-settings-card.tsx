import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button component
import { GripVertical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { ExpenseCategory } from "@/lib/models/expense-category";
import CategoryModal from "./category-modal";

export const CategorySettingsCard = () => {
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchCategories(user.uid);
  }, [fetchCategories, user]);

  const handleCardClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddNewCategory = () => {
    setSelectedCategory(null); // Clear selected category
    setIsModalOpen(true); // Open modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>Manage your expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="flex flex-row items-center p-3 cursor-pointer rounded-md"
                  onClick={() => handleCardClick(category)}
                >
                  <div className="flex w-full items-center gap-2">
                    <div
                      className="w-4 h-full min-h-[2rem] rounded-[3px]"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="font-medium flex-grow">
                      {category.name}
                    </span>
                  </div>

                  <GripVertical
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No categories available.
            </p>
          )}
          <Button onClick={handleAddNewCategory} className="mt-6 flex w-full">
            Add New Category
          </Button>
        </CardContent>
      </Card>
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialData={selectedCategory}
          editingCategoryId={selectedCategory?.id || null}
        />
      )}
    </>
  );
};

export default CategorySettingsCard;

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/useCategoryStore";

const CategorySync = () => {
  const { user } = useAuthStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (user) {
      fetchCategories(user.uid);
    }
  }, [user, fetchCategories]);

  return null;
};

export default CategorySync; 
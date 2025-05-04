"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

export default function UserProfile() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <div className="flex flex-col text-sm">
        <span className="font-medium">{user.displayName || "User"}</span>
        <span className="text-xs text-gray-500 truncate max-w-[150px]">
          {user.email}
        </span>
      </div>
      <button
        onClick={logout}
        className="ml-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Sign Out
      </button>
    </div>
  );
}
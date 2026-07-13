"use client";

import { AuthGuard } from "@/components/auth-guard";
import { OrderListMng } from "./OrderListMng";

export default function AdminOrderManagementPage() {
  return (
    <AuthGuard allow="admin">
      <main className="min-h-screen bg-[#e9edf3] p-4 min-[745px]:p-6">
        <OrderListMng />
      </main>
    </AuthGuard>
  );
}

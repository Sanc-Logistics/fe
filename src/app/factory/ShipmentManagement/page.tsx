"use client";

import { AuthGuard } from "@/components/auth-guard";
import { FactoryShipmentMng } from "./FactoryShipmentMng";

export default function FactoryShipmentManagementPage() {
  return (
    <AuthGuard allow="factory">
      <main className="min-h-screen bg-[#e9edf3] p-4 min-[745px]:p-6">
        <FactoryShipmentMng />
      </main>
    </AuthGuard>
  );
}

"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { NextPage } from "next";

const Orders: NextPage = () => {
  return (
    <RoleGuard requiredRole="admin">
      <div>
        <h1>Orders Page</h1>
      </div>
    </RoleGuard>
  );
};

export default Orders;

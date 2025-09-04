"use client";

import { Card, CardBody, CardTitle } from "~~/components/kibo";

interface StatCardProps {
  title: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <Card className="flex-1 min-w-[140px] text-center">
      <CardBody className="flex flex-col items-center justify-center py-6">
        <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">{title}</CardTitle>
        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
      </CardBody>
    </Card>
  );
};

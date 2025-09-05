"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "@/components/kibo";
import { AllyApplication, ApplicationStatus } from "@/core/types/ally.applications.types";
import { useApplications } from "@/hooks/applications/useApplications";
import { formatDateToSpanish } from "@/utils/front.functions";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Applications: NextPage = () => {
  const { data, isLoading, error, refetch } = useApplications();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  const filteredApplications =
    data?.data?.applications?.filter((application: AllyApplication) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${application.fullName}`.toLowerCase().includes(searchLower) ||
        `${application.phone}`.toLowerCase().includes(searchLower) ||
        formatDateToSpanish(application.createdAt).toLowerCase().includes(searchLower)
      );
    }) ?? [];
  const handleMovementAction = useCallback((id: string) => {}, []);

  return (
    <div className="md:mx-auto md:min-w-md px-4">
      {/* Header */}
      <div className="kibo-page-header mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Applications History</h1>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearchChange}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          fullWidth
        />
      </div>
      {/* Movements List */}
      <div className="kibo-section-spacing mb-32">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(application => (
            <Card key={application.id} shadow="sm">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1 flex items-center gap-2">
                      <span className="text-neutral-900 dark:text-neutral-100">Application</span>
                      <Badge
                        variant={
                          application.status === ApplicationStatus.APPROVED
                            ? "success"
                            : application.status === ApplicationStatus.PENDING
                              ? "warning"
                              : "error"
                        }
                        size="sm"
                      >
                        {application.status === ApplicationStatus.PENDING && "Pending"}
                        {application.status === ApplicationStatus.APPROVED && "Approved"}
                        {application.status === ApplicationStatus.REJECTED && "rejected"}
                      </Badge>
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">{`FULL NAME: ${application.fullName}`}</span>
                        <span className="mx-2">•</span>
                        <span>{`PHONE: ${application.address}`}</span>
                        <span>{`ADDRESS: ${application.address}`}</span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {formatDateToSpanish(application.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      application.status === ApplicationStatus.PENDING
                        ? "primary"
                        : application.status === ApplicationStatus.APPROVED
                          ? "secondary"
                          : "ghost"
                    }
                    size="xs"
                    className="self-center min-w-20"
                    onClick={() => handleMovementAction(application.id)}
                  >
                    {application.status === ApplicationStatus.PENDING && "View"}
                    {application.status === ApplicationStatus.APPROVED && "Details"}
                    {application.status === ApplicationStatus.REJECTED && "Details"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No transactions found
                </h3>
                {searchTerm ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">No transactions available</p>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Applications;

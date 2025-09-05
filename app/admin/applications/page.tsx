"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ApplicationCard } from "@/components/ApplicationCard";
import { Button, Card, CardBody, Input } from "@/components/kibo";
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
  const handleApprove = (id: string) => {
    console.log("Approve application:", id);
  };

  const handleReject = (id: string) => {
    console.log("Reject application:", id);
  };
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
            <ApplicationCard
              key={application.id}
              application={application}
              actionButtons={
                application.status === ApplicationStatus.PENDING ? (
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" onClick={() => handleReject(application.id)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(application.id)}>
                      Approve
                    </Button>
                  </div>
                ) : undefined
              }
            />
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

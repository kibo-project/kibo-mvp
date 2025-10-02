"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ConfirmationModal } from "@/components/ConfimationModal";
import { Pagination } from "@/components/Pagination";
import { RoleGuard } from "@/components/RoleGuard";
import { Button, Card, CardBody, Input } from "@/components/kibo";
import { OrderListSkeleton } from "@/components/skeletons";
import { AllyApplication, ApplicationStatus, ApplicationsFiltersRequest } from "@/core/types/ally.applications.types";
import { useApplicationApprove } from "@/hooks/applications/useApplicationApprove";
import { useApplicationReject } from "@/hooks/applications/useApplicationReject";
import { useApplications } from "@/hooks/applications/useApplications";
import { formatDateToSpanish } from "@/utils/front.functions";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Applications: NextPage = () => {
  const [pagination, setPagination] = useState<ApplicationsFiltersRequest>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { data, isLoading, error, refetch } = useApplications({ ...pagination });
  const { mutate: approveApplication, isPending: isApproving } = useApplicationApprove();
  const { mutate: rejectApplication, isPending: isRejecting } = useApplicationReject();
  const applications = data?.data?.applications ?? [];

  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    applicationId: "",
    message: "",
    requiresReason: false,
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === "") {
      setSearchFilter("");
    }
  }, []);

  const handleApprove = (id: string) => {
    setModal({
      isOpen: true,
      type: "approve",
      applicationId: id,
      message: "Are you sure you want to approve this application?",
      requiresReason: false,
    });
  };

  const handleReject = (id: string) => {
    setModal({
      isOpen: true,
      type: "reject",
      applicationId: id,
      message: "Are you sure you want to reject this application?",
      requiresReason: true,
    });
  };

  const handleConfirm = (reason?: string) => {
    if (modal.type === "approve") {
      approveApplication(modal.applicationId, {
        onSuccess: () => {
          refetch();
          setModal({ isOpen: false, type: "", applicationId: "", message: "", requiresReason: false });
        },
      });
    } else if (modal.type === "reject" && reason) {
      rejectApplication(
        { applicationId: modal.applicationId, reason },
        {
          onSuccess: () => {
            refetch();
            setModal({ isOpen: false, type: "", applicationId: "", message: "", requiresReason: false });
          },
        }
      );
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: "", applicationId: "", message: "", requiresReason: false });
  };

  const handleSearch = useCallback(() => {
    setSearchFilter(searchInput);
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [searchInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  return (
    <RoleGuard requiredRole="admin">
      <div className="md:mx-auto md:min-w-md px-4">
        {/* Header */}
        <div className="kibo-page-header mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center">
              <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Applications History</h1>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-2 w-full">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              fullWidth
              className="py-2 text-lg"
            />
          </div>

          <Button variant="secondary" size="sm" className="whitespace-nowrap" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div className="mb-6">
          <select
            value={pagination?.status ?? ""}
            onChange={e => {
              const value = e.target.value as ApplicationStatus | "";
              setPagination(prev => ({ ...prev, offset: 0, status: value || undefined }));
            }}
            className="border rounded p-2 w-40 md:w-60 text-sm"
          >
            <option value="">All</option>
            <option value={ApplicationStatus.PENDING}>Pending</option>
            <option value={ApplicationStatus.APPROVED}>Approved</option>
            <option value={ApplicationStatus.REJECTED}>Rejected</option>
          </select>
        </div>
        {/* Applications List */}
        <div className="kibo-section-spacing mb-32">
          {isLoading ? (
            <OrderListSkeleton count={2} />
          ) : error ? (
            <Card>
              <CardBody>
                <div className="flex flex-col justify-center items-center py-8">
                  <p className="text-red-500 mb-4"> {error.message}</p>
                  <Button onClick={handleRefresh}>Retry</Button>
                </div>
              </CardBody>
            </Card>
          ) : applications.length > 0 ? (
            applications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                actionButtons={
                  application.status === ApplicationStatus.PENDING ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(application.id)}
                        disabled={isApproving || isRejecting}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(application.id)}
                        disabled={isApproving || isRejecting}
                      >
                        Reject
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
                    No applications found
                  </h3>
                  {searchFilter ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">No applications available</p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <ConfirmationModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          message={modal.message}
          isLoading={isApproving || isRejecting}
          requiresReason={modal.requiresReason}
        />

        {/* Paginación */}
        {data?.data?.pagination && (
          <Pagination
            total={data.data.pagination.total}
            limit={data.data.pagination.limit}
            offset={data.data.pagination.offset}
            hasMore={data.data.pagination.hasMore}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}

        <div className="mb-32"></div>
      </div>
    </RoleGuard>
  );
};

export default Applications;

"use client";

import { useCallback, useState } from "react";
import { AllyApplication, ApplicationStatus } from "@/core/types/ally.applications.types";
import { formatDateToSpanish } from "@/utils/front.functions";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Badge, Button, Card, CardBody, CardTitle } from "~~/components/kibo";

interface ApplicationCardProps {
  application: AllyApplication;
  actionButtons?: React.ReactNode;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, actionButtons }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Card shadow="sm">
      <CardBody>
        <div className="space-y-4">
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
                  {application.status === ApplicationStatus.REJECTED && "Rejected"}
                </Badge>
              </CardTitle>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium">{`Name: ${application.fullName}`}</span>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    {`Request date: ${formatDateToSpanish(application.createdAt)}`}
                  </p>
                </div>
                {actionButtons && <div className="ml-4 flex-shrink-0">{actionButtons}</div>}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="flex items-center gap-1 text-blue-600 dark:text-white"
            >
              <span className="text-xs">{isExpanded ? "Hide details" : "View details"}</span>
              {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </Button>
          </div>

          {/* Detalles expandibles */}
          {isExpanded && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">Address:</span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">{application.address}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">Phone:</span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">{application.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">Status:</span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">{application.status}</p>
                </div>
                {application.reviewedAt && (
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">Reviewed At:</span>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {formatDateToSpanish(application.reviewedAt)}
                    </p>
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">Rejection Reason:</span>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge, Button, Card, CardBody, CardTitle, Input } from "@/components/kibo";
import { UserResponse, UsersFiltersRequest } from "@/core/types/users.types";
import { useGetUsers } from "@/hooks/users/useGetUsers";
import { formatDateToSpanish } from "@/utils/front.functions";
import { NextPage } from "next";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Users: NextPage = () => {
  const [pagination, setPagination] = useState<UsersFiltersRequest>();
  const { data, isLoading, error, refetch } = useGetUsers({
    ...pagination,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredUsers =
    data?.data?.users?.filter((user: UserResponse) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${user.walletAddress}`.toLowerCase().includes(searchLower) ||
        `${user.phone}`.toLowerCase().includes(searchLower) ||
        formatDateToSpanish(user.createdAt).toLowerCase().includes(searchLower)
      );
    }) ?? [];
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  }, []);

  if (isLoading) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="md:mx-auto md:min-w-md px-4">
          <div className="flex justify-center items-center py-8">
            <p>Loading Applications...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }
  if (error) {
    return (
      <RoleGuard requiredRole="user">
        <div className="md:mx-auto md:min-w-md px-4">
          <div className="flex flex-col justify-center items-center py-8">
            <p className="text-red-500 mb-4">Error: {error.message}</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="md:mx-auto md:min-w-md px-4">
        {/* Header */}
        <div className="kibo-page-header mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center">
              <ArrowLeftIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Users History</h1>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
            fullWidth
          />
        </div>
        {/* Users List */}
        <div className="kibo-section-spacing mb-32">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <Card key={user.id} shadow="sm">
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        <span className="text-neutral-900 dark:text-neutral-100">{"Kibo User"}</span>
                        {/* BADGE */}
                        {user.roles?.map((role, index) => (
                          <Badge
                            key={`${user.id}-${role.roleId}-${index}`}
                            variant={role.name === "admin" ? "success" : role.name === "ally" ? "warning" : "error"}
                            size="sm"
                          >
                            {role.name}
                          </Badge>
                        ))}
                      </CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">{`User Id: ${user.id}`}</span>
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">{`Wallet Addres: ${user.walletAddress}`}</span>
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span>{`Email: ${user.email}`}</span>
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {`Created at: ${formatDateToSpanish(user.createdAt)}`}
                        </p>
                      </div>
                    </div>
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
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Users found</h3>
                  {searchTerm && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Try adjusting your search terms</p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

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

export default Users;

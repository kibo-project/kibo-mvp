"use client";

import React, { useEffect, useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { Button, Card, CardBody, Input } from "@/components/kibo";
import { FormData } from "@/core/types/generic.types";
import { useRoleChange } from "@/hooks/auth/useRoleChange";
import { useEditProfile } from "@/hooks/users/useEditProfile";
import { useProfile } from "@/hooks/users/useProfile";
import { formatDateToSpanish } from "@/utils/front.functions";
import { NextPage } from "next";
import { useForm } from "react-hook-form";

const Profile: NextPage = () => {
  const { data, isLoading, refetch } = useProfile();
  const editProfileMutation = useEditProfile();
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  useEffect(() => {
    if (data?.data) {
      reset({
        fullName: data.data.name || "",
        email: data.data.email || "",
        phone: data.data.phone || "",
      });
    }
  }, [data, reset]);

  const onSubmit = (formData: FormData) => {
    const profileData = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    };

    editProfileMutation.mutate(profileData, {
      onSuccess: () => {
        setIsEditing(false);
        refetch();
        console.log("Profile updated successfully!");
      },
      onError: error => {
        console.error("Error updating profile:", error);
      },
    });
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex bg-primary items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4">
        <Card className="w-full max-w-md mb-20">
          <CardBody className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-xl font-semibold text-base-content mb-2">Loading Profile...</h1>
          </CardBody>
        </Card>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex bg-primary items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4">
        <Card className="w-full max-w-md mb-20">
          <CardBody className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-xl font-semibold text-base-content mb-2">Profile not found</h1>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex bg-primary items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] p-4">
      <Card className="w-full max-w-2xl mb-20">
        <CardBody>
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
              {"👤"}
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-1">{data.data?.name || "Anonymous User"}</h1>
            <div className="flex justify-between">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={editProfileMutation.isPending}
              >
                {"Edit Profile"}
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Full Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Minimum 2 characters" },
                    })}
                    error={!!errors.fullName?.message}
                  />
                ) : (
                  <p className="text-base-content">{data.data?.name || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    error={!!errors.fullName?.message}
                  />
                ) : (
                  <p className="text-base-content">{data.data?.email || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Phone</label>
                {isEditing ? (
                  <Input
                    type="tel"
                    placeholder="+591 12345678"
                    {...register("phone", {
                      required: "Telephone is required",
                      pattern: { value: /^\+?[0-9\s\-]{8,}$/, message: "Invalid telephone number" },
                    })}
                    error={!!errors.phone?.message}
                  />
                ) : (
                  <p className="text-base-content">{data.data?.phone || "Not provided"}</p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-base-content border-b border-base-300 pb-2">
                Account Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Wallet Address</label>
                <p className="text-base-content font-mono text-xs bg-base-100 p-2 rounded">
                  {data.data?.walletAddress
                    ? `${data.data?.walletAddress.slice(0, 6)}...${data.data?.walletAddress.slice(-4)}`
                    : "Not connected"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Member Since</label>
                <p className="text-base-content">{formatDateToSpanish(data.data?.createdAt || "")}</p>
              </div>

              {data.data?.lastLoginAt && (
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Last Login</label>
                  <p className="text-base-content">{formatDateToSpanish(data.data?.lastLoginAt.toString())}</p>
                </div>
              )}
            </div>
          </div>

          {/* Banking Information */}
          {(data.data?.bankName || data.data?.accountNumber || data.data?.accountHolder) && (
            <div className="mt-6 pt-6 border-t border-base-300">
              <h3 className="text-lg font-semibold text-base-content mb-4">Banking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.data?.bankName && (
                  <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">Bank Name</label>
                    <p className="text-base-content">{data.data?.bankName}</p>
                  </div>
                )}
                {data.data?.accountHolder && (
                  <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">Account Holder</label>
                    <p className="text-base-content">{data.data?.accountHolder}</p>
                  </div>
                )}
                {data.data?.accountNumber && (
                  <div>
                    <label className="block text-sm font-medium text-base-content/70 mb-1">Account Number</label>
                    <p className="text-base-content font-mono">****{data.data?.accountNumber.slice(-4)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/*Action Buttons */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-base-300 flex gap-3 justify-end">
              <Button type="button" variant="primary" onClick={handleCancel} disabled={editProfileMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit(onSubmit)}
                disabled={editProfileMutation.isPending}
              >
                {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {editProfileMutation.isError && (
            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded text-error text-sm">
              Error updating profile. Please try again.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;

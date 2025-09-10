"use client";

import React, { useState } from "react";
import { ConfirmationModal } from "@/components/ConfimationModal";
import { Button, Card, CardBody, CardTitle, Input } from "@/components/kibo";
import { useForm } from "react-hook-form";

interface FormData {
  fullName: string;
  phone: string;
  address: string;
}

interface ApplicationFormProps {
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  title?: string;
  isLoading?: boolean;
  confirmationMessage: string;
  successTitle?: string;
  successMessage?: string;
  submitButtonText?: string;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onClose,
  onSubmit,
  title,
  isLoading = false,
  confirmationMessage,
  successTitle,
  successMessage,
  submitButtonText,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmitClick = (data: FormData) => {
    setFormDataToSubmit(data);
    setIsModalOpen(true);
  };

  const onConfirmSubmit = async () => {
    if (!formDataToSubmit) return;
    setIsModalOpen(false);

    try {
      await onSubmit(formDataToSubmit);
      setIsSubmitted(true);
      reset();
      setFormDataToSubmit(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const onCancelSubmit = () => {
    setIsModalOpen(false);
    setFormDataToSubmit(null);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    reset();
    onClose();
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <CardTitle className="text-xl mb-4">{successTitle}</CardTitle>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{successMessage}</p>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardBody>
          <CardTitle className="text-center mb-6">{title}</CardTitle>
          <div className="space-y-4">
            <Input
              label="Fullname"
              type="text"
              placeholder="Enter your full name"
              {...register("fullName", {
                required: "Full name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
              })}
              error={!!errors.fullName?.message}
            />

            <Input
              label="Telephone"
              type="tel"
              placeholder="+591 12345678"
              {...register("phone", {
                required: "Telephone is required",
                pattern: { value: /^\+?[0-9\s\-]{8,}$/, message: "Invalid telephone number" },
              })}
              error={!!errors.phone?.message}
            />

            <Input
              label="Address"
              type="text"
              placeholder="Enter your address"
              {...register("address", {
                required: "Address is required",
                minLength: { value: 10, message: "Address is too short" },
              })}
              error={!!errors.address?.message}
            />

            <div className="flex gap-3 justify-end">
              {" "}
              <Button variant="primary" disabled={isLoading} onClick={handleSubmit(onSubmitClick)}>
                {isLoading ? "Sending..." : submitButtonText}
              </Button>
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={onCancelSubmit}
        onConfirm={onConfirmSubmit}
        message={confirmationMessage}
        isLoading={isLoading}
      />
    </>
  );
};

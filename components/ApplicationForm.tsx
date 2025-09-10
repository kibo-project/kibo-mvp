"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, CardTitle, Input } from "@/components/kibo";
import { useForm } from "react-hook-form";

interface FormData {
  fullName: string;
  phone: string;
  address: string;
}

const ApplicationForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Form data:", data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <CardTitle className="text-xl mb-4">¡Application Sent!</CardTitle>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            We will review your request within 24-48 hours and contact you by phone.{" "}
          </p>
          <Button variant="primary" onClick={() => setIsSubmitted(false)}>
            New Application
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <CardTitle className="text-center mb-6">ALLY APPLICATION FORM</CardTitle>

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

          <Button variant="primary" disabled={isLoading} className="w-full" onClick={handleSubmit(onSubmit)}>
            {isLoading ? "Sending..." : "Send Application"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ApplicationForm;

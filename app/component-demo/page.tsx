"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "~~/components/kibo";

export default function ComponentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    amount: "",
    message: "",
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsModalOpen(false);
    // Reset form
    setFormData({ email: "", amount: "", message: "" });
  };

  const transactions = [
    { id: 1, type: "Payment Sent", amount: "$125.00", status: "success", date: "2024-01-15" },
    { id: 2, type: "Payment Received", amount: "$250.00", status: "success", date: "2024-01-14" },
    { id: 3, type: "Payment Pending", amount: "$75.00", status: "warning", date: "2024-01-13" },
    { id: 4, type: "Payment Failed", amount: "$100.00", status: "error", date: "2024-01-12" },
  ];

  return (
    <div className="kibo-container py-8">
      {/* Page Header */}
      <div className="kibo-page-header mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Component System Demo</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Framework-agnostic components built with Tailwind CSS v4
          </p>
        </div>
        <Badge variant="info" dot>
          Beta
        </Badge>
      </div>

      <div className="kibo-section-spacing">
        {/* Button Showcase */}
        <Card>
          <CardBody>
            <CardTitle>Button Variants</CardTitle>
            <CardSubtitle>Different button styles and states</CardSubtitle>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <Button variant="primary" fullWidth>
                  Primary Button
                </Button>
                <Button variant="secondary" fullWidth>
                  Secondary Button
                </Button>
                <Button variant="ghost" fullWidth>
                  Ghost Button
                </Button>
                <Button variant="danger" fullWidth>
                  Danger Button
                </Button>
              </div>

              <div className="space-y-3">
                <Button variant="primary" size="sm" fullWidth>
                  Small Button
                </Button>
                <Button variant="primary" size="lg" fullWidth>
                  Large Button
                </Button>
                <Button variant="primary" loading fullWidth>
                  Loading...
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  With Icon
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Form Example */}
        <Card shadow="md">
          <CardBody>
            <CardTitle>Payment Form</CardTitle>
            <CardSubtitle>Example form using Input and Textarea components</CardSubtitle>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Recipient Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter recipient email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  leftIcon={<span className="text-neutral-500">$</span>}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Message (Optional)
                </label>
                <Textarea
                  placeholder="Add a note to your payment..."
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  fullWidth
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsModalOpen(true)}
                disabled={!formData.email || !formData.amount}
              >
                Send Payment
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardBody>
            <CardTitle>Recent Transactions</CardTitle>
            <CardSubtitle>Transaction history with status badges</CardSubtitle>

            <div className="space-y-3 mt-4">
              {transactions.map(transaction => (
                <Card key={transaction.id} shadow="sm">
                  <CardBody compact>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{transaction.type}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">{transaction.amount}</p>
                        <Badge variant={transaction.status as "success" | "warning" | "error"} size="sm">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Badge Showcase */}
        <Card>
          <CardBody>
            <CardTitle>Status Badges</CardTitle>
            <CardSubtitle>Different badge variants and sizes</CardSubtitle>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">With Dots</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" dot>
                    Online
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending
                  </Badge>
                  <Badge variant="error" dot>
                    Offline
                  </Badge>
                  <Badge variant="info" dot>
                    Processing
                  </Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          <h2 className="text-lg font-semibold">Confirm Payment</h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">Are you sure you want to send this payment?</p>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">To:</span>
                <span className="text-sm font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount:</span>
                <span className="text-sm font-medium">${formData.amount}</span>
              </div>
              {formData.message && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Message:</span>
                  <span className="text-sm font-medium">{formData.message}</span>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Confirm Payment
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

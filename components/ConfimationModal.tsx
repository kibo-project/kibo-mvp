import { useState } from "react";
import { Button, Card, CardBody, Input } from "@/components/kibo";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  message: string;
  isLoading?: boolean;
  requiresReason?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  isLoading = false,
  requiresReason = false,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <Card>
          <CardBody>
            <p className="text-neutral-900 dark:text-neutral-100 mb-6">{message}</p>
            {requiresReason && (
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Enter reason for rejection"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  fullWidth
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => onConfirm(reason)}
                disabled={isLoading || (requiresReason && reason.trim() === "")}
              >
                {isLoading ? "Processing..." : "Yes"}
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

"use client";

import { useCallback, useState } from "react";
import { RoleResponse } from "@/core/types/users.types";
import { Button } from "~~/components/kibo";

interface RoleSelectorProps {
  currentRole: RoleResponse;
  availableRoles: RoleResponse[];
  onRoleChange: (role: RoleResponse) => void;
  disabled?: boolean;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  availableRoles,
  onRoleChange,
  disabled = false,
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const hasMultipleRoles = availableRoles.length > 0;
  const displayRole = currentRole;

  const handleRoleSelect = useCallback(
    (role: RoleResponse) => {
      onRoleChange(role);
      setShowDropdown(false);
    },
    [onRoleChange]
  );

  const handleToggle = useCallback(() => {
    if (hasMultipleRoles && !disabled) {
      setShowDropdown(!showDropdown);
    }
  }, [hasMultipleRoles, disabled, showDropdown]);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        className={`
    flex items-center justify-between gap-2 px-3 py-1 min-w-[80px]
    border border-gray-300 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-0
    ${hasMultipleRoles && !disabled ? "cursor-pointer" : "cursor-default"}
  `}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className="capitalize">{displayRole.name}</span>
        {hasMultipleRoles && !disabled && (
          <span className={`text-xs transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}>▼</span>
        )}
      </Button>

      {showDropdown && hasMultipleRoles && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-full right-0 mt-2 rounded-md shadow-lg overflow-hidden z-20 min-w-[80px] border border-gray-300 bg-white dark:bg-gray-800 space-y-1 p-1">
            {availableRoles.map(role => (
              <Button
                key={role.roleId}
                onClick={() => handleRoleSelect(role)}
                variant="secondary"
                size="sm"
                className="w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 capitalize rounded"
              >
                {role.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

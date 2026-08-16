// Shared prop contracts for the reusable components below (spec section
// 34). Import these types instead of redefining local ones so both
// frontend devs stay wire-compatible without talking to each other on
// every prop change.

import type { BookingStatus, BookingWithDetails, Product, Resource, Service } from "@/types/database";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "error";
  hint?: string;
}

export interface BookingCardProps {
  booking: BookingWithDetails;
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
  compact?: boolean;
}

export interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect?: (service: Service) => void;
}

export interface EmployeeCardProps<
  T extends Pick<Resource, "id" | "name" | "type" | "is_active"> = Resource
> {
  resource: T;
  statusLabel?: "Available" | "With customer" | "Off today";
  selected?: boolean;
  onSelect?: (resource: T) => void;
}

export interface ProductRowProps {
  product: Product;
  onAdjust?: (productId: string, change: number) => void;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

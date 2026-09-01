"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  size?: "default" | "profile" | "large" | "full";
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  size = "default",
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const sizeClasses = {
    default: "max-w-3xl",
    profile: "max-w-2xl",
    large: "max-w-5xl",
    full: "max-w-7xl"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className={cn("border-slate-200 bg-white shadow-2xl", sizeClasses[size])}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-w-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "./utils"; // make sure ./utils exports `cn(...classes)`

function AlertDialog(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Root>
) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>
) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

function AlertDialogPortal(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>
) {
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      {...props}
    />
  );
}

function AlertDialogOverlay(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>
) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50", // stripped animate-* utilities to avoid plugin requirements
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>
) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          // Centered modal, tailwind-only, no animate utilities needed
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white p-6 shadow-lg sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader(
  { className, ...props }: React.ComponentProps<"div">
) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter(
  { className, ...props }: React.ComponentProps<"div">
) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>
) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>
) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-slate-600", className)}
      {...props}
    />
  );
}

// Action/Cancel without buttonVariants — just sensible defaults.
function AlertDialogAction(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action>
) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogCancel(
  { className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>
) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

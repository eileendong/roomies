"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus as MinusIcon } from "lucide-react";
import { cn } from "./utils";

/* standard text Input */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
      "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* OTP components (unchanged) */
export function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

export function InputOTPGroup(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-group" className={cn("flex items-center gap-1", props.className)} {...props} />
  );
}

export function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r bg-white text-sm",
        "outline-none first:rounded-l-md first:border-l last:rounded-r-md transition-all",
        "data-[active=true]:z-10 data-[active=true]:ring-2 data-[active=true]:border-blue-500 data-[active=true]:ring-blue-500/50",
        "aria-invalid:border-red-500 data-[active=true]:aria-invalid:border-red-500 data-[active=true]:aria-invalid:ring-red-500/20",
        "border-slate-300",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-pulse bg-slate-900 duration-1000" />
        </div>
      )}
    </div>
  );
}

export function InputOTPSeparator(props: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

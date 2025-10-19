"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  DayPicker,
  UI,
  DayFlag,
  SelectionState,
  type ChevronProps,
} from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row gap-2",
        [UI.Month]: "flex flex-col gap-4",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center w-full",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.Nav]: "flex items-center gap-1",
        [UI.PreviousMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        [UI.NextMonthButton]: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-x-1",
        [UI.Weekdays]: "flex",
        [UI.Weekday]:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        [UI.Week]: "flex w-full mt-2",

        // The grid cell
        [UI.Day]: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "first:[&[aria-selected]]:rounded-l-md last:[&[aria-selected]]:rounded-r-md"
            : "[&[aria-selected]]:rounded-md"
        ),
        // The button inside the cell
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),

        // Selection states (v9)
        [SelectionState.range_start]:
          "rounded-l-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        [SelectionState.range_end]:
          "rounded-r-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        [SelectionState.selected]:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        [SelectionState.range_middle]:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        // Day flags (v9)
        [DayFlag.today]: "bg-accent text-accent-foreground",
        [DayFlag.outside]:
          "text-muted-foreground aria-selected:text-muted-foreground",
        [DayFlag.disabled]: "text-muted-foreground opacity-50",
        [DayFlag.hidden]: "invisible",

        ...classNames,
      }}
      components={{
        // v9 uses a single Chevron component instead of IconLeft/IconRight
        Chevron: ({ orientation, className, ...iconProps }: ChevronProps) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
              ? ChevronRight
              : orientation === "up"
              ? ChevronUp
              : ChevronDown;
          return <Icon className={cn("size-4", className)} {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };

"use client";

import * as React from "react";
import type { ComponentProps, CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

// Derive the prop types directly from Sonner
type SonnerProps = ComponentProps<typeof Sonner>;

const Toaster = (props: SonnerProps) => {
  const { theme: currentTheme = "system" } = useTheme();

  // Narrow theme safely to what Sonner expects
  const sonnerTheme: SonnerProps["theme"] =
    currentTheme === "light" || currentTheme === "dark" || currentTheme === "system"
      ? currentTheme
      : "system";

  // CSS variables with a TS-friendly type
  const cssVars = {
    ["--normal-bg" as any]: "var(--popover)",
    ["--normal-text" as any]: "var(--popover-foreground)",
    ["--normal-border" as any]: "var(--border)",
  } as CSSProperties;

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      style={cssVars}
      {...props}
    />
  );
};

export { Toaster };

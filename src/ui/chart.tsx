"use client";

import * as React from "react";
import * as Recharts from "recharts";
import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Partial<Record<keyof typeof THEMES, string>>;
  };
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within a <ChartContainer />");
  return ctx;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof Recharts.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          // Recharts polish via Tailwind selectors
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-hidden",
          "[&_.recharts-sector]:outline-hidden",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-hidden",
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, v]) => v.theme || v.color);
  if (!colorConfig.length) return null;

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const lines = colorConfig
        .map(([key, item]) => {
          const color = item.theme?.[theme as keyof typeof THEMES] ?? item.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");
      return `${prefix} [data-chart=${id}] {\n${lines}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

const ChartTooltip = Recharts.Tooltip;

// NOTE: We avoid Recharts' generic props here on purpose.
// They’re inconsistent across versions and cause TS errors.
// We type this with broad “any” where needed.
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...divProps
}: {
  active?: boolean;
  payload?: any[];
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: React.ReactNode;
  labelFormatter?: (val: any, payload?: any[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (value: any, name: any, item: any, index: number, dp?: any) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
} & React.ComponentProps<"div">) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = String(labelKey || item?.dataKey || item?.name || "value");
    const itemCfg = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string" ? config[label]?.label ?? label : itemCfg?.label;

    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
    }
    if (!value) return null;
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...divProps}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(nameKey || item.name || item.dataKey || "value");
          const itemCfg = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item?.payload?.fill || item.color;

          return (
            <div
              key={String(item.dataKey ?? index)}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2",
                "[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemCfg?.icon ? (
                    <itemCfg.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                        className={cn(
                          "shrink-0 rounded-[2px] bg-[var(--color-bg)] border-[var(--color-border)]",
                          indicator === "dot" && "h-2.5 w-2.5",
                          indicator === "line" && "h-2.5 w-1",
                          indicator === "dashed" &&
                            "w-0 border-[1.5px] border-dashed bg-transparent",
                          payload.length === 1 && indicator === "dashed" && "my-0.5"
                        )}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemCfg?.label ?? item.name}
                      </span>
                    </div>
                    {item.value != null && item.value !== "" && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {Number(item.value).toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = Recharts.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  ...divProps
}: {
  className?: string;
  hideIcon?: boolean;
  payload?: any[];
  verticalAlign?: "top" | "bottom" | "middle";
  nameKey?: string;
} & React.ComponentProps<"div">) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
      {...divProps}
    >
      {payload.map((item, i) => {
        const key = String(nameKey || item.dataKey || "value");
        const itemCfg = getPayloadConfigFromPayload(config, item, key);
        return (
          <div
            key={String(item.value ?? key ?? i)}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {itemCfg?.icon && !hideIcon ? (
              <itemCfg.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color as string }}
              />
            )}
            {itemCfg?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper
function getPayloadConfigFromPayload(config: ChartConfig, payload: any, key: string) {
  if (!payload || typeof payload !== "object") return undefined;

  const pp = payload && typeof payload.payload === "object" ? payload.payload : undefined;

  let labelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    labelKey = payload[key] as string;
  } else if (pp && key in pp && typeof pp[key] === "string") {
    labelKey = pp[key] as string;
  }

  return labelKey in config ? config[labelKey] : (config as any)[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

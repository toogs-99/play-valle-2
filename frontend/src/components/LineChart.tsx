"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

export interface LineChartProps {
  data: any[];
  index: string;
  categories: string[];
  showLegend?: boolean;
  showYAxis?: boolean;
  startEndOnly?: boolean;
  className?: string;
  tooltipCallback?: (props: TooltipProps) => React.ReactNode | null;
}

// Internal reporter component that forwards tooltip state change to tooltipCallback
const CustomTooltipReporter = ({
  active,
  payload,
  label,
  tooltipCallback,
}: any) => {
  useEffect(() => {
    if (tooltipCallback) {
      tooltipCallback({ active, payload, label });
    }
  }, [active, payload, label, tooltipCallback]);

  return null;
};

const translateMonth = (value: any): string => {
  if (value === undefined || value === null) return "";
  const strVal = String(value);
  const match = strVal.match(/^([A-Za-z]+)\s+\d+/);
  if (!match) return strVal;
  const month = match[1].toLowerCase();
  switch (month) {
    case "jan": return "Jan";
    case "feb": return "Fev";
    case "mar": return "Mar";
    case "apr": return "Abr";
    case "may": return "Mai";
    case "jun": return "Jun";
    case "jul": return "Jul";
    case "aug": return "Ago";
    case "sep": return "Set";
    case "oct": return "Out";
    case "nov": return "Nov";
    case "dec": return "Dez";
    default: return strVal;
  }
};

export function LineChart({
  data,
  index,
  categories,
  showLegend = true,
  showYAxis = true,
  startEndOnly = false,
  className,
  tooltipCallback,
}: LineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data || data.length === 0) {
    return <div className={cn("w-full h-48 bg-muted/5 rounded-lg border animate-pulse", className)} />;
  }

  // Curated color list using variables of our CSS variables
  const categoryColors = [
    "var(--primary)",
    "var(--accent)",
    "oklch(0.577 0.245 27.325)", // destructive red
    "oklch(0.769 0.188 70.08)" // warning/amber equivalent
  ];

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="var(--border)" 
            opacity={0.5} 
          />
          
          <XAxis
            dataKey={index}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
            style={{ opacity: 0.8 }}
            tickFormatter={translateMonth}
          />

          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dx={-4}
            width={35}
            style={{ opacity: 0.6 }}
            tickCount={4}
            tickFormatter={(val) => {
              if (val >= 1000) {
                return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
              }
              return val;
            }}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              return (
                <>
                  <CustomTooltipReporter 
                    active={active} 
                    payload={payload} 
                    label={label} 
                    tooltipCallback={tooltipCallback} 
                  />
                  {active && payload && payload.length && (
                    <div className="bg-neutral-900 text-neutral-100 p-2 rounded-lg shadow-md border-0 text-[10px] font-text leading-normal z-50">
                      <p className="font-bold">{translateMonth(label)}</p>
                      <p className="font-semibold mt-0.5 text-indigo-400">
                        {typeof payload[0].value === "number" && payload[0].value > 500
                          ? payload[0].name === "clicks" || payload[0].name === "followers" || payload[0].value === 4827 || payload[0].value === 3400 || payload[0].value < 5000
                            ? `${payload[0].value.toLocaleString("pt-BR")}`
                            : `R$ ${Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(payload[0].value)}`
                          : payload[0].value}
                      </p>
                    </div>
                  )}
                </>
              );
            }}
          />

          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                color: "var(--foreground)",
                paddingBottom: "10px",
              }}
            />
          )}

          {categories.map((category, idx) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={categoryColors[idx % categoryColors.length]}
              strokeWidth={2.5}
              fill="url(#chartGradient)"
              dot={{
                r: 3.5,
                strokeWidth: 0,
                fill: categoryColors[idx % categoryColors.length]
              }}
              activeDot={{
                r: 5,
                strokeWidth: 0,
                fill: categoryColors[idx % categoryColors.length]
              }}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

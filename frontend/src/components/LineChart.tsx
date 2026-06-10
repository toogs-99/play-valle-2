"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
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

  // Determine ticks to show if startEndOnly is true
  const ticks = startEndOnly && data.length > 0 
    ? [data[0][index], data[data.length - 1][index]] 
    : undefined;

  // Curated color list using variables of our CSS variables
  const categoryColors = [
    "var(--primary)",
    "var(--ring)",
    "oklch(0.577 0.245 27.325)", // destructive red
    "oklch(0.769 0.188 70.08)" // warning/amber equivalent
  ];

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="var(--border)" 
            opacity={0.5} 
          />
          
          <XAxis
            dataKey={index}
            ticks={ticks}
            interval={startEndOnly ? "preserveStartEnd" : "preserveEnd"}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
            style={{ opacity: 0.8 }}
          />

          <YAxis
            hide={!showYAxis}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            style={{ opacity: 0.8 }}
          />

          <Tooltip
            content={
              <CustomTooltipReporter tooltipCallback={tooltipCallback} />
            }
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
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={categoryColors[idx % categoryColors.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 0,
                fill: categoryColors[idx % categoryColors.length]
              }}
              connectNulls
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

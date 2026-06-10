"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BarListDataItem {
  name: string;
  value: number;
  href?: string;
  [key: string]: any;
}

export interface BarListProps extends React.HTMLAttributes<HTMLDivElement> {
  data: BarListDataItem[];
  valueFormatter?: (value: number) => string;
  onValueChange?: (item: BarListDataItem) => void;
}

export function BarList({
  data,
  valueFormatter = (val) => val.toString(),
  onValueChange,
  className,
  ...props
}: BarListProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const isClickable = !!onValueChange;

        const RowComponent = isClickable ? "button" : "div";

        return (
          <RowComponent
            key={item.name + index}
            onClick={isClickable ? () => onValueChange!(item) : undefined}
            className={cn(
              "group relative w-full rounded-md flex items-center justify-between text-left focus:outline-none transition-all duration-200 overflow-hidden",
              isClickable && "hover:bg-muted/30 cursor-pointer active:scale-[0.995]"
            )}
            style={{ minHeight: "36px" }}
          >
            {/* Background progress bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-primary/10 group-hover:bg-primary/15 rounded-md transition-all duration-500 ease-out pointer-events-none"
              style={{ width: `${percentage}%` }}
            />

            {/* Overlaid text content */}
            <div className="relative z-10 w-full flex items-center justify-between px-3 py-2 text-xs font-semibold">
              <span className="text-foreground font-text truncate mr-4">
                {item.name}
              </span>
              <span className="text-muted-foreground font-text font-bold shrink-0">
                {valueFormatter(item.value)}
              </span>
            </div>
          </RowComponent>
        );
      })}
    </div>
  );
}

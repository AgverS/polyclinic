"use client";
import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[];
  title?: string;
};

export default function Select({
  options,
  title,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 focus:outline-none focus:border-cyan-500 ${className ?? ""}`}
    >
      <option value="">{title || "Выберите"}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

"use client";
import React, { ChangeEventHandler } from "react";

type SelectProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  title?: string;
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  value,
  onChange,
  title,
  options,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      title={title}
      value={value}
      onChange={onChange}
      className="
        w-full
        bg-white/5
        border
        border-white/10
        rounded-lg
        px-4
        py-3
        h-12
        text-white
        focus:outline-none
        focus:border-blue-500
      "
    >
      <option value="" className="bg-slate-900 text-white">
        Выберите...
      </option>
      {options.map((option, i) => (
        <option key={i} value={option} className="bg-slate-900 text-white">
          {option}
        </option>
      ))}
    </select>
  );
}

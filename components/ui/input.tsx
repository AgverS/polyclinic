"use client";
import React from "react";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props;

  return (
    <input
      {...rest}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 ${className ?? ""}`}
    />
  );
}

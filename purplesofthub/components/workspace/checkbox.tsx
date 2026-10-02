"use client";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import "@/app/styles/workspace-checkbox.css";

export type WorkspaceCheckboxProps = {
  label?: ReactNode; checked: boolean; onChange: (checked: boolean) => void;
  disabled?: boolean; id?: string; className?: string; wrapperClassName?: string;
};
/** Controlled native checkbox: preserves the recovery boolean callback and form behavior. */
export function WorkspaceCheckbox({ label, checked, onChange, disabled = false, id, className = "", wrapperClassName = "" }: WorkspaceCheckboxProps) {
  return <label className={"ws-checkbox " + wrapperClassName} data-disabled={disabled || undefined}>
    <span className="ws-checkbox-control"><input id={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} disabled={disabled} className={className} />{checked ? <Check size={14} aria-hidden="true" /> : null}</span>
    {label ? <span className="ws-checkbox-label">{label}</span> : null}
  </label>;
}

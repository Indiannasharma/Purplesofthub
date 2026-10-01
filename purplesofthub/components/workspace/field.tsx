import * as React from "react";
import { Label } from "@/components/ui/label";

type FieldControlProps = Pick<React.HTMLAttributes<HTMLElement>, "id" | "aria-describedby" | "aria-invalid">;
export type WorkspaceFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  /** Render-prop slots also support complex controls without cloning or losing their props. */
  children: React.ReactNode | ((props: FieldControlProps) => React.ReactNode);
};

/** Owns accessible relationships only; the caller owns value, validation and submission. */
export function WorkspaceField({ id, label, description, error, children }: WorkspaceFieldProps) {
  const controlProps: FieldControlProps = {
    id,
    "aria-describedby": [description && id + "-description", error && id + "-error"].filter(Boolean).join(" ") || undefined,
    "aria-invalid": error ? true : undefined,
  };
  let control: React.ReactNode;
  if (typeof children === "function") {
    control = children(controlProps);
  } else if (React.isValidElement<FieldControlProps>(children) && children.type !== React.Fragment) {
    const describedBy = [...new Set([children.props["aria-describedby"], controlProps["aria-describedby"]].filter(Boolean).join(" ").split(/\s+/).filter(Boolean))].join(" ") || undefined;
    control = React.cloneElement(children, { ...controlProps, "aria-describedby": describedBy, "aria-invalid": error ? true : children.props["aria-invalid"] });
  } else {
    // For multiple/nested controls, use the slot API to attach relationships to the actual control.
    control = children;
  }
  return <div className="cc-field ws-field"><Label htmlFor={id}>{label}</Label>{description ? <p id={id + "-description"}>{description}</p> : null}{control}{error ? <span id={id + "-error"} role="alert">{error}</span> : null}</div>;
}

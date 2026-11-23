import * as React from "react";

/**
 * Icons provided by iconmcp (https://iconmcp.com/mcp)
 * Rendered on a 16-unit grid with 0.833 / 1.25 stroke, round caps and joins.
 */

export function Message({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M4.25 3 L11.75 3 C12.855 3 13.75 3.895 13.75 5 L13.75 9.25 C13.75 10.355 12.855 11.25 11.75 11.25 L7.25 11.25 L4.25 13.75 L4.25 11.25 L3.25 11.25 C2.698 11.25 2.25 10.802 2.25 10.25 L2.25 5 C2.25 3.895 3.145 3 4.25 3 Z" />
      </g>
    </svg>
  );
}

export function Plus({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="8" y1="3.25" x2="8" y2="12.75" />
      <line x1="3.25" y1="8" x2="12.75" y2="8" />
    </svg>
  );
}

export function Trash({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M3.5 4.25 L4.105 11.907 C4.187 12.948 5.055 13.75 6.098 13.75 L9.902 13.75 C10.945 13.75 11.813 12.948 11.895 11.907 L12.5 4.25" />
        <line x1="2.25" y1="4.25" x2="13.75" y2="4.25" />
        <path d="M6 4.25 L6 3.25 C6 2.698 6.448 2.25 7 2.25 L9 2.25 C9.552 2.25 10 2.698 10 3.25 L10 4.25" />
        <line x1="6.75" y1="7" x2="6.75" y2="11" />
        <line x1="9.25" y1="7" x2="9.25" y2="11" />
      </g>
    </svg>
  );
}

export function LogIn({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M9.75 2.25 L11.25 2.25 C12.078 2.25 12.75 2.922 12.75 3.75 L12.75 12.25 C12.75 13.078 12.078 13.75 11.25 13.75 L9.75 13.75" />
        <line x1="2.5" y1="8" x2="9.25" y2="8" />
        <path d="M6.25 5 L9.25 8 L6.25 11" />
      </g>
    </svg>
  );
}

export function LogOut({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M6.25 2.25 L4.75 2.25 C3.922 2.25 3.25 2.922 3.25 3.75 L3.25 12.25 C3.25 13.078 3.922 13.75 4.75 13.75 L6.25 13.75" />
        <line x1="6.75" y1="8" x2="13.5" y2="8" />
        <path d="M10.5 5 L13.5 8 L10.5 11" />
      </g>
    </svg>
  );
}

export function UserPlus({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <circle cx="6" cy="5.25" r="2.5" />
        <path d="M1.75 13.5 C2.25 11.25 3.9 9.75 6 9.75 C8.1 9.75 9.75 11.25 10.25 13.5" />
        <line x1="12" y1="4" x2="12" y2="8" />
        <line x1="10" y1="6" x2="14" y2="6" />
      </g>
    </svg>
  );
}

export function User({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <circle cx="8" cy="5" r="2.75" />
        <path d="M2.75 13.75 C3.3 11.15 5.4 9.5 8 9.5 C10.6 9.5 12.7 11.15 13.25 13.75" />
      </g>
    </svg>
  );
}

export function ChevronLeft({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g transform="rotate(180 8 8)">
        <path d="M5.875 3.75 L10.125 8 L5.875 12.25" />
      </g>
    </svg>
  );
}

export function ChevronRight({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M5.875 3.75 L10.125 8 L5.875 12.25" />
      </g>
    </svg>
  );
}

export function ChevronDown({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g transform="rotate(90 8 8)">
        <path d="M5.875 3.75 L10.125 8 L5.875 12.25" />
      </g>
    </svg>
  );
}

export function BookOpen({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M8 4 C6.5 3 4.5 2.75 2 2.75 V12.25 C4.5 12.25 6.5 12.5 8 13.5 C9.5 12.5 11.5 12.25 14 12.25 V2.75 C11.5 2.75 9.5 3 8 4 Z" />
        <line x1="8" y1="4" x2="8" y2="13.5" />
      </g>
    </svg>
  );
}

export function Zap({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M10.5 1.75 L6.081 7.332 C5.936 7.516 6.047 7.787 6.279 7.816 L9.284 8.192 C9.501 8.219 9.617 8.463 9.501 8.648 L6 14.25" />
        <path d="M7.983 11.078 L10.614 11.955 C10.7 11.983 10.768 12.049 10.8 12.134 L11.5 14" />
        <path d="M6.031 7.571 L3 9.5" />
      </g>
    </svg>
  );
}

export function Check({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M2.75 8.5 L6.25 12 L13.25 4.5" />
      </g>
    </svg>
  );
}

export function ShieldCheck({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M5 2.5 L11 2.5 A2 2 0 0 1 13 4.5 L13 6.525 C13 8.02 13 9.805 8 14 C3 9.805 3 8.02 3 6.525 L3 4.5 A2 2 0 0 1 5 2.5 Z" />
        <path d="M5.5 7.75 L7.25 9.5 L10.5 6.25" />
      </g>
    </svg>
  );
}

export function School({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <path d="M2.25 11.75 L2.25 10.75 C2.25 9.922 2.922 9.25 3.75 9.25 L3.75 9.25 C4.578 9.25 5.25 8.578 5.25 7.75 L5.25 7.75 C5.25 6.922 5.922 6.25 6.75 6.25 L9.25 6.25 C10.078 6.25 10.75 6.922 10.75 7.75 L10.75 7.75 C10.75 8.578 11.422 9.25 12.25 9.25 L12.25 9.25 C13.078 9.25 13.75 9.922 13.75 10.75 L13.75 11.75 C13.75 12.855 12.855 13.75 11.75 13.75 L4.25 13.75 C3.145 13.75 2.25 12.855 2.25 11.75 Z" />
        <line x1="8" y1="6.25" x2="8" y2="2.625" />
        <path d="M8.805 2.043 L9.375 2.25 C9.842 2.42 9.842 3.08 9.375 3.25 L8.805 3.457 C8.414 3.6 8 3.31 8 2.893 L8 2.607 C8 2.19 8.414 1.9 8.805 2.043 Z" />
        <path d="M6.75 13.75 L6.75 11.8 C6.75 11.358 7.108 11 7.55 11 L8.45 11 C8.892 11 9.25 11.358 9.25 11.8 L9.25 13.75" />
      </g>
    </svg>
  );
}

export function ArrowRight({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <line x1="2.75" y1="8" x2="13.25" y2="8" />
        <path d="M8.5 3.25 L13.25 8 L8.5 12.75" />
      </g>
    </svg>
  );
}

export function ArrowLeft({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g transform="rotate(180 8 8)">
        <line x1="2.75" y1="8" x2="13.25" y2="8" />
        <path d="M8.5 3.25 L13.25 8 L8.5 12.75" />
      </g>
    </svg>
  );
}

export function Lock({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.833"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g>
        <rect x="3" y="6.5" width="10" height="7.25" rx="1.5" />
        <path d="M5.25 6.5 V4.75 C5.25 3.231 6.481 2 8 2 C9.519 2 10.75 3.231 10.75 4.75 V6.5" />
      </g>
    </svg>
  );
}

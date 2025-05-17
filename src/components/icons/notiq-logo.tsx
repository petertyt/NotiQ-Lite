import type { SVGProps } from 'react';

export function NotiqLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="NotiQ Lite Logo"
      {...props}
    >
      <path d="M10 4 L10 20 M10 12 L20 12 M20 4 L20 20" /> {/* N */}
      <circle cx="35" cy="12" r="8" /> {/* o */}
      <path d="M50 20 L50 4 L58 4" /> {/* t */}
      <path d="M46 12 L54 12" />
      <path d="M65 4 L65 20" /> {/* i */}
      <circle cx="65" cy="2" r="1" fill="currentColor" />
      <path d="M75 4 C75 4 72 12 75 20 C78 12 75 4 75 4 Z M85 4 C85 4 82 12 85 20 C88 12 85 4 85 4 Z" strokeWidth="1.5" /> {/* Q stylized - two quote marks */}
    </svg>
  );
}

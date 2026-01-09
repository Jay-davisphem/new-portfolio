import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  title?: string;
};

function Svg(props: { children: ReactNode; className?: string; title?: string }) {
  return (
    <svg
      aria-hidden={props.title ? undefined : true}
      role={props.title ? "img" : "presentation"}
      className={props.className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {props.title ? <title>{props.title}</title> : null}
      {props.children}
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Svg className={props.className} title={props.title ?? "Arrow right"}>
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconHamburger(props: IconProps) {
  return (
    <Svg className={props.className} title={props.title ?? "Menu"}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg className={props.className} title={props.title ?? "Close"}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSkillPlaceholder(props: IconProps) {
  return (
    <Svg className={props.className} title={props.title ?? "Skill"}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.9"
      />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </Svg>
  );
}

export function SocialIcon(props: IconProps & { type: string }) {
  const t = props.type.toLowerCase();

  // Minimal set; unknown types fall back to a generic icon.
  if (t.includes("github")) {
    return (
      <Svg className={props.className} title={props.title ?? "GitHub"}>
        <path
          d="M12 2c5.523 0 10 4.62 10 10.318 0 4.56-2.865 8.43-6.839 9.796-.5.098-.682-.22-.682-.49 0-.334.012-1.216.012-2.387 0-.812-.268-1.34-.57-1.61 1.873-.214 3.844-.95 3.844-4.287 0-.95-.325-1.728-.857-2.336.086-.214.372-1.08-.082-2.25 0 0-.7-.232-2.29.892-.663-.19-1.373-.282-2.08-.286-.706.004-1.416.096-2.08.286-1.59-1.124-2.292-.892-2.292-.892-.454 1.17-.168 2.036-.082 2.25-.532.608-.857 1.386-.857 2.336 0 3.33 1.967 4.077 3.836 4.295-.242.216-.46.6-.536 1.16-.48.222-1.7.606-2.45-.724 0 0-.445-.83-1.288-.89 0 0-.82-.012-.058.526 0 0 .55.27.932 1.286 0 0 .492 1.54 2.83 1.074.004.77.012 1.5.012 1.718 0 .27-.18.584-.68.49C4.865 20.75 2 16.878 2 12.318 2 6.62 6.477 2 12 2Z"
          fill="currentColor"
        />
      </Svg>
    );
  }

  if (t.includes("linkedin")) {
    return (
      <Svg className={props.className} title={props.title ?? "LinkedIn"}>
        <path
          d="M6.5 9.5H4v10h2.5v-10ZM5.25 8.45c.83 0 1.5-.67 1.5-1.5S6.08 5.45 5.25 5.45s-1.5.67-1.5 1.5.67 1.5 1.5 1.5ZM20 19.5h-2.5v-5.2c0-1.24-.02-2.84-1.72-2.84-1.72 0-1.98 1.36-1.98 2.75v5.29H11.3v-10h2.4v1.36h.03c.33-.64 1.16-1.31 2.4-1.31 2.56 0 3.03 1.72 3.03 3.95v6Z"
          fill="currentColor"
        />
      </Svg>
    );
  }

  if (t.includes("twitter") || t.includes("x")) {
    return (
      <Svg className={props.className} title={props.title ?? "X"}>
        <path
          d="M18.9 2H21l-6.55 7.48L22 22h-6.17l-4.83-7.3L4.61 22H2.5l7.01-8.01L2 2h6.33l4.37 6.63L18.9 2Zm-1.08 18h1.16L7.23 3.88H5.99L17.82 20Z"
          fill="currentColor"
        />
      </Svg>
    );
  }

  return (
    <Svg className={props.className} title={props.title ?? props.type}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8.5 12h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

import React from "react";

type DoodleProps = {
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

export const Star: React.FC<DoodleProps> = ({
  className,
  size = 40,
  color = "#ffcf33",
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
  >
    <path
      d="M24 3l5.3 12.6L43 17l-10 9 3 14-12-7-12 7 3-14L5 17l13.7-1.4L24 3z"
      fill={color}
      stroke="#2b2a28"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const Heart: React.FC<DoodleProps> = ({
  className,
  size = 40,
  color = "#ff8fbe",
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
  >
    <path
      d="M24 42S6 30 6 17.5C6 11 11 7 16.5 7 20 7 23 9 24 12c1-3 4-5 7.5-5C37 7 42 11 42 17.5 42 30 24 42 24 42z"
      fill={color}
      stroke="#2b2a28"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const Squiggle: React.FC<DoodleProps> = ({
  className,
  size = 80,
  color = "#4f9fe0",
}) => (
  <svg
    className={className}
    width={size}
    height={size / 2.5}
    viewBox="0 0 120 48"
    fill="none"
    aria-hidden
  >
    <path
      d="M4 24C14 8 24 40 34 24S54 8 64 24 84 40 94 24s16-8 22 0"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const Arrow: React.FC<DoodleProps> = ({
  className,
  size = 90,
  color = "#2b2a28",
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    aria-hidden
  >
    <path
      d="M12 22c22 6 44 20 52 44"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M64 66l4-18M64 66l-18-2"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const Spark: React.FC<DoodleProps> = ({
  className,
  size = 30,
  color = "#9b87f5",
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden
  >
    <path
      d="M16 2c1 8 5 12 13 14-8 2-12 6-13 14-1-8-5-12-13-14 8-2 12-6 13-14z"
      fill={color}
      stroke="#2b2a28"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const Pencil: React.FC<DoodleProps> = ({
  className,
  size = 44,
  color = "#ffcf33",
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden
  >
    <path
      d="M8 40l3-9 21-21 6 6-21 21-9 3z"
      fill={color}
      stroke="#2b2a28"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M30 12l6 6" stroke="#2b2a28" strokeWidth="2.5" />
    <path d="M11 31l6 6" stroke="#2b2a28" strokeWidth="2.5" />
  </svg>
);

/** A small round "brand" badge with the pencil, used as the logo mark. */
export const LogoMark: React.FC<DoodleProps> = ({ className, size = 40 }) => (
  <span
    className={className}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#ffcf33",
      border: "2.5px solid #2b2a28",
      boxShadow: "2px 2px 0 rgba(43,42,40,0.9)",
    }}
  >
    <Pencil size={size * 0.6} color="#fff" />
  </span>
);

"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

type Stage = 1 | 2 | 3 | 4 | 5 | 6;

const UPPER =
  "M 92 186 C 118 148 176 122 240 128 C 310 134 362 144 392 158";
const LOWER =
  "M 92 186 C 128 214 190 224 250 208 C 318 190 368 172 392 158";
const ALMOND = `${UPPER} C 368 172 318 190 250 208 C 190 224 128 214 92 186 Z`;
const POLYGON = "M 92 186 L 148 138 L 248 122 L 392 158 L 268 214 L 168 218 Z";
const CREASE =
  "M 118 168 C 168 118 230 102 292 112 C 340 120 372 136 398 150";

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <clipPath id={`${uid}-almond`}>
        <path d={ALMOND} />
      </clipPath>
      <filter id={`${uid}-grain`} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          seed="7"
          result="n"
        />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.15" />
      </filter>
    </defs>
  );
}

function Labels({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <g
      fill="#5c5346"
      fontFamily="Caveat, Kalam, cursive"
      fontSize="18"
      letterSpacing="0.02em"
    >
      {children}
    </g>
  );
}

function EyeStageDiagram({
  stage,
  className,
}: {
  stage: Stage;
  className?: string;
}) {
  const uid = `eye${stage}`;

  return (
    <svg
      viewBox="0 0 480 320"
      className={className}
      role="img"
      aria-label={`Eye construction, stage ${stage}`}
    >
      <Defs uid={uid} />
      <g filter={`url(#${uid}-grain)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {stage >= 1 && (
          <g>
            <line
              x1="92"
              y1="186"
              x2="392"
              y2="158"
              stroke="#b56b3a"
              strokeWidth={stage === 1 ? 1.8 : 1.1}
              strokeDasharray={stage === 1 ? "6 5" : "4 6"}
              opacity={stage === 1 ? 1 : 0.45}
            />
            <circle cx="92" cy="186" r="4.5" fill="#b56b3a" stroke="none" />
            <circle cx="392" cy="158" r="4.5" fill="#b56b3a" stroke="none" />
          </g>
        )}

        {stage === 1 && (
          <>
            <path
              d="M 300 158 A 110 110 0 0 1 318 198"
              stroke="#b56b3a"
              strokeWidth="1.4"
            />
            <path d="M 312 196 L 318 198 L 320 190" stroke="#b56b3a" strokeWidth="1.4" />
            <Labels>
              <text x="54" y="214">
                inner
              </text>
              <text x="398" y="148">
                outer
              </text>
              <text x="328" y="222">
                the tilt
              </text>
            </Labels>
          </>
        )}

        {stage === 2 && (
          <>
            <path d={POLYGON} stroke="#b56b3a" strokeWidth="2.1" />
            <path d={UPPER} stroke="#2c2416" strokeWidth="1.15" opacity="0.35" />
            <path d={LOWER} stroke="#2c2416" strokeWidth="1.15" opacity="0.35" />
            <Labels>
              <text x="28" y="48">
                find the straight lines
              </text>
              <text x="28" y="72">
                hiding in the curve
              </text>
            </Labels>
          </>
        )}

        {stage >= 3 && (
          <>
            <path d={UPPER} stroke="#2c2416" strokeWidth={stage === 3 ? 2 : 1.7} />
            <path d={LOWER} stroke="#2c2416" strokeWidth={stage === 3 ? 2 : 1.7} />
          </>
        )}

        {stage === 3 && (
          <>
            <path
              d="M 92 230 L 92 242 L 392 214 L 392 202"
              stroke="#b56b3a"
              strokeWidth="1.3"
            />
            <path d="M 240 118 L 240 128" stroke="#b56b3a" strokeWidth="1.3" />
            <path d="M 250 208 L 250 236" stroke="#b56b3a" strokeWidth="1.3" />
            <path
              d="M 228 118 L 228 108 L 262 108 L 262 118"
              stroke="#b56b3a"
              strokeWidth="1.3"
            />
            <Labels>
              <text x="200" y="268">
                width
              </text>
              <text x="268" y="104">
                height
              </text>
            </Labels>
          </>
        )}

        {stage >= 4 && (
          <g clipPath={`url(#${uid}-almond)`}>
            <circle
              cx="228"
              cy="172"
              r="58"
              stroke="#2c2416"
              strokeWidth="1.6"
              fill={stage >= 6 ? "rgba(44,36,22,0.06)" : "none"}
            />
            <circle
              cx="220"
              cy="170"
              r="23"
              fill="#2c2416"
              stroke="none"
              opacity={stage >= 6 ? 0.88 : 0.75}
            />
            {stage >= 6 && (
              <circle cx="206" cy="160" r="7.5" fill="#f7f1e6" stroke="none" />
            )}
          </g>
        )}

        {stage === 4 && (
          <Labels>
            <text x="24" y="52">
              the lids cut the circle
            </text>
            <text x="24" y="76">
              — don&apos;t draw a full iris
            </text>
          </Labels>
        )}

        {stage >= 5 && (
          <>
            <path d={CREASE} stroke="#2c2416" strokeWidth="1.35" opacity="0.85" />
            <path
              d="M 250 208 C 300 198 348 180 382 164"
              stroke="#2c2416"
              strokeWidth="1.15"
              opacity="0.55"
            />
          </>
        )}

        {stage === 5 && (
          <Labels>
            <text x="300" y="96">
              crease
            </text>
            <text x="300" y="248">
              lid thickness
            </text>
          </Labels>
        )}

        {stage === 6 && (
          <>
            <g stroke="#2c2416" strokeWidth="1.05" opacity="0.28">
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 150 + i * 14;
                return (
                  <line
                    key={x}
                    x1={x}
                    y1={118 + (i % 3) * 3}
                    x2={x + 18}
                    y2={148 + (i % 4) * 4}
                  />
                );
              })}
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={`s${i}`}
                  x1={200 + i * 12}
                  y1={128}
                  x2={214 + i * 12}
                  y2={166}
                />
              ))}
            </g>
            <g stroke="#2c2416" strokeWidth="1.2">
              <path d="M 348 150 C 356 138 362 128 366 118" />
              <path d="M 362 154 C 372 144 380 134 384 124" />
              <path d="M 374 158 C 384 150 392 142 396 134" />
              <path d="M 110 176 C 102 168 96 160 94 152" opacity="0.7" />
            </g>
            <Labels>
              <text x="24" y="52">
                structure first.
              </text>
              <text x="24" y="76">
                detail last.
              </text>
            </Labels>
          </>
        )}
      </g>
    </svg>
  );
}

export default EyeStageDiagram;
export type { Stage };
const PDF_HREF = "/eyes/playing-with-pencil-eyes-practice.pdf";
const PDF_PAGES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function WorksheetMockup() {
  return (
    <a
      href={PDF_HREF}
      download="PlayingWithPencil-Eyes-Practice.pdf"
      className="eyes-pdf-preview"
    >
      <div className="eyes-pdf-stack">
        <img
          className="eyes-pdf-page eyes-pdf-back"
          src="/eyes/previews/page-7.jpg"
          alt=""
        />
        <img
          className="eyes-pdf-page eyes-pdf-mid"
          src="/eyes/previews/page-2.jpg"
          alt=""
        />
        <img
          className="eyes-pdf-page eyes-pdf-front"
          src="/eyes/previews/page-1.jpg"
          alt="Preview of the free Eyes Practice PDF: Step 1, Block the Structure"
        />
      </div>
      <p className="eyes-pdf-caption">8 pages · study the example, then draw from reference</p>
    </a>
  );
}

export function WorksheetThumbs() {
  return (
    <div className="eyes-pdf-thumbs" aria-label="All eight pages of the Eyes Practice PDF">
      {PDF_PAGES.map((page) => (
        <a
          key={page}
          href={PDF_HREF}
          download="PlayingWithPencil-Eyes-Practice.pdf"
          className="eyes-pdf-thumb"
        >
          <img
            src={`/eyes/previews/page-${page}.jpg`}
            alt={`Eyes Practice PDF, page ${page}`}
          />
          <span>{page}</span>
        </a>
      ))}
    </div>
  );
}

export default EyeStageDiagram;
export type { Stage };

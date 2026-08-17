import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

export const alt = "Brian Hanquet — Full-stack Web Developer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Lexend (the site's brand font) is not available to Satori via next/font,
// so the TTFs are bundled in assets/ and loaded once at module scope.
const lexendRegular = await readFile(
  join(process.cwd(), "assets/Lexend-Regular.ttf"),
);
const lexendMedium = await readFile(
  join(process.cwd(), "assets/Lexend-Medium.ttf"),
);
const lexendBold = await readFile(
  join(process.cwd(), "assets/Lexend-Bold.ttf"),
);

// Brand palette mirrored from app/globals.css @theme.
const colors = {
  background: "#f8f6f2",
  surface: "#ffffff",
  text: "#101827",
  textMuted: "#5e5b55",
  accent: "#0e7ebd",
  border: "#e0ddd6",
} as const;

// Concentric circle group on the right, centered at (975, 300).
const CIRCLE_X = 975;
const CIRCLE_Y = 300;

function circle(diameter: number, style: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    left: CIRCLE_X - diameter / 2,
    top: CIRCLE_Y - diameter / 2,
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    ...style,
  };
}

const chips = ["Next.js", "React", "TypeScript"];

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        backgroundColor: colors.background,
        fontFamily: "Lexend",
        position: "relative",
      }}
    >
      {/* Left column: name, role, stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 108,
          paddingLeft: 88,
          height: size.height,
        }}
      >
        <div
          style={{
            width: 72,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.accent,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 36,
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.04,
            color: colors.text,
          }}
        >
          <div style={{ display: "flex" }}>Brian</div>
          <div style={{ display: "flex" }}>Hanquet</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.2,
            color: colors.textMuted,
          }}
        >
          Full-Stack Web Developer
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 60,
            gap: 16,
          }}
        >
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: colors.border,
                borderRadius: 999,
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 26,
                paddingRight: 26,
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1,
                color: colors.text,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>

      {/* Right: concentric circles — ring, halo, solid disc with monogram */}
      <div
        style={circle(440, {
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "rgba(14, 126, 189, 0.16)",
        })}
      />
      <div style={circle(380, { backgroundColor: "rgba(14, 126, 189, 0.07)" })} />
      <div
        style={circle(300, {
          backgroundColor: colors.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 130,
          fontWeight: 700,
          letterSpacing: -3,
          lineHeight: 1,
          color: "#ffffff",
        })}
      >
        BH
      </div>

      {/* Footer: domain, bottom-right under the circle */}
      <div
        style={{
          position: "absolute",
          right: 88,
          bottom: 46,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            backgroundColor: colors.accent,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1,
            color: colors.textMuted,
          }}
        >
          brianhanquet.com
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Lexend", data: lexendRegular, weight: 400, style: "normal" },
        { name: "Lexend", data: lexendMedium, weight: 500, style: "normal" },
        { name: "Lexend", data: lexendBold, weight: 700, style: "normal" },
      ],
    },
  );
}

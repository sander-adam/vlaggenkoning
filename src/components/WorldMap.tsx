"use client";

import { memo, useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { numericToAlpha2 } from "@/lib/countryCodeMap";
import type { MapGameStatus } from "@/hooks/useMapGame";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  status: MapGameStatus;
  currentAlpha2: string;
  clickedAlpha2: string | null;
  lastCorrect: boolean | null;
  answeredCorrectly: Set<string>;
  onCountryClick: (alpha2: string) => void;
  onGeographiesLoaded: (codes: Set<string>) => void;
}

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function WorldMapInner({
  status,
  currentAlpha2,
  clickedAlpha2,
  lastCorrect,
  answeredCorrectly,
  onCountryClick,
  onGeographiesLoaded,
}: WorldMapProps) {
  const loadedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [bboxes, setBboxes] = useState<Record<string, BBox>>({});

  // Collect all alpha2 codes that need a flag pattern
  const flagCodes = useMemo(() => {
    const codes = new Set(answeredCorrectly);
    if (status === "feedback" || status === "gameover") {
      codes.add(currentAlpha2);
      if (clickedAlpha2) codes.add(clickedAlpha2);
    }
    return codes;
  }, [answeredCorrectly, status, currentAlpha2, clickedAlpha2]);

  // Measure bounding boxes of flag-filled countries after render
  useEffect(() => {
    if (flagCodes.size === 0) return;
    // Small delay to ensure paths are rendered
    const timer = setTimeout(() => {
      const newBboxes: Record<string, BBox> = { ...bboxes };
      let changed = false;
      for (const code of flagCodes) {
        if (newBboxes[code]) continue;
        const path = document.querySelector(`[data-alpha2="${code}"]`) as SVGPathElement | null;
        if (path) {
          const bb = path.getBBox();
          newBboxes[code] = { x: bb.x, y: bb.y, width: bb.width, height: bb.height };
          changed = true;
        }
      }
      if (changed) setBboxes(newBboxes);
    }, 50);
    return () => clearTimeout(timer);
  }, [flagCodes, bboxes]);

  const getFill = useCallback(
    (alpha2: string) => {
      // Show flag for correctly answered countries and current correct answer
      if (answeredCorrectly.has(alpha2) && bboxes[alpha2]) {
        return `url(#flag-${alpha2})`;
      }
      if ((status === "feedback") && alpha2 === currentAlpha2 && bboxes[alpha2]) {
        return `url(#flag-${alpha2})`;
      }

      // Game over: show correct country in green, wrong click gets its flag
      if (status === "gameover" && alpha2 === currentAlpha2) {
        return "#22c55e";
      }
      if ((status === "gameover" || status === "feedback") && clickedAlpha2 && alpha2 === clickedAlpha2 && !lastCorrect && bboxes[alpha2]) {
        return `url(#flag-${alpha2})`;
      }

      return "#d1d5db";
    },
    [status, currentAlpha2, clickedAlpha2, lastCorrect, answeredCorrectly, bboxes]
  );

  const getStroke = useCallback(
    (alpha2: string) => {
      if (status === "feedback") {
        if (alpha2 === currentAlpha2) return "#15803d";
        if (clickedAlpha2 && alpha2 === clickedAlpha2 && !lastCorrect) return "#c2410c";
      }
      if (status === "gameover") {
        if (alpha2 === currentAlpha2) return "#15803d";
        if (clickedAlpha2 && alpha2 === clickedAlpha2 && !lastCorrect) return "#c2410c";
      }
      if (answeredCorrectly.has(alpha2)) return "#16a34a";
      return "#fff";
    },
    [status, currentAlpha2, clickedAlpha2, lastCorrect, answeredCorrectly]
  );

  const getStrokeWidth = useCallback(
    (alpha2: string) => {
      if (status === "feedback" || status === "gameover") {
        if (alpha2 === currentAlpha2) return 2;
        if (clickedAlpha2 && alpha2 === clickedAlpha2 && !lastCorrect) return 2;
      }
      if (answeredCorrectly.has(alpha2)) return 1;
      return 0.5;
    },
    [status, currentAlpha2, clickedAlpha2, lastCorrect, answeredCorrectly]
  );

  // Track pointer to distinguish clicks from drags
  const pointerDown = useRef<{ x: number; y: number; geoId: string } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, geoId: string) => {
      if (status !== "playing") return;
      pointerDown.current = { x: e.clientX, y: e.clientY, geoId };
    },
    [status]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - pointerDown.current.x;
      const dy = e.clientY - pointerDown.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Only treat as click if barely moved (< 5px)
      if (dist < 5) {
        const alpha2 = numericToAlpha2[pointerDown.current.geoId];
        if (alpha2) onCountryClick(alpha2);
      }
      pointerDown.current = null;
    },
    [onCountryClick]
  );

  const defaultOutline = useMemo(() => ({ outline: "none" }), []);

  return (
    <ComposableMap
      projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
      className="w-full h-full"
    >
      <defs>
        {[...flagCodes].map((code) => {
          const bb = bboxes[code];
          if (!bb) return null;
          return (
            <pattern
              key={code}
              id={`flag-${code}`}
              patternUnits="userSpaceOnUse"
              x={bb.x}
              y={bb.y}
              width={bb.width}
              height={bb.height}
            >
              <image
                href={`/vlaggen/${code}.png`}
                x="0"
                y="0"
                width={bb.width}
                height={bb.height}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          );
        })}
      </defs>
      <ZoomableGroup>
        {/* Invisible background rect so dragging works on ocean areas */}
        <rect x={-500} y={-300} width={1200} height={600} fill="transparent" />
        <Geographies geography={GEO_URL}>
          {({ geographies }) => {
            if (!loadedRef.current) {
              const codes = new Set<string>();
              for (const geo of geographies) {
                const a2 = numericToAlpha2[geo.id];
                if (a2) codes.add(a2);
              }
              setTimeout(() => onGeographiesLoaded(codes), 0);
              loadedRef.current = true;
            }

            return (<g
              onPointerDown={(e) => {
                const target = (e.target as SVGElement).closest("[data-geoid]");
                const geoId = target?.getAttribute("data-geoid");
                if (geoId) handlePointerDown(e, geoId);
              }}
              onPointerUp={handlePointerUp}
            >{geographies.map((geo) => {
              const alpha2 = numericToAlpha2[geo.id] || "";
              const fill = getFill(alpha2);
              const stroke = getStroke(alpha2);
              const strokeWidth = getStrokeWidth(alpha2);
              const isClickable = status === "playing" && !!alpha2;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  data-alpha2={alpha2}
                  data-geoid={geo.id}
                  style={{
                    default: defaultOutline,
                    hover: {
                      fill: isClickable ? "#93c5fd" : fill,
                      stroke: isClickable ? "#3b82f6" : stroke,
                      strokeWidth: String(isClickable ? 1 : strokeWidth),
                      outline: "none",
                      cursor: isClickable ? "pointer" : "default",
                    },
                    pressed: defaultOutline,
                  }}
                />
              );
            })}</g>);
          }}
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}

const WorldMap = memo(WorldMapInner);
export default WorldMap;

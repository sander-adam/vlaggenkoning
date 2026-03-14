"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import type { Stad } from "@/hooks/useCityGame";
import provinces from "@/data/nl-provinces.json";

// Bounding box (lat/lon) with some padding
const MIN_LAT = 50.65;
const MAX_LAT = 53.60;
const MIN_LON = 3.25;
const MAX_LON = 7.30;

const SVG_WIDTH = 360;
const SVG_HEIGHT = 520;
const PAD = 12;

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function project(lat: number, lon: number): { x: number; y: number } {
  const x = PAD + ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * (SVG_WIDTH - 2 * PAD);
  const y = PAD + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (SVG_HEIGHT - 2 * PAD);
  return { x, y };
}

const PROVINCE_COLORS: Record<string, string> = {
  "Groningen": "#dce8d4",
  "Fryslân": "#d4dce8",
  "Drenthe": "#e8dcd4",
  "Overijssel": "#d4e8dc",
  "Flevoland": "#dcd4e8",
  "Gelderland": "#e8e4d4",
  "Utrecht": "#d4e4e8",
  "Noord-Holland": "#e0d4e8",
  "Zuid-Holland": "#d4e8e0",
  "Zeeland": "#e8d4dc",
  "Noord-Brabant": "#e4e8d4",
  "Limburg": "#e8d8d4",
};

const MAX_POP = 921402; // Amsterdam
function cityRadius(inwoners: number): number {
  return 2.5 + 5.5 * Math.sqrt(inwoners / MAX_POP);
}

function ringToPath(ring: number[][]): string {
  return ring
    .map(([lon, lat], i) => {
      const { x, y } = project(lat, lon);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + "Z";
}

interface NetherlandsMapProps {
  steden: Stad[];
  correctCities: string[];
  currentStad: Stad | null;
  clickedWrong: Stad | null;
  selectedCity: Stad | null;
  onClickStad: (stad: Stad) => void;
  disabled: boolean;
}

export default function NetherlandsMap({
  steden,
  correctCities,
  currentStad,
  clickedWrong,
  selectedCity,
  onClickStad,
  disabled,
}: NetherlandsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didDrag = useRef(false);

  // Clamp pan so we don't scroll into emptiness
  const clampPan = useCallback(
    (px: number, py: number, z: number) => {
      const el = containerRef.current;
      if (!el) return { x: px, y: py };
      const rect = el.getBoundingClientRect();
      // The SVG's natural height based on its aspect ratio
      const svgNaturalHeight = rect.width * (SVG_HEIGHT / SVG_WIDTH);
      // Content size = max of natural SVG height and container, scaled by zoom
      const contentHeight = Math.max(svgNaturalHeight, rect.height) * z;
      const contentWidth = rect.width * z;
      const maxPanX = Math.max(0, (contentWidth - rect.width) / 2);
      const maxPanY = Math.max(0, (contentHeight - rect.height) / 2);
      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, px)),
        y: Math.max(-maxPanY, Math.min(maxPanY, py)),
      };
    },
    []
  );

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      setZoom((prev) => {
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
        // Adjust pan so it stays clamped
        setPan((p) => clampPan(p.x, p.y, next));
        return next;
      });
    },
    [clampPan]
  );

  // Pinch zoom (touch)
  const lastTouchDist = useRef<number | null>(null);
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      } else if (e.touches.length === 1) {
        didDrag.current = false;
        setDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / lastTouchDist.current;
        lastTouchDist.current = dist;
        setZoom((prev) => {
          const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale));
          setPan((p) => clampPan(p.x, p.y, next));
          return next;
        });
      } else if (e.touches.length === 1 && dragging) {
        const dx = e.touches[0].clientX - dragStart.current.x;
        const dy = e.touches[0].clientY - dragStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
        setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy, zoom));
      }
    },
    [dragging, zoom, clampPan]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    setDragging(false);
  }, []);

  // Mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      didDrag.current = false;
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan, zoom]
  );

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy, zoom));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, zoom, clampPan]);

  // Reset zoom + pan when a new city comes up
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentStad?.stad]);

  // Keyboard zoom: 1-5 keys set zoom level directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key;
      if (key >= "1" && key <= "5") {
        const level = parseInt(key);
        setZoom(level);
        setPan((p) => clampPan(p.x, p.y, level));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clampPan]);

  const handleCityClick = useCallback(
    (stad: Stad) => {
      // Don't register a click if the user was dragging
      if (didDrag.current) return;
      onClickStad(stad);
    },
    [onClickStad]
  );

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl bg-[#b8d4e8] shadow-inner overflow-hidden touch-none"
      style={{ maxHeight: "70vh" }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Zoom controls */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          {/* Magnifying glass label */}
          <div className="flex items-center gap-1 bg-white/80 rounded-lg shadow px-2 py-1 text-gray-500 text-xs font-bold select-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Zoom
          </div>
          {/* Zoom level buttons 1-5 */}
          <div className="flex flex-col gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setZoom(level);
                  if (level === 1) {
                    setPan({ x: 0, y: 0 });
                  } else {
                    setPan((p) => clampPan(p.x, p.y, level));
                  }
                }}
                className={`w-8 h-7 rounded-md shadow text-xs font-bold
                  active:scale-90 transition-all flex items-center justify-center
                  ${Math.round(zoom) === level
                    ? "bg-blue-500 text-white shadow-blue-500/30"
                    : "bg-white/80 text-gray-500 hover:bg-white"
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {/* Province polygons */}
          {provinces.map((prov) =>
            prov.polygons.map((poly, pi) =>
              poly.map((ring, ri) => (
                <path
                  key={`${prov.name}-${pi}-${ri}`}
                  d={ringToPath(ring)}
                  fill={PROVINCE_COLORS[prov.name] || "#e0dcd4"}
                  stroke="#b0a890"
                  strokeWidth={0.8 / zoom}
                  strokeLinejoin="round"
                />
              ))
            )
          )}

          {/* Province borders */}
          {provinces.map((prov) =>
            prov.polygons.map((poly, pi) =>
              poly.map((ring, ri) => (
                <path
                  key={`border-${prov.name}-${pi}-${ri}`}
                  d={ringToPath(ring)}
                  fill="none"
                  stroke="#c4b89c"
                  strokeWidth={0.5 / zoom}
                  strokeLinejoin="round"
                />
              ))
            )
          )}

          {/* City dots */}
          {steden.map((stad) => {
            const { x, y } = project(stad.lat, stad.lon);
            const isCorrect = correctCities.includes(stad.stad);
            const isWrongClick = clickedWrong?.stad === stad.stad;
            const isSelected = selectedCity?.stad === stad.stad;
            const isHovered = hoveredCity === stad.stad;
            const isClickable = !disabled && !isCorrect;

            const baseR = cityRadius(stad.inwoners);
            let fill = "#64748b";
            let r = baseR / zoom;
            let stroke = "#fff";
            let sw = 1.2 / zoom;

            if (isCorrect) {
              fill = "#16a34a";
              stroke = "#15803d";
              sw = 1.5 / zoom;
              r = (baseR + 0.5) / zoom;
            } else if (isWrongClick) {
              fill = "#ef4444";
              stroke = "#dc2626";
              sw = 2 / zoom;
              r = (baseR + 2) / zoom;
            } else if (isSelected) {
              fill = "#f59e0b";
              stroke = "#d97706";
              sw = 2.5 / zoom;
              r = (baseR + 3) / zoom;
            } else if (isHovered && isClickable) {
              fill = "#3b82f6";
              stroke = "#fff";
              sw = 2 / zoom;
              r = (baseR + 2.5) / zoom;
            }

            return (
              <g
                key={stad.stad}
                onMouseEnter={() => isClickable && setHoveredCity(stad.stad)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={() => isClickable && handleCityClick(stad)}
                style={{ cursor: isClickable ? "pointer" : "default" }}
              >
                {/* Hit area — generous invisible target */}
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(20 / zoom, r + 8 / zoom)}
                  fill="transparent"
                />
                {/* Hover ring */}
                {isHovered && isClickable && (
                  <circle
                    cx={x}
                    cy={y}
                    r={(baseR + 7) / zoom}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5 / zoom}
                    opacity={0.4}
                  />
                )}
                {/* Dot */}
                {isCorrect ? (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    style={{ pointerEvents: "none" }}
                  />
                ) : isWrongClick ? (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ pointerEvents: "none" }}
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    className={disabled ? "opacity-40" : ""}
                    style={{ pointerEvents: "none", transition: "r 0.15s, fill 0.15s, stroke-width 0.15s" }}
                  />
                )}

                {/* Label correct */}
                {isCorrect && (
                  <motion.text
                    x={x}
                    y={y - 9 / zoom}
                    textAnchor="middle"
                    className="fill-green-900 pointer-events-none select-none"
                    style={{ fontSize: `${6.5 / zoom}px`, fontWeight: 700 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {stad.stad}
                  </motion.text>
                )}

                {/* Label wrong */}
                {isWrongClick && (
                  <motion.text
                    x={x}
                    y={y - 10 / zoom}
                    textAnchor="middle"
                    className="fill-red-600 pointer-events-none select-none"
                    style={{ fontSize: `${7 / zoom}px`, fontWeight: 700 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {stad.stad}
                  </motion.text>
                )}

                {/* Selected ring */}
                {isSelected && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={(baseR + 8) / zoom}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={1.5 / zoom}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ pointerEvents: "none" }}
                  />
                )}

              </g>
            );
          })}

          {/* Highlight correct location on wrong guess */}
          {clickedWrong && currentStad && (() => {
            const { x, y } = project(currentStad.lat, currentStad.lon);
            return (
              <g>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={14 / zoom}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={2.5 / zoom}
                  strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                />
                <motion.text
                  x={x}
                  y={y - 18 / zoom}
                  textAnchor="middle"
                  className="fill-orange-600 pointer-events-none select-none"
                  style={{ fontSize: `${9 / zoom}px`, fontWeight: 800 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentStad.stad}
                </motion.text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

import { projectRounded } from "./projection";

/**
 * The outline of Bangladesh — PLACEHOLDER GEOMETRY.
 *
 * ⚠️ These vertices are hand-entered and approximate. The shape reads as the
 * country at a glance, but no coastline detail is correct and the Sundarbans
 * and the Meghna estuary are heavily simplified. It must be replaced with
 * real boundary data before launch (a simplified GADM or Natural Earth
 * outline, decimated to a few hundred points).
 *
 * Replacing it is deliberately cheap: pins are placed from latitude and
 * longitude through the shared projection, so a new outline moves nothing
 * except the outline. See src/lib/map/projection.ts.
 *
 * Stored as [longitude, latitude], traced clockwise from the north-west.
 */
export const OUTLINE: ReadonlyArray<readonly [number, number]> = [
  // Northern border, west to east — the Panchagarh spur, then Rangpur.
  [88.2, 26.55],
  [88.45, 26.63],
  [88.6, 26.45],
  [88.75, 26.3],
  [88.95, 26.25],
  [89.05, 26.05],
  [89.25, 26.1],
  [89.6, 26.2],
  [89.75, 26.0],
  [89.85, 25.95],
  [90.0, 25.95],
  [90.3, 26.05],
  [90.6, 26.1],
  [91.0, 26.05],
  [91.3, 26.1],
  [91.6, 26.05],
  [92.0, 25.95],
  // The Sylhet salient.
  [92.2, 25.75],
  [92.35, 25.55],
  [92.15, 25.3],
  [92.05, 25.15],
  [92.35, 25.05],
  [92.5, 24.9],
  [92.35, 24.7],
  [92.2, 24.55],
  [92.15, 24.35],
  // Eastern border down the Chittagong Hill Tracts.
  [92.3, 24.1],
  [92.2, 23.85],
  [92.3, 23.7],
  [92.15, 23.5],
  [92.05, 23.3],
  [92.3, 23.1],
  [92.6, 22.6],
  [92.65, 22.15],
  [92.55, 21.95],
  [92.35, 21.6],
  [92.3, 21.3],
  // Teknaf, the southern tip.
  [92.3, 20.85],
  [92.15, 21.05],
  [92.0, 21.3],
  [91.9, 21.6],
  [91.85, 21.9],
  // The coast west, across the Meghna estuary.
  [91.6, 22.3],
  [91.4, 22.45],
  [91.15, 22.4],
  [91.0, 22.5],
  [90.7, 22.3],
  [90.5, 21.9],
  [90.3, 21.8],
  [90.1, 22.0],
  [89.9, 21.9],
  [89.7, 21.7],
  [89.5, 21.65],
  [89.2, 21.75],
  [89.05, 21.9],
  [88.95, 22.1],
  [88.85, 22.3],
  // Western border, south to north.
  [89.05, 22.6],
  [88.9, 22.8],
  [88.75, 23.1],
  [88.6, 23.3],
  [88.65, 23.45],
  [88.55, 23.72],
  [88.35, 24.0],
  [88.15, 24.3],
  [88.02, 24.55],
  [87.98, 24.78],
  [88.05, 24.95],
  [88.35, 25.05],
  [88.2, 25.2],
  [88.05, 25.35],
  [88.3, 25.6],
  [88.45, 25.9],
  [88.25, 26.1],
  [88.35, 26.3],
];

/** The outline as an SVG path, projected once at module load. */
export const OUTLINE_PATH: string =
  OUTLINE.map(([lng, lat], index) => {
    const { x, y } = projectRounded(lng, lat);
    return `${index === 0 ? "M" : "L"}${x} ${y}`;
  }).join(" ") + " Z";

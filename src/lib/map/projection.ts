/**
 * Projects latitude/longitude onto the map's viewBox.
 *
 * One projection, used by both the outline generator (scripts/build-map.mjs)
 * and the pin renderer, so a pin lands where the coastline says it should.
 * That is the whole reason content stores real coordinates rather than
 * viewBox units: the outline is a placeholder and will be replaced, and when
 * it is, nothing about the content has to move.
 *
 * Equirectangular with a cos(φ) correction at the country's mid-latitude.
 * Bangladesh spans about six degrees of latitude, so the shape error against
 * a proper conic projection is under a pixel at this size — and unlike a
 * conic it is two lines of arithmetic that both the script and the browser
 * can agree on exactly.
 */

/** Geographic bounds of Bangladesh, with a small margin. */
export const BOUNDS = {
  west: 87.9,
  east: 92.8,
  south: 20.5,
  north: 26.8,
} as const;

export const VIEWBOX = { width: 620, height: 800 } as const;

const MID_LATITUDE = (BOUNDS.north + BOUNDS.south) / 2;
const SCALE_X = Math.cos((MID_LATITUDE * Math.PI) / 180);

const spanX = (BOUNDS.east - BOUNDS.west) * SCALE_X;
const spanY = BOUNDS.north - BOUNDS.south;

export type Point = { x: number; y: number };

export function project(lng: number, lat: number): Point {
  return {
    x: ((lng - BOUNDS.west) * SCALE_X * VIEWBOX.width) / spanX,
    y: ((BOUNDS.north - lat) * VIEWBOX.height) / spanY,
  };
}

/** Rounded to a tenth of a unit — enough precision, much smaller markup. */
export function projectRounded(lng: number, lat: number): Point {
  const { x, y } = project(lng, lat);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

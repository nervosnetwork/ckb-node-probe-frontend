import * as polygonClipping from 'polygon-clipping';

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];

const WORLD_BOUNDS: Polygon = [[
  [-180, -90],
  [180, -90],
  [180, 90],
  [-180, 90],
  [-180, -90],
]];

function crossesDateLine(ring: Ring): boolean {
  return ring.some(
    (point, index) =>
      index > 0 &&
      Math.abs(point[0] - ring[index - 1][0]) > 180
  );
}

function unwrapRing(ring: Ring): Ring {
  if (!ring.length) return [];

  const result: Ring = [[...ring[0]]];

  for (let i = 1; i < ring.length; i++) {
    const [longitude, latitude] = ring[i];
    let lon = longitude;
    const previous = result[result.length - 1][0];

    while (lon - previous > 180) lon -= 360;
    while (lon - previous < -180) lon += 360;

    result.push([lon, latitude]);
  }

  return result;
}

function splitPolygon(polygon: Polygon): Polygon[] {
  if (!polygon.some(crossesDateLine)) {
    return [polygon];
  }

  // Unwrap all rings before clipping.
  const unwrapped = polygon.map(unwrapRing);
  const pieces: Polygon[] = [];

  for (const offset of [-360, 0, 360]) {
    const shifted = unwrapped.map(ring =>
      ring.map(([lon, lat]): Point => [lon + offset, lat])
    );

    const clipped = polygonClipping.intersection(
      shifted,
      WORLD_BOUNDS
    );

    for (const result of clipped) {
      pieces.push(result as Polygon);
    }
  }

  return pieces;
}

export function fixAntimeridian(geojson: any): any {
  return {
    ...geojson,
    features: geojson.features.map((country: any) => {
      const geometry = country.geometry;

      if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) {
        return country;
      }

      const polygons: Polygon[] =
        geometry.type === 'Polygon'
          ? [geometry.coordinates]
          : geometry.coordinates;

      const corrected = polygons.flatMap(splitPolygon);

      return {
        ...country,
        geometry: {
          type: 'MultiPolygon',
          coordinates: corrected,
        },
      };
    }),
  };
}

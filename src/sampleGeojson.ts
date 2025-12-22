export interface SimpleFeature {
  type: 'Feature'
  properties: {
    GEOID: string
    name: string
    layer: 'county' | 'city'
  }
  geometry: {
    type: 'Polygon'
    coordinates: [number, number][]
  }
}

export const countyFeatures: SimpleFeature[] = [
  {
    type: 'Feature',
    properties: { GEOID: '08001', name: 'Adams County, CO', layer: 'county' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [250, 260],
        [320, 260],
        [320, 330],
        [250, 330],
      ],
    },
  },
  {
    type: 'Feature',
    properties: { GEOID: '06001', name: 'Alameda County, CA', layer: 'county' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [90, 300],
        [170, 300],
        [170, 370],
        [90, 370],
      ],
    },
  },
  {
    type: 'Feature',
    properties: { GEOID: '04013', name: 'Maricopa County, AZ', layer: 'county' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [190, 340],
        [250, 340],
        [250, 410],
        [190, 410],
      ],
    },
  },
  {
    type: 'Feature',
    properties: { GEOID: '12086', name: 'Miami-Dade County, FL', layer: 'county' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [520, 430],
        [600, 430],
        [600, 510],
        [520, 510],
      ],
    },
  },
]

export const cityFeatures: SimpleFeature[] = [
  {
    type: 'Feature',
    properties: { GEOID: '3901000', name: 'Akron, OH', layer: 'city' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [470, 290],
        [510, 290],
        [510, 330],
        [470, 330],
      ],
    },
  },
  {
    type: 'Feature',
    properties: { GEOID: '3502000', name: 'Albuquerque, NM', layer: 'city' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [260, 380],
        [320, 380],
        [320, 430],
        [260, 430],
      ],
    },
  },
  {
    type: 'Feature',
    properties: { GEOID: '0606000', name: 'Anaheim, CA', layer: 'city' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [120, 360],
        [170, 360],
        [170, 410],
        [120, 410],
      ],
    },
  },
]

// Aceternity World Map's diagonal grid, precomputed to keep country data out of the browser.
import { writeFileSync } from 'node:fs'
import DottedMap from 'dotted-map'

const map = new DottedMap({ height: 100, grid: 'diagonal' })
const svg = map.getSVG({ radius: 0.22, color: '#00000040', shape: 'circle', backgroundColor: 'transparent' })
writeFileSync(new URL('../src/assets/world-map.svg', import.meta.url), svg)

// Representative market connections, not office locations or shipping routes.
const locations = [
  { lat: 22.5431, lng: 114.0579 }, // Shenzhen
  { lat: 34.0522, lng: -118.2437 }, // Western North America
  { lat: 40.7128, lng: -74.006 }, // Eastern North America
  { lat: 51.5074, lng: -0.1278 }, // Western Europe
  { lat: 50.1109, lng: 8.6821 }, // Central Europe
]
const points = locations.map(location => {
  const { x, y } = map.getPin(location)
  // Use the base map's projection so nodes stay aligned with the land dots.
  return { x: x / map.image.width * 800, y: y / map.image.height * 400 }
})
writeFileSync(new URL('../src/data/worldMap.json', import.meta.url), JSON.stringify(points, null, 2) + '\n')

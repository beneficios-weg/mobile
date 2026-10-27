export type MapPosition = { latitude: number; longitude: number }
export type MapPlace = MapPosition & { id: string; name: string; category: string }
export type MapViewport = { center: MapPosition; zoom: number }

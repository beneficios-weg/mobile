/** Temporary preview origin in Joinville; real GPS is opt-in until review is complete. */
export const useDemoDirectionsLocation = import.meta.env?.VITE_DIRECTIONS_REAL_LOCATION !== 'true'
export const demoDirectionsLocation = { latitude: -26.292, longitude: -48.864 }

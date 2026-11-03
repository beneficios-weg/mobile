import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

export type Coordinates = {
  latitude: number
  longitude: number
  accuracy?: number
}

/** Obtém a localização atual pelo plugin Capacitor ou pela API do navegador. */
export async function getCurrentLocation(): Promise<Coordinates> {
  if (Capacitor.isNativePlatform()) {
    let permission = await Geolocation.checkPermissions()

    if (permission.location !== 'granted') {
      permission = await Geolocation.requestPermissions({ permissions: ['location'] })
    }

    if (permission.location !== 'granted') {
      throw new Error('Permissão de localização não concedida.')
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 5_000,
    })

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Este dispositivo não oferece suporte à localização.')
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (error) => reject(new Error(error.code === 1
        ? 'Permita o acesso à localização nas configurações do navegador para calcular sua rota.'
        : error.code === 3 ? 'A localização demorou para responder. Tente novamente em um local com sinal.'
        : 'Não foi possível obter sua localização. Verifique o GPS e tente novamente.')),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 },
    )
  })
}

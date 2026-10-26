/** Modelo visual dos cards/pins da prévia, distinto do benefício de domínio. */
export type BenefitLocation = {
  id: string
  name: string
  category: string
  description: string
  latitude: number
  longitude: number
  locationLabel?: string
  offerLabel?: string
}

/** Benefícios fictícios para o protótipo. Troque esta lista pela resposta da API real. */
export const demoBenefits: BenefitLocation[] = [
  {
    id: 'benefit-cafe',
    name: 'Café do Centro',
    category: 'Alimentação',
    description: 'Desconto de 15% para colaboradores.',
    latitude: -26.4855,
    longitude: -49.0712,
    locationLabel: 'Centro',
    offerLabel: '15% OFF',
  },
  {
    id: 'benefit-fitness',
    name: 'Academia Move',
    category: 'Saúde e bem-estar',
    description: 'Condição especial no plano mensal.',
    latitude: -26.4797,
    longitude: -49.085,
    locationLabel: 'Vila Nova',
    offerLabel: '20% OFF',
  },
]

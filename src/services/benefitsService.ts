export type Benefit = {
  id: string
  name: string
  category: string
  description: string
  latitude: number
  longitude: number
}

/** Benefícios fictícios para o protótipo. Troque esta lista pela resposta da API real. */
export const demoBenefits: Benefit[] = [
  {
    id: 'benefit-cafe',
    name: 'Café do Centro',
    category: 'Alimentação',
    description: 'Desconto de 15% para colaboradores.',
    latitude: -26.4855,
    longitude: -49.0712,
  },
  {
    id: 'benefit-fitness',
    name: 'Academia Bem-Estar',
    category: 'Saúde e bem-estar',
    description: 'Condição especial no plano mensal.',
    latitude: -26.4797,
    longitude: -49.085,
  },
]

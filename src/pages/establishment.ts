/** Dados de apresentação do protótipo; não representam um contrato da API. */
export type EstablishmentDetails = {
  id: string
  name: string
  neighborhood: string
  address: string
  openingStatus: string
  openingHours: string
  contact: string
  facadeImageUrl?: string
  latitude: number | null
  longitude: number | null
  mappable?: boolean
  discounts: { value: string; description: string }[]
  audience: string
  participation: string[]
  description: string
  services: string[]
}

export const previewEstablishment: EstablishmentDetails = {
  id: 'academia-move',
  name: 'Academia Move',
  neighborhood: 'Centro',
  address: 'Rua das Palmeiras, 120',
  openingStatus: 'Aberto hoje',
  openingHours: '06:00–22:00',
  contact: '47 99914-1233',
  latitude: -26.483,
  longitude: -49.078,
  discounts: [
    { value: 'Até 50%', description: 'em produtos selecionados' },
    { value: '5%', description: 'no pagamento realizado via PIX' },
    { value: 'Frete grátis', description: 'nas compras acima de R$199,00 para regiões Sul e Sudeste' },
  ],
  audience: 'Colaboradores WEG e parentes até 2º grau',
  participation: [
    'Apresente seu crachá, folha de pagamento ou carteira de trabalho.',
    'Informe o vínculo com a WEG no atendimento.',
    'Solicite a aplicação do benefício antes do pagamento.',
  ],
  description: 'Academia completa para saúde e condicionamento, com musculação, funcional, aulas coletivas e acompanhamento profissional especializado. A unidade oferece avaliação física, orientação individual durante os treinos e programas para diferentes objetivos. Consulte a equipe para conhecer os horários das aulas e as condições disponíveis para colaboradores WEG.',
  services: ['Musculação', 'Treinamento funcional', 'Aulas coletivas', 'Avaliação física', 'Acompanhamento profissional'],
}

export const SECTOR_LABELS: Record<string, string> = {
  Agriculture: 'Agricultura',
  Construction: 'Construcción',
  Design: 'Diseño',
  Education: 'Educación',
  Energy: 'Energía',
  Entertainment: 'Entretenimiento',
  Healthcare: 'Salud',
  Hospitality: 'Hotelería',
  Retail: 'Comercio',
  Technology: 'Tecnología',
  Telecommunications: 'Telecomunicaciones',
  Transportation: 'Transporte',
};

export const getSectorLabel = (sector: string | null | undefined): string | null =>
  sector ? (SECTOR_LABELS[sector] ?? sector) : null;
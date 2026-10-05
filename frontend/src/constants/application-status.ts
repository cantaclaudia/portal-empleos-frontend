export const APPLICATION_STATUS = {
  REJECTED: 0,
  ACCEPTED: 1,
  IN_REVIEW: 2,
  RECEIVED: 3,
} as const;

export type ApplicationStatusCode =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const isApplicationStatusCode = (
  value: unknown
): value is ApplicationStatusCode =>
  typeof value === 'number' &&
  Object.values(APPLICATION_STATUS).includes(value as ApplicationStatusCode);

export const STATUS_LABEL: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'Rechazada',
  [APPLICATION_STATUS.ACCEPTED]: 'Aceptada',
  [APPLICATION_STATUS.IN_REVIEW]: 'En revisión',
  [APPLICATION_STATUS.RECEIVED]: 'Recibida',
};

export const STATUS_TEXT_COLOR: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'text-[#b45309]',
  [APPLICATION_STATUS.ACCEPTED]: 'text-[#17835a]',
  [APPLICATION_STATUS.IN_REVIEW]: 'text-[#3b4a86]',
  [APPLICATION_STATUS.RECEIVED]: 'text-[#6b21a8]', // Violeta para distinguir el estado inicial "Recibida"
};

export const STATUS_ACTIVE_BG: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'bg-[#b45309]',
  [APPLICATION_STATUS.ACCEPTED]: 'bg-[#17835a]',
  [APPLICATION_STATUS.IN_REVIEW]: 'bg-[#3b4a86]',
  [APPLICATION_STATUS.RECEIVED]: 'bg-[#6b21a8]',
};

export const RECRUITER_DECISIONS: { code: ApplicationStatusCode; label: string }[] = [
  { code: APPLICATION_STATUS.REJECTED, label: 'Rechazar' },
  { code: APPLICATION_STATUS.IN_REVIEW, label: 'En revisión' },
  { code: APPLICATION_STATUS.ACCEPTED, label: 'Aceptar' },
];
export const APPLICATION_STATUS = {
  REJECTED: 0,
  ACCEPTED: 1,
  IN_REVIEW: 2,
  RECEIVED: 3,
} as const;

export type ApplicationStatusCode =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const isApplicationStatus = (v: unknown): v is ApplicationStatusCode =>
  v === APPLICATION_STATUS.REJECTED ||
  v === APPLICATION_STATUS.ACCEPTED ||
  v === APPLICATION_STATUS.IN_REVIEW ||
  v === APPLICATION_STATUS.RECEIVED;

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatusCode, string> = {
  [APPLICATION_STATUS.REJECTED]: 'Rechazada',
  [APPLICATION_STATUS.ACCEPTED]: 'Aceptada',
  [APPLICATION_STATUS.IN_REVIEW]: 'En revisión',
  [APPLICATION_STATUS.RECEIVED]: 'Recibida',
};
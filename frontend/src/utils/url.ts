import validator from 'validator';

/** "www.linkedin.com/in/ana" -> "https://www.linkedin.com/in/ana" */
export const normalizeUrl = (value: string): string => {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

/** Acepta http, https o sin protocolo. Valida el largo sobre la URL ya normalizada. */
export const isValidWebUrl = (value: string, maxLength = 100): boolean => {
  const url = normalizeUrl(value);
  return (
    url.length > 0 &&
    url.length <= maxLength &&
    validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })
  );
};
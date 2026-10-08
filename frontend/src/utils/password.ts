export const PASSWORD_MAX_LENGTH = 30;

// Caracteres que el backend no admite (símbolos especiales y la ñ)
const FORBIDDEN_CHARS = /[!"#$%/()=?¡¨*[\];:_¿´+{},.\-><°|¬\\~`^Ññ\r\n]/g;

/** Limpia lo que escribe el usuario: saca símbolos no permitidos y corta a 30. */
export const sanitizePassword = (value: string): string =>
  value.replace(FORBIDDEN_CHARS, '').slice(0, PASSWORD_MAX_LENGTH);
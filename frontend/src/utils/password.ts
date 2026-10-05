import JSEncrypt from 'jsencrypt';

export const PASSWORD_MAX_LENGTH = 30;

// Caracteres que el backend no admite.
// La ñ y la Ñ están permitidas.
const FORBIDDEN_CHARS = /[!"#$%/()=?¡¨*[\];:_¿´+{},.\-><°|¬\\~`^ \r\n]/g;

/** Limpia lo que escribe el usuario: saca símbolos no permitidos y corta a 30. */
export const sanitizePassword = (value: string): string =>
  value.replace(FORBIDDEN_CHARS, '').slice(0, PASSWORD_MAX_LENGTH);

/** Cifra con la clave pública RSA. Nunca devuelve texto plano. */
export const encryptPassword = (password: string): string => {
  const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY as string | undefined;

  if (!publicKey) {
    throw new Error(
      'Falta configurar la clave de cifrado (VITE_RSA_PUBLIC_KEY).'
    );
  }

  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);

  const encrypted = encryptor.encrypt(password);

  if (!encrypted) {
    throw new Error(
      'No se pudo proteger la contraseña. Intentá nuevamente.'
    );
  }

  return encrypted;
};
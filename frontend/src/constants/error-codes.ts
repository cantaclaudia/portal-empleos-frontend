export const ERROR_CODES = {
  SUCCESS: '0200',
  BAD_REQUEST: '0400',
  NOT_FOUND: '0404',
  USER_ALREADY_REGISTERED: '0410',
  INCORRECT_DATA_LENGTH: '0411',
  INTERNAL_ERROR: '0500',
  CONNECTION_ERROR: '0600', 
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const COMMON_ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'Solicitud incorrecta. Verificá los datos ingresados',
  [ERROR_CODES.INTERNAL_ERROR]: 'Error interno del servidor. Intentá nuevamente más tarde',
  CONNECTION_ERROR: 'Error de conexión. Verificá tu conexión a internet',
  DEFAULT: 'Ha ocurrido un error. Intentá nuevamente',
} as const;

export const LOGIN_ERRORS = {
  EMAIL_REQUIRED: 'El correo electrónico es obligatorio',
  PASSWORD_REQUIRED: 'La contraseña es obligatoria',
  EMAIL_TOO_LONG: 'El correo no puede exceder 50 caracteres',
  PASSWORD_TOO_LONG: 'La contraseña no puede exceder 30 caracteres',
  INVALID_USER_TYPE: 'Tipo de usuario no válido',
  LOGIN_FAILED: 'Error al iniciar sesión',
   EMAIL_INVALID: 'Ingresá un correo electrónico válido',
};

export const ENDPOINT_ERROR_MESSAGES = {
  LOGIN: {
    [ERROR_CODES.SUCCESS]: 'Inicio de sesión exitoso',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.NOT_FOUND]: 'Usuario o contraseña incorrectos',
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
  REGISTER_CANDIDATE: {
    [ERROR_CODES.SUCCESS]: 'Registro exitoso',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.USER_ALREADY_REGISTERED]: 'El usuario ya está registrado',
    [ERROR_CODES.INCORRECT_DATA_LENGTH]: 'Longitud de datos incorrecta',
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
  REGISTER_EMPLOYER: {
    [ERROR_CODES.SUCCESS]: 'Registro exitoso',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.NOT_FOUND]: 'Empresa no encontrada',
    [ERROR_CODES.USER_ALREADY_REGISTERED]: 'El usuario ya está registrado',
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
  GET_COMPANIES: {
    [ERROR_CODES.SUCCESS]: 'Empresas obtenidas correctamente',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
  GET_SKILLS: {
    [ERROR_CODES.SUCCESS]: 'Habilidades obtenidas correctamente',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
  GET_AVAILABLE_JOBS: {
    [ERROR_CODES.SUCCESS]: 'Trabajos obtenidos correctamente',
    [ERROR_CODES.BAD_REQUEST]: COMMON_ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
    [ERROR_CODES.INTERNAL_ERROR]: COMMON_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
  },
} as const;

export type EndpointErrorMap = keyof typeof ENDPOINT_ERROR_MESSAGES;

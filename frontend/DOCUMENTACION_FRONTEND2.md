# Documentación Técnica - Frontend Portal de Empleos

## Pantalla de Login

### 1. Descripción General

La pantalla de Login (`src/pages/Login.tsx`) es el punto de entrada principal de la aplicación. Su propósito es autenticar usuarios (candidatos y empresas) mediante credenciales de correo electrónico y contraseña.

**Flujo esperado:**
1. Usuario ingresa su correo electrónico y contraseña
2. Se validan los campos en tiempo real (longitud máxima)
3. Al enviar el formulario, se realiza una petición al backend
4. Si la autenticación es exitosa, el usuario es redirigido según su rol:
   - `candidate` → `/home-candidato`
   - `employer` → `/home-empresa`
5. Si hay error, se muestra un mensaje descriptivo

---

### 2. Tecnologías Utilizadas

- **React 18.3.1**: Librería principal para la UI
- **TypeScript 5.5.3**: Tipado estático
- **React Router DOM 7.10.1**: Manejo de navegación y rutas
- **Lucide React 0.344.0**: Librería de iconos (Eye/EyeOff para toggle de contraseña)
- **Tailwind CSS 3.4.1**: Framework de estilos utility-first
- **Vite 5.4.2**: Bundler y herramienta de desarrollo
- **Fetch API**: Cliente HTTP nativo para peticiones al backend

---

### 3. Estructura del Componente

#### Estados del Componente

```typescript
const [email, setEmail] = useState<string>('');           // Valor del campo email
const [password, setPassword] = useState<string>('');     // Valor del campo contraseña
const [loading, setLoading] = useState<boolean>(false);   // Estado de carga durante login
const [error, setError] = useState<string | null>(null);  // Error general del formulario
const [emailError, setEmailError] = useState<string>(''); // Error específico del email
const [passwordError, setPasswordError] = useState<string>(''); // Error específico de contraseña
```

#### Handlers Principales

**`validateEmail(value: string): boolean`**
- Valida que el email no exceda 50 caracteres
- Limpia el error previo antes de validar
- Retorna `true` si es válido, `false` si no

**`validatePassword(value: string): boolean`**
- Valida que la contraseña no exceda 30 caracteres
- Limpia el error previo antes de validar
- Retorna `true` si es válido, `false` si no

**`handleEmailChange(e: React.ChangeEvent<HTMLInputElement>): void`**
- Actualiza el estado `email`
- Ejecuta validación en tiempo real

**`handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void`**
- Actualiza el estado `password`
- Ejecuta validación en tiempo real

**`handleLogin(e: React.FormEvent): Promise<void>`**
- Previene el comportamiento por defecto del formulario
- Valida ambos campos antes de enviar
- Establece estado de carga (`loading`)
- Llama al servicio `AuthService.login()`
- Si es exitoso:
  - Guarda datos del usuario en localStorage
  - Navega según el rol del usuario
- Si falla:
  - Captura el error y lo muestra
- Siempre finaliza limpiando el estado de carga

#### Layout del Componente

La pantalla está dividida en dos columnas (layout split-screen):

**Columna Izquierda (Aside):**
- Fondo color `#05073c` (azul oscuro)
- Contiene el branding: "Portal de Empleos" / "Instituto Madero"
- Responsive: ocupa 100% en mobile, 50% en desktop

**Columna Derecha (Main):**
- Fondo color `#f2f2f2` (gris claro)
- Contiene el formulario de login centrado
- Ancho máximo de 500px para los elementos del formulario
- Responsive: ocupa 100% en mobile, 50% en desktop

---

### 4. Validaciones Implementadas

#### Validaciones del Cliente (Frontend)

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| Email | Máximo 50 caracteres | "El correo no puede exceder 50 caracteres" |
| Email | Campo requerido (HTML5) | Mensaje nativo del navegador |
| Email | Formato de email (HTML5) | Mensaje nativo del navegador |
| Contraseña | Máximo 30 caracteres | "La contraseña no puede exceder 30 caracteres" |
| Contraseña | Campo requerido (HTML5) | Mensaje nativo del navegador |

#### Validaciones Adicionales

- El botón de "Ingresar" se deshabilita si:
  - Hay errores de validación activos (`emailError` o `passwordError`)
  - La petición está en curso (`loading === true`)

---

### 5. Interacciones con APIs y Servicios

#### AuthService

**Archivo:** `src/services/auth.service.ts`

**Métodos utilizados:**

**`login(email: string, password: string): Promise<LoginResponse>`**
- Valida longitud de campos (redundante con validación frontend)
- Construye payload `LoginRequest`: `{ email, password }`
- Usa `apiService.post()` para enviar al endpoint `/login`
- Maneja códigos de respuesta:
  - `0200`: Login exitoso, retorna `LoginResponse`
  - `0404`: Usuario o contraseña incorrectos
  - `0400`: Solicitud incorrecta
  - `0500`: Error del servidor
  - Otros: Mensaje genérico de error
- Si hay error de conexión, lanza: "Error de conexión. Verifica tu conexión a internet"

**`saveUser(userData: UserData): void`**
- Guarda los datos del usuario en localStorage
- Key: `'portal_empleos_user'`
- Valor: JSON stringificado del objeto `UserData`

#### ApiService

**Archivo:** `src/services/api.service.ts`

**Funcionalidad:**

**Gestión de Tokens:**
- `getToken()`: Obtiene token de acceso
  - Si existe token válido en memoria, lo reutiliza
  - Si hay token estático en `.env` (`VITE_API_TOKEN`), lo usa
  - Si no, solicita token al endpoint `/getToken` usando Basic Auth
  - Cachea el token y su fecha de expiración

**Peticiones HTTP:**
- `post<T>(endpoint, body)`: Realiza peticiones POST
  - Obtiene token antes de cada request
  - Envía token en header `x-access-token`
  - Content-Type: `application/json`

#### Configuración de API

**Archivo:** `src/config/api.config.ts`

```typescript
API_CONFIG = {
  BASE_URL: VITE_API_BASE_URL || 'https://IP-TEST:PUERTO-TEST/portalEmpleos',
  TOKEN: VITE_API_TOKEN || '',
  ENDPOINTS: {
    GET_TOKEN: '/getToken',
    LOGIN: '/login',
  },
  AUTH_CREDENTIALS: {
    USERNAME: VITE_API_USERNAME || '',
    PASSWORD: VITE_API_PASSWORD || '',
  }
}
```

**Variables de entorno requeridas:**
- `VITE_API_BASE_URL`: URL base de la API
- `VITE_API_TOKEN`: Token estático (opcional)
- `VITE_API_USERNAME`: Usuario para Basic Auth
- `VITE_API_PASSWORD`: Contraseña para Basic Auth

---

### 6. Componentes Reutilizables

La pantalla de Login utiliza los siguientes componentes UI personalizados:

#### Button (`src/components/ui/button.tsx`)
- Wrapper sobre `<button>` HTML
- Acepta todas las props nativas de `HTMLButtonElement`
- Prop `variant`: 'primary' | 'secondary' (no utilizado en Login)
- Permite clases personalizadas vía prop `className`

**Uso en Login:**
```typescript
<Button
  type="submit"
  disabled={loading || !!emailError || !!passwordError}
  className="h-12 md:h-[56px] w-full max-w-[500px] ... bg-[#f46036]"
>
  {loading ? 'Ingresando...' : 'Ingresar'}
</Button>
```

#### FormField (`src/components/ui/form-fields.tsx`)
- Campo de formulario con label y manejo de errores
- Incluye funcionalidad de toggle para mostrar/ocultar contraseña
- Props:
  - `label`: Texto del label
  - `error`: Mensaje de error a mostrar
  - `showPasswordToggle`: Habilita icono de ojo para contraseñas
  - Todas las props de `<input>` HTML

**Características:**
- Estado interno para controlar visibilidad de contraseña
- Iconos: Eye (mostrar) / EyeOff (ocultar) de Lucide React
- Estilos: fuente Nunito, borde focus en color `#f46036`

**Uso en Login:**
```typescript
<FormField
  label="Correo electrónico"
  type="email"
  placeholder="Ingresa tu correo electrónico"
  required
  value={email}
  onChange={handleEmailChange}
  error={emailError}
  maxLength={51}
/>

<FormField
  label="Contraseña"
  type="password"
  showPasswordToggle
  // ... otras props
/>
```

#### PageHeader (`src/components/ui/page-header.tsx`)
- Componente para título y subtítulo de página
- Props:
  - `title`: Título principal
  - `subtitle`: Texto descriptivo
- Alineación: izquierda (alineado con campos del formulario)
- Fuente: Nunito

**Uso en Login:**
```typescript
<PageHeader
  title="Iniciar sesión"
  subtitle="Conectá con oportunidades y talento."
/>
```

#### ErrorMessage (`src/components/ui/error-message.tsx`)
- Componente para mostrar mensajes de error generales
- Fondo rojo claro (`bg-red-50`)
- Borde rojo (`border-red-200`)
- Texto rojo (`text-red-700`)
- Fuente: Nunito

**Uso en Login:**
```typescript
{error && <ErrorMessage message={error} />}
```

#### Separator (`src/components/ui/separator.tsx`)
- Línea divisoria horizontal
- Color: `#e5e5e5`
- Acepta prop `className` para personalización

**Uso en Login:**
```typescript
<Separator className="h-px w-full" />
```

#### LinkButton (`src/components/ui/link-button.tsx`)
- Botón con apariencia de enlace
- Color: `#0088ff` (azul)
- Hover: subraya el texto
- Props:
  - `children`: Contenido del botón
  - `onClick`: Handler opcional

**Uso en Login:**
```typescript
<LinkButton>
  ¿Olvidaste tu contraseña?
</LinkButton>
```

---

### 7. Navegación

#### Rutas de Destino

**Desde Login se puede navegar a:**

1. **`/home-candidato`**
   - Condición: `response.data.role === 'candidate'`
   - Trigger: Login exitoso de un candidato

2. **`/home-empresa`**
   - Condición: `response.data.role === 'employer'`
   - Trigger: Login exitoso de una empresa

3. **`/seleccion-de-perfil`**
   - Trigger: Click en "Creá tu cuenta como Candidato o Empresa"
   - Ubicación: Enlace al final del formulario

#### Hook de Navegación

```typescript
const navigate = useNavigate(); // React Router DOM v7
```

---

### 8. Decisiones Técnicas

#### Arquitectura y Organización

**Separación de Responsabilidades:**
- **Componente Login**: Solo maneja UI y estado local
- **AuthService**: Lógica de autenticación y manejo de usuario
- **ApiService**: Comunicación HTTP y gestión de tokens
- **Componentes UI**: Reutilizables, sin lógica de negocio

**Gestión de Estado:**
- Estado local con `useState` (suficiente para esta pantalla)
- No se usa Context API ni librerías de estado global
- Persistencia en localStorage para datos del usuario

#### Validaciones

**Por qué validación en dos lugares:**
- Frontend: UX inmediata, feedback instantáneo
- Backend (en AuthService): Defensa adicional, validación canónica

**Límites de caracteres:**
- Email: 50 caracteres (definido por requisitos del backend)
- Contraseña: 30 caracteres (definido por requisitos del backend)

#### Tipado

**Interfaces TypeScript definidas** (`src/types/auth.types.ts`):
- `LoginRequest`: Estructura del request
- `LoginResponse`: Estructura de respuesta exitosa
- `UserData`: Datos del usuario autenticado
- `TokenResponse`: Respuesta del endpoint de token
- `ApiError`: Estructura de errores

**Beneficios:**
- Type safety en toda la cadena de autenticación
- Autocomplete en IDE
- Detección temprana de errores

#### Diseño Visual

**Paleta de Colores:**
- Primario: `#f46036` (naranja/rojo)
- Fondo oscuro: `#05073c` (azul marino)
- Fondo claro: `#f2f2f2` (gris claro)
- Texto principal: `#333333`
- Texto secundario: `#666666`
- Enlaces: `#0088ff` (azul)

**Tipografía:**
- Fuente principal: **Nunito** (todos los textos)
- Pesos: regular (400), semibold (600), bold (700)

**Responsive Design:**
- Mobile first approach
- Breakpoint principal: `md` (768px)
- Layout cambia de columna única a split-screen en desktop

**Accesibilidad:**
- Labels asociados a inputs
- Required attributes en campos obligatorios
- Aria-label en botón de toggle de contraseña
- Estados disabled visibles (opacidad reducida)
- Focus states claramente definidos (ring en color primario)

#### Manejo de Tokens

**Estrategia de caché:**
- Token se guarda en memoria (no en localStorage)
- Se verifica expiración antes de cada uso
- Si expira, se solicita nuevo token automáticamente

**Seguridad:**
- Tokens nunca se exponen en el código
- Basic Auth credentials desde variables de entorno
- Token enviado en header `x-access-token` (no en URL)

#### Manejo de Errores

**Códigos HTTP mapeados a mensajes amigables:**
- `0200`: Éxito
- `0400`: "Solicitud incorrecta. Verifica los datos ingresados"
- `0404`: "Usuario o contraseña incorrectos"
- `0500`: "Error interno del servidor. Intenta nuevamente más tarde"
- Network error: "Error de conexión. Verifica tu conexión a internet"

**UX de errores:**
- Errores de campo: se muestran debajo del input afectado
- Error general: banner rojo en la parte superior del formulario
- Errores se limpian automáticamente al reintentar

#### Componentes Reutilizables

**Por qué crear componentes personalizados:**
- Consistencia visual en toda la aplicación
- DRY (Don't Repeat Yourself)
- Facilita cambios globales de estilo
- Encapsula lógica común (ej: toggle de contraseña)

**Diseño de API de componentes:**
- Props intuitivos y descriptivos
- Extensión de props nativas HTML (spread operator)
- Clases CSS personalizables mediante `className`

---

### 9. Estructura de Archivos

```
src/
├── pages/
│   └── Login.tsx                    # Componente principal de login
├── components/
│   └── ui/
│       ├── button.tsx               # Botón reutilizable
│       ├── form-fields.tsx          # Input con label y errores
│       ├── page-header.tsx          # Título y subtítulo
│       ├── error-message.tsx        # Banner de error
│       ├── separator.tsx            # Línea divisoria
│       └── link-button.tsx          # Botón estilo enlace
├── services/
│   ├── auth.service.ts              # Lógica de autenticación
│   └── api.service.ts               # Cliente HTTP
├── config/
│   └── api.config.ts                # Configuración de API
└── types/
    └── auth.types.ts                # Interfaces TypeScript
```

---

### 10. Dependencias Directas

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.10.1",
  "lucide-react": "^0.344.0"
}
```

---

### 11. Próximos Pasos / TODOs

- Implementar funcionalidad de "¿Olvidaste tu contraseña?"
- Añadir tests unitarios para validaciones
- Implementar rate limiting en cliente
- Añadir animaciones de transición entre estados
- Considerar implementar recordar sesión ("Remember me")

---

## Pantalla de Selección de Perfil

### 1. Descripción General

La pantalla de Selección de Perfil (`src/pages/seleccion-perfil.tsx`) permite a los nuevos usuarios elegir el tipo de cuenta que desean crear: **Candidato** o **Empresa**. Es el punto de partida del flujo de registro.

**Flujo esperado:**
1. Usuario nuevo hace clic en "Creá tu cuenta" desde la pantalla de Login
2. Se muestra la pantalla de Selección de Perfil
3. Usuario selecciona "Candidato" o "Empresa"
4. Es redirigido a la pantalla de registro correspondiente:
   - Candidato → `/registro-candidato`
   - Empresa → `/registro-reclutador`
5. Puede volver al login usando el enlace "Iniciá sesión"

---

### 2. Estructura del Componente

#### Layout de la Pantalla

La pantalla está organizada en tres secciones principales:

**Header:**
- Fondo color `#05073c` (azul oscuro)
- Contiene el logo reutilizable (`HeaderLogo`)
- Padding horizontal responsive: 24px (mobile) / 50px (desktop)

**Main Content:**
- Fondo color `#f2f2f2` (gris claro)
- Centrado vertical y horizontal
- Contenido organizado en tres bloques:
  1. Título y subtítulo
  2. Tarjetas de selección de rol
  3. Enlace para volver al login

**Footer (implícito):**
- Enlace "¿Ya tenés cuenta? Iniciá sesión"

#### Estados del Componente

```typescript
const navigate = useNavigate(); // No hay estados locales, solo navegación
```

**Nota:** Este componente es completamente estático, no maneja estado local. Solo gestiona navegación mediante `useNavigate()`.

---

### 3. Componentes Reutilizables

#### HeaderLogo (`src/components/ui/header-logo.tsx`)
- Componente modular que muestra el branding
- Contiene dos líneas de texto:
  - "Portal de Empleos" (semibold, 22px)
  - "Instituto Madero" (medium, 16px)
- Fuente: Nunito
- Color: blanco (`text-neutral-50`)

**Uso:**
```typescript
<HeaderLogo />
```

**Beneficio:** Reutilizable en todas las pantallas que necesiten el logo en el header.

#### Card y CardContent (`src/components/ui/role-selector-card.tsx`)
- Componentes contenedores para tarjetas personalizables
- `Card`: Wrapper principal con estilos base
- `CardContent`: Contenedor interior para el contenido

**Props:**
- `children`: Contenido del componente
- `className`: Clases CSS adicionales
- Todas las props de `HTMLDivElement`

**Uso en Selección de Perfil:**
```typescript
<Card className="bg-white rounded-lg border border-[#dbdbdb] ...">
  <CardContent className="px-[30px] py-[50px] flex flex-col ...">
    <p>{pregunta}</p>
    <Button>{textoBoton}</Button>
  </CardContent>
</Card>
```

#### Button (`src/components/ui/button.tsx`)
- Mismo componente reutilizable usado en Login
- Acepta `variant` y `className` para personalización
- En esta pantalla se usa con dos variantes:
  - **Default (Candidato):** fondo naranja `#f46036`
  - **Outline (Empresa):** borde naranja, texto naranja

---

### 4. Datos y Configuración

#### Interface RoleCard

```typescript
interface RoleCard {
  question: string;         // Pregunta mostrada en la tarjeta
  buttonText: string;       // Texto del botón (Candidato/Empresa)
  buttonVariant: 'default' | 'outline'; // Variante visual del botón
  buttonClassName: string;  // Clases CSS específicas del botón
  navigateTo: string;       // Ruta de destino al hacer clic
}
```

#### Configuración de Tarjetas (roleCards)

```typescript
const roleCards: RoleCard[] = [
  {
    question: "¿Estás buscando trabajo o querés postularte a nuevas oportunidades?",
    buttonText: "Candidato",
    buttonVariant: "default",
    buttonClassName: "bg-[#f46036] hover:bg-[#f46036]/90 text-white ...",
    navigateTo: "/registro-candidato",
  },
  {
    question: "¿Querés publicar búsquedas y encontrar talento para tu equipo?",
    buttonText: "Empresa",
    buttonVariant: "outline",
    buttonClassName: "border-[#f46036] text-[#f46036] hover:bg-[#f46036]/10 ...",
    navigateTo: "/registro-reclutador",
  },
];
```

**Ventajas de este enfoque:**
- Fácil agregar nuevos roles sin modificar JSX
- Configuración centralizada y legible
- Type-safe mediante TypeScript
- Fácil de testear

---

### 5. Navegación

#### Rutas de Destino

**Desde Selección de Perfil se puede navegar a:**

1. **`/registro-candidato`**
   - Trigger: Click en botón "Candidato"
   - Destino: Formulario de registro para candidatos

2. **`/registro-reclutador`**
   - Trigger: Click en botón "Empresa"
   - Destino: Formulario de registro para reclutadores

3. **`/login`**
   - Trigger: Click en enlace "Iniciá sesión"
   - Destino: Pantalla de login

#### Integración con React Router

```typescript
const navigate = useNavigate();

// Navegación dinámica según la tarjeta seleccionada
onClick={() => navigate(card.navigateTo)}

// Navegación al login
onClick={() => navigate('/login')}
```

---

### 6. Diseño Visual

#### Paleta de Colores

| Elemento | Color | Código Hex |
|----------|-------|------------|
| Header | Azul oscuro | `#05073c` |
| Fondo principal | Gris claro | `#f2f2f2` |
| Tarjetas | Blanco | `#ffffff` |
| Borde tarjetas | Gris claro | `#dbdbdb` |
| Texto principal | Gris oscuro | `#333333` |
| Botón Candidato | Naranja | `#f46036` |
| Botón Empresa (borde) | Naranja | `#f46036` |
| Enlace | Azul | `#0088ff` |

#### Tipografía

- **Fuente:** Nunito (Google Fonts)
- **Pesos utilizados:**
  - Medium (500): Logo en header
  - Semibold (600): Logo en header
  - Bold (700): Título "Seleccioná tu rol"
  - Regular (400): Preguntas y texto general

#### Espaciado y Tamaños

**Título Principal:**
- Mobile: 28px
- Desktop: 32px

**Subtítulo:**
- Mobile: 18px
- Desktop: 22px

**Texto de Tarjetas:**
- Mobile: 18px
- Desktop: 20px

**Padding de Tarjetas:**
- Horizontal: 30px
- Vertical: 50px

**Gap entre Tarjetas:**
- Mobile: 24px (gap-6)
- Desktop: 32px (gap-8)

#### Responsive Design

**Breakpoints:**
- Mobile: < 768px (1 columna)
- Desktop: ≥ 768px (2 columnas)

**Comportamiento Responsive:**
- **Header padding:** 24px → 50px
- **Layout tarjetas:** columna única → dos columnas lado a lado
- **Tamaños de texto:** se ajustan según breakpoint
- **Márgenes verticales:** se reducen en mobile para mejor uso del espacio

---

### 7. Decisiones Técnicas

#### Modularidad y Reutilización

**Componentes Creados:**
1. **HeaderLogo:** Encapsula el branding del portal
   - Reutilizable en múltiples pantallas
   - Mantiene consistencia visual
   - Facilita cambios de branding

2. **Card/CardContent:** Sistema de tarjetas flexible
   - No atado a un caso de uso específico
   - Acepta cualquier contenido mediante `children`
   - Personalizable mediante `className`

**Estructura de Datos:**
- Array `roleCards` permite agregar nuevos roles sin cambiar código JSX
- Interface `RoleCard` garantiza type safety
- Separación de datos y presentación (patrón data-driven)

#### Arquitectura sin Estado

**Por qué no hay estado local:**
- No hay formularios ni inputs que validar
- No hay peticiones asíncronas
- Solo se realiza navegación (no requiere estado)
- Pantalla puramente presentacional

**Ventajas:**
- Componente más simple y fácil de mantener
- No hay re-renders innecesarios
- Fácil de testear

#### Accesibilidad

**Implementaciones:**
- Botones semánticos (`<button>`) para acciones clickeables
- Texto descriptivo en tarjetas
- Contraste de colores cumple con WCAG AA
- Hover states claramente visibles
- Keyboard navigation funcional

---

### 8. Integración con el Flujo de Autenticación

#### Relación con Login

La pantalla de Selección de Perfil es accesible desde Login mediante:
```typescript
<button onClick={() => navigate('/seleccion-de-perfil')}>
  Creá tu cuenta como Candidato o Empresa.
</button>
```

#### Próximos Pasos en el Flujo

Después de seleccionar un perfil, el usuario es dirigido a:
- **`/registro-candidato`**: Formulario de registro para candidatos
- **`/registro-reclutador`**: Formulario de registro para empresas

**Nota:** Estas pantallas aún no están implementadas en el alcance actual.

---

### 9. Estructura de Archivos

```
src/
├── pages/
│   ├── Login.tsx                    # Pantalla de login
│   └── seleccion-perfil.tsx         # Pantalla de selección de perfil
├── components/
│   └── ui/
│       ├── button.tsx               # Botón reutilizable (compartido)
│       ├── header-logo.tsx          # Logo del header (nuevo)
│       ├── role-selector-card.tsx   # Tarjetas de selección (nuevo)
│       ├── form-fields.tsx          # Campos de formulario
│       ├── page-header.tsx          # Encabezados de página
│       ├── error-message.tsx        # Mensajes de error
│       ├── separator.tsx            # Separadores
│       └── link-button.tsx          # Botones estilo link
```

---

### 10. Dependencias

La pantalla de Selección de Perfil utiliza las mismas dependencias que Login:

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.10.1"
}
```

**Nota:** No requiere `lucide-react` ni servicios de API.

---

### 11. Testing (Pendiente)

**Casos de prueba sugeridos:**
- Renderizado correcto de ambas tarjetas
- Navegación al hacer clic en "Candidato"
- Navegación al hacer clic en "Empresa"
- Navegación al hacer clic en "Iniciá sesión"
- Responsive design en diferentes tamaños de pantalla
- Accesibilidad con teclado

---

### 12. Próximos Pasos

- Implementar pantallas de registro (`/registro-candidato` y `/registro-reclutador`)
- Agregar animaciones de transición entre pantallas
- Considerar agregar iconos representativos en las tarjetas
- Implementar tests unitarios y de integración

---

## Pantalla de Registro de Candidato

### 1. Descripción General

La pantalla de Registro de Candidato (`src/pages/registrocandidato.tsx`) permite a los nuevos usuarios crear una cuenta como candidato en el Portal de Empleos. Esta pantalla es parte del flujo de onboarding y recopila la información necesaria para crear un perfil de candidato.

**Flujo esperado:**
1. Usuario selecciona "Candidato" en la pantalla de Selección de Perfil
2. Se muestra el formulario de registro con los campos necesarios
3. Usuario completa el formulario con sus datos personales, credenciales, CV y habilidades
4. Se validan todos los campos en tiempo real
5. Al enviar, la contraseña se encripta con RSA y se envía al backend
6. Si el registro es exitoso, el usuario es redirigido a la pantalla de login
7. Si hay error, se muestra un mensaje descriptivo

---

### 2. Tecnologías Utilizadas

- **React 18.3.1**: Librería principal para la UI
- **TypeScript 5.5.3**: Tipado estático
- **React Router DOM 7.10.1**: Manejo de navegación
- **Lucide React 0.344.0**: Iconos para mostrar/ocultar contraseñas
- **Tailwind CSS 3.4.1**: Framework de estilos
- **JSEncrypt 3.3.2**: Encriptación RSA de contraseñas
- **Fetch API**: Cliente HTTP nativo

---

### 3. Estructura del Componente

#### Estados del Componente

```typescript
// Estados del formulario
const [name, setName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [cvLink, setCvLink] = useState("");
const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

// Estados de visualización
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Estados de error por campo
const [nameError, setNameError] = useState(false);
const [lastNameError, setLastNameError] = useState(false);
const [emailError, setEmailError] = useState(false);
const [passwordFormatError, setPasswordFormatError] = useState(false);
const [passwordMismatchError, setPasswordMismatchError] = useState(false);
const [cvError, setCvError] = useState(false);
const [skillsError, setSkillsError] = useState(false);

// Estados globales
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### Campos del Formulario

| Campo | Tipo | Longitud Máxima | Obligatorio | Validación Adicional |
|-------|------|----------------|-------------|---------------------|
| Nombre | text | 20 caracteres | Sí | No vacío |
| Apellido | text | 20 caracteres | Sí | No vacío |
| Email | email | 60 caracteres | Sí | Formato email válido |
| Contraseña | password | 30 caracteres | Sí | Sin caracteres especiales prohibidos |
| Repetir contraseña | password | 30 caracteres | Sí | Debe coincidir con contraseña |
| CV (URL) | url | 100 caracteres | Sí | URL válida (http/https) |
| Habilidades | multi-select | - | Sí | Al menos 1 habilidad |

**Caracteres prohibidos en contraseña:**
```
!"#$%/()=?¡¨*[];:_¿´+{},.><°|¬\~`^Ññ\r\n
```

---

### 4. Handlers y Funciones Principales

#### `handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void`
- Filtra caracteres especiales prohibidos en tiempo real
- Limita la longitud a 30 caracteres automáticamente
- Actualiza el estado de `password`

#### `handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>): void`
- Similar a `handlePasswordChange` pero para el campo de confirmación
- Asegura que ambos campos tengan las mismas restricciones

#### `handleCvLinkChange(e: React.ChangeEvent<HTMLInputElement>): void`
- Valida que la URL tenga formato correcto (http o https)
- Muestra error en tiempo real si el formato es inválido
- Limpia el error si el campo está vacío

#### `handleSkillSelect(value: string): void`
- Agrega una habilidad a la lista de habilidades seleccionadas
- Previene duplicados

#### `handleSkillRemove(value: string): void`
- Elimina una habilidad de la lista de seleccionadas
- Actualiza la lista de habilidades disponibles

#### `isValidUrl(url: string): boolean`
- Valida que la URL tenga protocolo http o https
- Usa el constructor `URL` nativo para validación
- Retorna `false` si la URL es inválida

#### `encryptPassword(password: string): string`
- Encripta la contraseña usando RSA con clave pública
- Usa la librería JSEncrypt
- Obtiene la clave pública de `VITE_RSA_PUBLIC_KEY` (variable de entorno)
- Si no hay clave pública, envía la contraseña en texto plano (con advertencia en consola)
- Si hay error en la encriptación, retorna la contraseña original

**Configuración de la clave pública:**
```typescript
const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY;
```

#### `handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void>`
1. Previene el comportamiento por defecto del formulario
2. Limpia errores previos
3. Valida todos los campos:
   - Nombre: no vacío y máximo 20 caracteres
   - Apellido: no vacío y máximo 20 caracteres
   - Email: no vacío y máximo 60 caracteres
   - Contraseña: no vacía y máximo 30 caracteres
   - Confirmación: debe coincidir con contraseña
   - CV: URL válida y máximo 100 caracteres
   - Habilidades: al menos 1 seleccionada
4. Si hay errores, detiene el envío
5. Establece estado de carga
6. Encripta la contraseña
7. Construye el payload del request
8. Llama al servicio `CandidateService.registerCandidate()`
9. Si es exitoso: navega a `/login`
10. Si falla: muestra mensaje de error
11. Siempre finaliza limpiando el estado de carga

---

### 5. Interacciones con APIs y Servicios

#### CandidateService

**Archivo:** `src/services/candidate.service.ts`

**Método utilizado:**

**`registerCandidate(data: RegisterCandidateRequest): Promise<RegisterCandidateResponse>`**
- Valida longitudes de campos (redundante con validación frontend)
- Construye payload `RegisterCandidateRequest`
- Usa `apiService.post()` para enviar al endpoint `/registerCandidateUser`
- Maneja códigos de respuesta:
  - `0200`: Registro exitoso
  - `0400`: Solicitud incorrecta
  - `0410`: Usuario ya registrado
  - `0411`: Longitud de datos incorrecta
  - `0500`: Error interno del servidor
  - Otros: Mensaje genérico de error
- Si hay error de conexión, lanza: "Error de conexión. Verifica tu conexión a internet"

#### Estructura del Request

```typescript
interface RegisterCandidateRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;           // Encriptado con RSA
  resume_url: string;
  skill_list: number[];       // Array de IDs de habilidades
}
```

#### Estructura del Response

```typescript
interface RegisterCandidateResponse {
  code: string;               // "0200" para éxito
  description: string;        // Descripción del resultado
}
```

#### Configuración de API

**Endpoint:** `/registerCandidateUser`

**Headers requeridos:**
- `Content-Type`: `application/json`
- `x-access-token`: Token obtenido de `/getToken`

**Variables de entorno requeridas:**
- `VITE_API_BASE_URL`: URL base de la API
- `VITE_API_TOKEN`: Token estático (opcional)
- `VITE_API_USERNAME`: Usuario para Basic Auth
- `VITE_API_PASSWORD`: Contraseña para Basic Auth
- `VITE_RSA_PUBLIC_KEY`: Clave pública RSA para encriptar contraseñas

---

### 6. Componentes Reutilizables

La pantalla de Registro de Candidato utiliza componentes UI existentes y nuevos:

#### Componentes Existentes (Reutilizados)

**HeaderLogo** (`src/components/ui/header-logo.tsx`)
- Logo del portal en el header
- Mantiene consistencia visual con otras pantallas

**Button** (`src/components/ui/button.tsx`)
- Botón de "Registrarse"
- Muestra estado de carga ("Registrando...")
- Se deshabilita durante el proceso

**ErrorMessage** (`src/components/ui/error-message.tsx`)
- Muestra errores generales del formulario
- Banner rojo con mensaje descriptivo

#### Componentes Nuevos (Creados para esta pantalla)

**Input** (`src/components/ui/input.tsx`)
- Campo de entrada básico
- Hereda todas las props de `HTMLInputElement`
- Estilos consistentes con el diseño del portal
- Props principales:
  - `type`: Tipo de input (text, email, password, etc.)
  - `placeholder`: Texto placeholder
  - `maxLength`: Longitud máxima
  - `disabled`: Deshabilitar input
  - `className`: Clases CSS adicionales

**Label** (`src/components/ui/label.tsx`)
- Etiqueta para campos de formulario
- Hereda todas las props de `HTMLLabelElement`
- Estilos de texto consistentes
- Props principales:
  - `children`: Contenido del label
  - `className`: Clases CSS adicionales

**Select Components** (`src/components/ui/select.tsx`)
Sistema completo de componentes para selección desplegable:

**Select**: Contenedor principal
- Props:
  - `value`: Valor seleccionado
  - `onValueChange`: Callback al cambiar valor
  - `children`: Componentes hijos

**SelectTrigger**: Botón que abre/cierra el dropdown
- Muestra el valor actual o placeholder
- Incluye icono chevron animado
- Props:
  - `className`: Clases CSS adicionales
  - `children`: Contenido (generalmente SelectValue)

**SelectValue**: Muestra el valor actual o placeholder
- Props:
  - `placeholder`: Texto cuando no hay selección

**SelectContent**: Contenedor del dropdown
- Se muestra/oculta según el estado `open`
- Cierra al hacer clic fuera
- Scroll automático si hay muchas opciones
- Props:
  - `children`: Items del dropdown

**SelectItem**: Item individual del dropdown
- Props:
  - `value`: Valor del item
  - `children`: Contenido a mostrar

**Uso del Select en Registro:**
```typescript
<Select onValueChange={handleSkillSelect}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccioná habilidades" />
  </SelectTrigger>
  <SelectContent>
    {availableSkills.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### 7. Sistema de Habilidades

#### Datos de Habilidades

```typescript
const skillOptions = [
  { value: "1", label: "Adaptabilidad" },
  { value: "2", label: "Responsabilidad" },
  { value: "3", label: "Trabajo en equipo" },
];
```

**Nota:** Esta lista es estática en el frontend. En una implementación completa, estas habilidades deberían obtenerse dinámicamente desde el backend.

#### Funcionamiento

1. **Selección:** Usuario abre el dropdown y selecciona una habilidad
2. **Agregado:** La habilidad se agrega a `selectedSkills`
3. **Visualización:** Se muestra como chip/badge azul con botón de eliminar
4. **Filtrado:** Las habilidades seleccionadas no aparecen en el dropdown
5. **Eliminación:** Usuario hace clic en "✕" para remover una habilidad
6. **Reaparecer:** La habilidad eliminada vuelve al dropdown

#### Chips de Habilidades Seleccionadas

- **Color de fondo:** `#0088FF` (azul)
- **Texto:** Blanco
- **Fuente:** Nunito
- **Botón eliminar:** "✕" con hover effect
- **Layout:** Flex wrap para múltiples habilidades

---

### 8. Validaciones Implementadas

#### Validaciones del Cliente (Frontend)

| Campo | Reglas | Mensaje de Error |
|-------|--------|------------------|
| Nombre | No vacío, máximo 20 caracteres | "Nombre obligatorio, máximo 20 caracteres" |
| Apellido | No vacío, máximo 20 caracteres | "Apellido obligatorio, máximo 20 caracteres" |
| Email | No vacío, máximo 60 caracteres, formato email | "Email obligatorio, máximo 60 caracteres" |
| Contraseña | No vacía, máximo 30 caracteres, sin caracteres prohibidos | "La contraseña debe tener máximo 30 caracteres" |
| Confirmar contraseña | Debe coincidir con contraseña | "Las contraseñas no coinciden" |
| CV URL | No vacía, URL válida (http/https), máximo 100 caracteres | "Ingresá un link válido (http o https), máximo 100 caracteres" |
| Habilidades | Al menos 1 seleccionada | "Debés seleccionar al menos 1 habilidad" |

#### Validaciones en Tiempo Real

- **Contraseña:** Caracteres prohibidos se filtran automáticamente al escribir
- **CV URL:** Se valida el formato mientras el usuario escribe
- **Longitud:** Los campos tienen `maxLength` para prevenir excesos

#### Validaciones del Servidor (Backend)

El servicio `CandidateService` realiza validaciones adicionales:
- Verifica longitudes de todos los campos
- Comprueba si el email ya está registrado
- Valida formato de datos

---

### 9. Navegación

#### Rutas de Destino

**Desde Registro de Candidato se puede navegar a:**

1. **`/login`**
   - Trigger: Registro exitoso (automático)
   - Trigger: Click en "Iniciá sesión" (manual)

#### Rutas de Origen

**Se puede llegar a Registro de Candidato desde:**

1. **`/seleccion-de-perfil`**
   - Click en botón "Candidato"

---

### 10. Diseño Visual

#### Paleta de Colores

| Elemento | Color | Código Hex |
|----------|-------|------------|
| Header | Azul oscuro | `#05073c` |
| Fondo principal | Gris claro | `#f2f2f2` |
| Campos de input | Blanco | `#ffffff` |
| Borde inputs | Gris | `#d9d9d9` |
| Texto principal | Azul oscuro | `#05073c` |
| Labels | Gris oscuro | `#333333` |
| Placeholder | Gris claro | `#b3b3b3` / `#999999` |
| Error | Rojo | `#cc2222` |
| Botón registrar | Naranja | `#f46036` |
| Habilidades chips | Azul | `#0088FF` |
| Enlace | Azul | `#0088ff` |

#### Tipografía

- **Fuente principal:** Nunito
- **Pesos utilizados:**
  - Normal (400): Labels, texto general
  - Medium (500): Botones
  - Semibold (600): Logo en header
  - Bold (700): Título principal

#### Espaciado

**Título Principal:**
- Mobile: 28px
- Desktop: 32px

**Campos del Formulario:**
- Gap entre campos: 32px (gap-8)
- Gap entre columnas: 24px (gap-6)
- Min height inputs: 42px

**Contenedor del Formulario:**
- Max width: 928px
- Centrado horizontalmente
- Padding horizontal: 16px (px-4)

#### Responsive Design

**Breakpoints:**
- Mobile: < 768px (1 columna)
- Desktop: ≥ 768px (2 columnas para nombre/apellido y contraseñas)

**Comportamiento Responsive:**
- Header padding: 24px → 50px
- Grid de nombre/apellido: 1 columna → 2 columnas
- Grid de contraseñas: 1 columna → 2 columnas
- Tamaños de texto: se ajustan según breakpoint

---

### 11. Seguridad

#### Encriptación de Contraseñas

**Método:** RSA con clave pública
**Librería:** JSEncrypt

**Flujo:**
1. Usuario ingresa contraseña en texto plano
2. Al enviar el formulario, se encripta con clave pública RSA
3. Solo el backend puede desencriptar con la clave privada
4. La contraseña nunca se envía en texto plano (excepto si no hay clave pública configurada)

**Configuración:**
```typescript
const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY;
```

**Fallback de seguridad:**
- Si no hay clave pública: envía en texto plano con advertencia en consola
- Si falla la encriptación: envía en texto plano con error en consola

#### Filtrado de Caracteres

La contraseña filtra automáticamente caracteres especiales prohibidos para prevenir:
- Inyección SQL
- XSS
- Problemas de encoding

#### Validaciones de Entrada

- Longitudes máximas estrictas
- Validación de formato de email (HTML5)
- Validación de URL para CV

---

### 12. Decisiones Técnicas

#### Arquitectura y Organización

**Separación de Responsabilidades:**
- **Componente RegistroCandidato:** UI y estado local
- **CandidateService:** Lógica de registro y comunicación con API
- **ApiService:** Gestión de tokens y peticiones HTTP
- **Componentes UI:** Reutilizables, sin lógica de negocio

**Componentes Modulares:**
- Input, Label, Select: Componentes básicos reutilizables
- HeaderLogo: Consistencia visual entre pantallas
- ErrorMessage: Manejo uniforme de errores

#### Gestión de Estado

- **Estado local con `useState`:** Suficiente para esta pantalla
- **Sin Context API:** No hay necesidad de estado global
- **Validación en tiempo real:** Mejor UX con feedback inmediato

#### Manejo de Errores

**Dos niveles de errores:**
1. **Errores por campo:** Se muestran debajo de cada input
2. **Error general:** Banner en la parte superior del formulario

**UX de errores:**
- Errores se muestran solo después del intento de envío
- Algunos errores (URL, longitud) se muestran en tiempo real
- Errores se limpian al corregir el campo o reintentar

#### Encriptación

**Por qué RSA:**
- Encriptación asimétrica segura
- Frontend solo necesita clave pública
- Backend desencripta con clave privada

**Manejo de errores de encriptación:**
- Fallback a texto plano (no ideal pero funcional)
- Advertencias en consola para debugging

---

### 13. Estructura de Archivos

```
src/
├── pages/
│   ├── Login.tsx
│   ├── seleccion-perfil.tsx
│   └── registrocandidato.tsx        # Nueva pantalla
├── components/
│   └── ui/
│       ├── button.tsx               # Existente (reutilizado)
│       ├── header-logo.tsx          # Existente (reutilizado)
│       ├── error-message.tsx        # Existente (reutilizado)
│       ├── input.tsx                # Nuevo
│       ├── label.tsx                # Nuevo
│       └── select.tsx               # Nuevo (Select, SelectTrigger, etc.)
├── services/
│   ├── auth.service.ts
│   ├── api.service.ts
│   └── candidate.service.ts         # Nuevo
├── config/
│   └── api.config.ts                # Actualizado (nuevo endpoint)
└── types/
    ├── auth.types.ts
    └── candidate.types.ts           # Nuevo
```

---

### 14. Dependencias

**Nuevas dependencias agregadas:**
```json
{
  "jsencrypt": "^3.3.2"
}
```

**Dependencias existentes utilizadas:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.10.1",
  "lucide-react": "^0.344.0"
}
```

---

### 15. Testing (Pendiente)

**Casos de prueba sugeridos:**
- Renderizado correcto del formulario
- Validación de cada campo individualmente
- Validación conjunta del formulario
- Filtrado de caracteres prohibidos en contraseña
- Coincidencia de contraseñas
- Validación de URL del CV
- Selección y eliminación de habilidades
- Encriptación de contraseña
- Manejo de respuesta exitosa (redirección)
- Manejo de errores del servidor
- Responsive design
- Accesibilidad con teclado

---

### 16. Próximos Pasos

- Hacer la lista de habilidades dinámica (obtener desde backend)
- Agregar validación de formato de email más robusta
- Implementar subida de archivos para CV (en lugar de URL)
- Agregar indicador de fortaleza de contraseña
- Implementar confirmación por email
- Agregar términos y condiciones
- Implementar tests unitarios y de integración
- Mejorar manejo de errores de encriptación

---

## Pantalla de Registro de Reclutador/Empresa

### 1. Descripción General

La pantalla de Registro de Reclutador (`src/pages/registroreclutador.tsx`) permite a representantes de empresas crear una cuenta como reclutador en el Portal de Empleos. Esta pantalla es parte del flujo de onboarding para empresas que desean publicar ofertas laborales.

**Flujo esperado:**
1. Usuario selecciona "Empresa" en la pantalla de Selección de Perfil
2. Se muestra el formulario de registro con los campos necesarios
3. Usuario completa el formulario con sus datos personales, credenciales y empresa
4. Se validan todos los campos en tiempo real
5. Al enviar, la contraseña se encripta con RSA y se envía al backend
6. Si el registro es exitoso, el usuario es redirigido a la pantalla de login
7. Si hay error, se muestra un mensaje descriptivo

---

### 2. Tecnologías Utilizadas

- **React 18.3.1**: Librería principal para la UI
- **TypeScript 5.5.3**: Tipado estático
- **React Router DOM 7.10.1**: Manejo de navegación
- **Lucide React 0.344.0**: Iconos para mostrar/ocultar contraseñas
- **Tailwind CSS 3.4.1**: Framework de estilos
- **JSEncrypt 3.3.2**: Encriptación RSA de contraseñas
- **Fetch API**: Cliente HTTP nativo

---

### 3. Estructura del Componente

#### Estados del Componente

```typescript
// Estados del formulario
const [name, setName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [companyId, setCompanyId] = useState("");

// Estados de visualización
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Estados de error por campo
const [nameError, setNameError] = useState(false);
const [lastNameError, setLastNameError] = useState(false);
const [emailError, setEmailError] = useState(false);
const [passwordFormatError, setPasswordFormatError] = useState(false);
const [passwordMismatchError, setPasswordMismatchError] = useState(false);
const [companyError, setCompanyError] = useState(false);

// Estados globales
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### Campos del Formulario

| Campo | Tipo | Longitud Máxima | Obligatorio | Validación Adicional |
|-------|------|----------------|-------------|---------------------|
| Nombre | text | 20 caracteres | Sí | No vacío |
| Apellido | text | 20 caracteres | Sí | No vacío |
| Email | email | 60 caracteres | Sí | Formato email válido |
| Contraseña | password | 30 caracteres | Sí | Sin caracteres especiales prohibidos |
| Repetir contraseña | password | 30 caracteres | Sí | Debe coincidir con contraseña |
| Empresa | select | 3 caracteres (ID) | Sí | Debe seleccionar una empresa |

**Caracteres prohibidos en contraseña:**
```
!"#$%/()=?¡¨*[];:_¿´+{},.><°|¬\~`^Ññ\r\n
```

---

### 4. Handlers y Funciones Principales

#### `handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void`
- Filtra caracteres especiales prohibidos en tiempo real
- Limita la longitud a 30 caracteres automáticamente
- Actualiza el estado de `password`

#### `handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>): void`
- Similar a `handlePasswordChange` pero para el campo de confirmación
- Asegura que ambos campos tengan las mismas restricciones

#### `encryptPassword(password: string): string`
- Encripta la contraseña usando RSA con clave pública
- Usa la librería JSEncrypt
- Obtiene la clave pública de `VITE_RSA_PUBLIC_KEY` (variable de entorno)
- Si no hay clave pública, envía la contraseña en texto plano (con advertencia en consola)
- Si hay error en la encriptación, retorna la contraseña original

#### `handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void>`
1. Previene el comportamiento por defecto del formulario
2. Limpia errores previos
3. Valida todos los campos:
   - Nombre: no vacío y máximo 20 caracteres
   - Apellido: no vacío y máximo 20 caracteres
   - Email: no vacío y máximo 60 caracteres
   - Contraseña: no vacía y máximo 30 caracteres
   - Confirmación: debe coincidir con contraseña
   - Empresa: debe estar seleccionada
4. Si hay errores, detiene el envío
5. Establece estado de carga
6. Encripta la contraseña
7. Construye el payload del request
8. Llama al servicio `EmployerService.registerEmployer()`
9. Si es exitoso: navega a `/login`
10. Si falla: muestra mensaje de error
11. Siempre finaliza limpiando el estado de carga

---

### 5. Interacciones con APIs y Servicios

#### EmployerService

**Archivo:** `src/services/employer.service.ts`

**Método utilizado:**

**`registerEmployer(data: RegisterEmployerRequest): Promise<RegisterEmployerResponse>`**
- Valida longitudes de campos (redundante con validación frontend)
- Construye payload `RegisterEmployerRequest`
- Usa `apiService.post()` para enviar al endpoint `/registerEmployerUser`
- Maneja códigos de respuesta:
  - `0200`: Registro exitoso
  - `0400`: Solicitud incorrecta
  - `0404`: Empresa no encontrada
  - `0410`: Usuario ya registrado
  - `0500`: Error interno del servidor
  - Otros: Mensaje genérico de error
- Si hay error de conexión, lanza: "Error de conexión. Verifica tu conexión a internet"

#### Estructura del Request

```typescript
interface RegisterEmployerRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;           // Encriptado con RSA
  company_id: number;         // ID de la empresa (máximo 3 dígitos)
}
```

#### Estructura del Response

```typescript
interface RegisterEmployerResponse {
  code: string;               // "0200" para éxito
  description: string;        // Descripción del resultado
}
```

#### Configuración de API

**Endpoint:** `/registerEmployerUser`

**Headers requeridos:**
- `Content-Type`: `application/json`
- `x-access-token`: Token obtenido de `/getToken`

**Variables de entorno requeridas:**
- `VITE_API_BASE_URL`: URL base de la API
- `VITE_API_TOKEN`: Token estático (opcional)
- `VITE_API_USERNAME`: Usuario para Basic Auth
- `VITE_API_PASSWORD`: Contraseña para Basic Auth
- `VITE_RSA_PUBLIC_KEY`: Clave pública RSA para encriptar contraseñas

---

### 6. Componentes Reutilizables

La pantalla de Registro de Reclutador reutiliza todos los componentes UI existentes:

#### Componentes Reutilizados

**HeaderLogo** (`src/components/ui/header-logo.tsx`)
- Logo del portal en el header
- Mantiene consistencia visual con otras pantallas

**Input** (`src/components/ui/input.tsx`)
- Campos de entrada para nombre, apellido, email, contraseñas
- Estilos consistentes con el diseño del portal

**Label** (`src/components/ui/label.tsx`)
- Etiquetas para todos los campos del formulario
- Estilos de texto consistentes

**Select Components** (`src/components/ui/select.tsx`)
- Sistema de selección desplegable para elegir empresa
- Incluye Select, SelectTrigger, SelectValue, SelectContent, SelectItem

**Button** (`src/components/ui/button.tsx`)
- Botón de "Registrarse"
- Muestra estado de carga ("Registrando...")
- Se deshabilita durante el proceso

**ErrorMessage** (`src/components/ui/error-message.tsx`)
- Muestra errores generales del formulario
- Banner rojo con mensaje descriptivo

---

### 7. Sistema de Selección de Empresa

#### Datos de Empresas

```typescript
const companyOptions = [
  { value: "1", label: "Empresa 1" },
  { value: "2", label: "Empresa 2" },
  { value: "3", label: "Empresa 3" },
  { value: "4", label: "Empresa 4" },
];
```

**Nota:** Esta lista es estática en el frontend. En una implementación completa, estas empresas deberían obtenerse dinámicamente desde el backend.

#### Funcionamiento

1. **Selección:** Usuario abre el dropdown y selecciona su empresa
2. **Validación:** Se verifica que se haya seleccionado una empresa antes de enviar
3. **Envío:** El ID de la empresa se envía como número entero al backend

---

### 8. Validaciones Implementadas

#### Validaciones del Cliente (Frontend)

| Campo | Reglas | Mensaje de Error |
|-------|--------|------------------|
| Nombre | No vacío, máximo 20 caracteres | "Nombre obligatorio, máximo 20 caracteres" |
| Apellido | No vacío, máximo 20 caracteres | "Apellido obligatorio, máximo 20 caracteres" |
| Email | No vacío, máximo 60 caracteres, formato email | "Email obligatorio, máximo 60 caracteres" |
| Contraseña | No vacía, máximo 30 caracteres, sin caracteres prohibidos | "La contraseña debe tener máximo 30 caracteres" |
| Confirmar contraseña | Debe coincidir con contraseña | "Las contraseñas no coinciden" |
| Empresa | Debe estar seleccionada | "Debés seleccionar una empresa" |

#### Validaciones en Tiempo Real

- **Contraseña:** Caracteres prohibidos se filtran automáticamente al escribir
- **Longitud:** Los campos tienen `maxLength` para prevenir excesos

#### Validaciones del Servidor (Backend)

El servicio `EmployerService` realiza validaciones adicionales:
- Verifica longitudes de todos los campos
- Comprueba si el email ya está registrado
- Valida que la empresa exista (company_id válido)
- Valida formato de datos

---

### 9. Navegación

#### Rutas de Destino

**Desde Registro de Reclutador se puede navegar a:**

1. **`/login`**
   - Trigger: Registro exitoso (automático)
   - Trigger: Click en "Iniciá sesión" (manual)

#### Rutas de Origen

**Se puede llegar a Registro de Reclutador desde:**

1. **`/seleccion-de-perfil`**
   - Click en botón "Empresa"

---

### 10. Diseño Visual

#### Paleta de Colores

| Elemento | Color | Código Hex |
|----------|-------|------------|
| Header | Azul oscuro | `#05073c` |
| Fondo principal | Gris claro | `#f2f2f2` |
| Campos de input | Blanco | `#ffffff` |
| Borde inputs | Gris | `#d9d9d9` |
| Texto principal | Azul oscuro | `#05073c` |
| Labels | Gris oscuro | `#333333` |
| Placeholder | Gris claro | `#b3b3b3` / `#999999` |
| Error | Rojo | `#cc2222` |
| Botón registrar | Naranja | `#f46036` |
| Enlace | Azul | `#0088ff` |

#### Tipografía

- **Fuente principal:** Nunito
- **Pesos utilizados:**
  - Normal (400): Labels, texto general
  - Medium (500): Botones
  - Semibold (600): Logo en header
  - Bold (700): Título principal

#### Espaciado

**Título Principal:**
- Mobile: 28px
- Desktop: 32px

**Campos del Formulario:**
- Gap entre campos: 32px (gap-8)
- Gap entre columnas: 24px (gap-6)
- Min height inputs: 42px

**Contenedor del Formulario:**
- Max width: 928px
- Centrado horizontalmente
- Padding horizontal: 16px (px-4)

#### Responsive Design

**Breakpoints:**
- Mobile: < 768px (1 columna)
- Desktop: ≥ 768px (2 columnas para nombre/apellido y contraseñas)

**Comportamiento Responsive:**
- Header padding: 24px → 50px
- Grid de nombre/apellido: 1 columna → 2 columnas
- Grid de contraseñas: 1 columna → 2 columnas
- Tamaños de texto: se ajustan según breakpoint

---

### 11. Diferencias con Registro de Candidato

Aunque la pantalla de Registro de Reclutador comparte la misma estructura base que Registro de Candidato, tiene las siguientes diferencias:

**Campos diferentes:**
- **Registro de Candidato:** Incluye CV (URL) y Habilidades (multi-select)
- **Registro de Reclutador:** Incluye Empresa (select simple)

**Campos comunes:**
- Nombre, Apellido, Email, Contraseña, Repetir contraseña

**Título:**
- Candidato: "Creá tu cuenta como candidato y accedé a ofertas laborales"
- Reclutador: "Creá tu cuenta como empresa y publicá ofertas laborales"

---

### 12. Seguridad

#### Encriptación de Contraseñas

**Método:** RSA con clave pública
**Librería:** JSEncrypt

**Flujo:**
1. Usuario ingresa contraseña en texto plano
2. Al enviar el formulario, se encripta con clave pública RSA
3. Solo el backend puede desencriptar con la clave privada
4. La contraseña nunca se envía en texto plano (excepto si no hay clave pública configurada)

**Configuración:**
```typescript
const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY;
```

#### Filtrado de Caracteres

La contraseña filtra automáticamente caracteres especiales prohibidos para prevenir:
- Inyección SQL
- XSS
- Problemas de encoding

#### Validaciones de Entrada

- Longitudes máximas estrictas
- Validación de formato de email (HTML5)
- Validación de empresa seleccionada

---

### 13. Decisiones Técnicas

#### Reutilización de Componentes

**Beneficios:**
- Consistencia visual total entre pantallas de registro
- Menor duplicación de código
- Facilita mantenimiento
- Cambios en componentes UI se propagan automáticamente

**Componentes compartidos:**
- HeaderLogo, Input, Label, Select, Button, ErrorMessage

#### Arquitectura Similar

La pantalla sigue la misma arquitectura que Registro de Candidato:
- Estado local con `useState`
- Validación en tiempo real
- Misma estructura de manejo de errores
- Misma estrategia de encriptación de contraseñas

**Ventajas:**
- Experiencia de usuario consistente
- Código más fácil de mantener
- Patrón reconocible para desarrolladores

---

### 14. Estructura de Archivos

```
src/
├── pages/
│   ├── Login.tsx
│   ├── seleccion-perfil.tsx
│   ├── registrocandidato.tsx
│   └── registroreclutador.tsx        # Nueva pantalla
├── components/
│   └── ui/
│       ├── button.tsx               # Reutilizado
│       ├── header-logo.tsx          # Reutilizado
│       ├── error-message.tsx        # Reutilizado
│       ├── input.tsx                # Reutilizado
│       ├── label.tsx                # Reutilizado
│       └── select.tsx               # Reutilizado
├── services/
│   ├── auth.service.ts
│   ├── api.service.ts
│   ├── candidate.service.ts
│   └── employer.service.ts          # Nuevo
├── config/
│   └── api.config.ts                # Actualizado (nuevo endpoint)
└── types/
    ├── auth.types.ts
    ├── candidate.types.ts
    └── employer.types.ts            # Nuevo
```

---

### 15. Testing (Pendiente)

**Casos de prueba sugeridos:**
- Renderizado correcto del formulario
- Validación de cada campo individualmente
- Validación conjunta del formulario
- Filtrado de caracteres prohibidos en contraseña
- Coincidencia de contraseñas
- Selección de empresa
- Encriptación de contraseña
- Manejo de respuesta exitosa (redirección)
- Manejo de errores del servidor (empresa no encontrada, usuario ya registrado)
- Responsive design
- Accesibilidad con teclado

---

### 16. Próximos Pasos

- Hacer la lista de empresas dinámica (obtener desde backend)
- Agregar validación de formato de email más robusta
- Agregar indicador de fortaleza de contraseña
- Implementar confirmación por email
- Agregar términos y condiciones
- Implementar tests unitarios y de integración
- Agregar información adicional de la empresa en el dropdown (logo, descripción)


---

## Pantalla Home Candidato

### 1. Descripción General

La pantalla Home Candidato (`src/pages/homecandidato.tsx`) es el panel principal para usuarios candidatos después de iniciar sesión. Permite buscar ofertas laborales, aplicar filtros y explorar oportunidades disponibles.

**Flujo esperado:**
1. Usuario ingresa como candidato desde la pantalla de login
2. Se muestra la página principal con ofertas de trabajo
3. Usuario puede buscar por área y ubicación
4. Usuario puede filtrar por sector, provincia, localidad y modalidad
5. Usuario puede ver detalles de ofertas específicas
6. Usuario puede cerrar sesión desde la barra de navegación

---

### 2. Tecnologías Utilizadas

- **React 18.3.1**: Librería principal para la UI
- **TypeScript 5.5.3**: Tipado estático
- **React Router DOM 7.10.1**: Manejo de navegación
- **Lucide React 0.344.0**: Iconos de interfaz
- **Tailwind CSS 3.4.1**: Framework de estilos

---

### 3. Arquitectura de Componentes

La pantalla está dividida en secciones modulares y reutilizables:

#### Componente Principal: HomeCandidato

**Archivo:** `src/pages/homecandidato.tsx`

**Responsabilidades:**
- Gestiona el estado global de filtros
- Coordina la comunicación entre secciones
- Maneja búsquedas y filtros de ofertas

**Estados del componente:**

```typescript
const [selectedFilters, setSelectedFilters] = useState<{
  sector: string[];
  provincia: string[];
  localidad: string[];
  modalidad: string[];
}>({
  sector: [],
  provincia: [],
  localidad: [],
  modalidad: [],
});

const [searchFilters, setSearchFilters] = useState<{
  area: string;
  location: string;
}>({
  area: "",
  location: "",
});
```

#### Secciones

**1. NavigationBarSection** (`src/pages/sections/NavigationBarSection.tsx`)
- Barra de navegación superior
- Logo del portal
- Información del usuario autenticado
- Botón de cerrar sesión
- Reutiliza componente HeaderLogo

**2. JobOffersSection** (`src/pages/sections/JobOffersSection.tsx`)
- Formulario de búsqueda principal
- Búsqueda por área/puesto
- Búsqueda por ubicación
- Muestra ofertas destacadas (3 ofertas iniciales)
- Botón de búsqueda

**3. JobFiltersSection** (`src/pages/sections/JobFiltersSection.tsx`)
- Panel lateral de filtros con categorías:
  - Sector (8 opciones)
  - Provincia (8 opciones)
  - Localidad (7 opciones)
  - Modalidad (3 opciones)
- Grid de ofertas filtradas (6 ofertas en área principal)
- Botón de limpiar filtros
- Indicador de búsqueda activa

**4. FooterSection** (`src/pages/sections/FooterSection.tsx`)
- Información del portal
- Enlaces rápidos (Sobre nosotros, Términos, Privacidad, Ayuda)
- Información de contacto
- Copyright

---

### 4. Handlers y Funciones Principales

#### `handleFilterChange(category: string, value: string): void`
- Agrega o remueve filtros de categorías específicas
- Mantiene múltiples valores por categoría
- Actualiza el estado de `selectedFilters`

**Lógica:**
```typescript
const handleFilterChange = (category: string, value: string) => {
  setSelectedFilters((prev) => {
    const categoryKey = category.toLowerCase() as keyof typeof prev;
    const currentValues = prev[categoryKey];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    return {
      ...prev,
      [categoryKey]: newValues,
    };
  });
};
```

#### `handleSearchFilterChange(field: 'area' | 'location', value: string): void`
- Actualiza los campos de búsqueda
- Permite búsqueda por área de trabajo o ubicación
- Actualiza el estado de `searchFilters`

---

### 5. Flujo de Navegación

#### Rutas

**Entrada a la pantalla:**
- **Desde Login:** `/login` → (login exitoso como candidato) → `/homecandidato`

**Salida de la pantalla:**
- **Cerrar sesión:** Botón en NavigationBarSection → `/login`
  - Limpia el usuario almacenado
  - Elimina credenciales de sessionStorage

#### Recordado de Credenciales

**Sistema implementado en Login.tsx:**

**Almacenamiento (al hacer login exitoso):**
```typescript
sessionStorage.setItem('loginEmail', email);
sessionStorage.setItem('loginPassword', password);
```

**Recuperación (al montar componente Login):**
```typescript
useEffect(() => {
  const savedEmail = sessionStorage.getItem('loginEmail');
  const savedPassword = sessionStorage.getItem('loginPassword');
  if (savedEmail) setEmail(savedEmail);
  if (savedPassword) setPassword(savedPassword);
}, []);
```

**Seguridad:**
- Usa `sessionStorage` (no `localStorage`) para mayor seguridad
- Los datos se borran al cerrar el navegador
- Se limpian al hacer logout
- Solo se usan para mejorar la experiencia si el usuario vuelve atrás

---

### 6. Componentes Reutilizables

#### De la biblioteca UI existente:

**HeaderLogo** (`src/components/ui/header-logo.tsx`)
- Usado en NavigationBarSection
- Logo consistente con todas las pantallas

**Input** (`src/components/ui/input.tsx`)
- Campos de búsqueda en JobOffersSection
- Mantiene estilos consistentes

**Button** (`src/components/ui/button.tsx`)
- Botones de búsqueda, filtrar, ver detalles
- Botón de cerrar sesión

#### Nuevos componentes creados:

**NavigationBarSection**
- Barra de navegación específica para usuarios autenticados
- Integra información del usuario desde AuthService
- Iconos de Lucide React (User, LogOut)

**JobOffersSection**
- Sección de búsqueda y visualización de ofertas
- Iconos: Search, MapPin, Briefcase
- Cards de ofertas con información resumida

**JobFiltersSection**
- Panel lateral de filtros con acordeones
- Componente interno FilterCategory para cada categoría
- Checkboxes para múltiples selecciones
- Iconos: ChevronDown, ChevronUp

**FooterSection**
- Pie de página con información corporativa
- Iconos: Mail, Phone, MapPin
- Grid responsive de 3 columnas

---

### 7. Sistema de Filtros

#### Tipos de Filtros

**1. Filtros de Búsqueda (searchFilters):**
- **Área:** Búsqueda libre de texto para puesto/cargo
- **Ubicación:** Búsqueda libre de texto para provincia/localidad

**2. Filtros por Categoría (selectedFilters):**
- **Sector:** Array de sectores seleccionados (ej: ["Tecnología", "Salud"])
- **Provincia:** Array de provincias seleccionadas
- **Localidad:** Array de localidades seleccionadas
- **Modalidad:** Array de modalidades seleccionadas (Remoto/Presencial/Híbrido)

#### Opciones de Filtros

**Sectores disponibles:**
- Tecnología, Salud, Educación, Finanzas, Comercio, Construcción, Turismo, Otros

**Provincias disponibles:**
- Buenos Aires, Córdoba, Santa Fe, Mendoza, Tucumán, Salta, Neuquén, Otras

**Localidades disponibles:**
- Capital Federal, La Plata, Rosario, Córdoba Capital, Mendoza Capital, San Miguel de Tucumán, Otras

**Modalidades disponibles:**
- Remoto, Presencial, Híbrido

#### Comportamiento de Filtros

**Acordeones:**
- Cada categoría se puede expandir/contraer
- Estado inicial: todos abiertos
- Iconos cambian según estado (ChevronUp/ChevronDown)

**Checkboxes:**
- Multi-selección permitida dentro de cada categoría
- Click en checkbox ya seleccionado lo deselecciona
- Hover effect en opciones para mejor UX

**Botón Limpiar Filtros:**
- Resetea todos los filtros seleccionados
- Estilo outline con borde naranja
- Hover invierte colores (fondo naranja, texto blanco)

---

### 8. Visualización de Ofertas

#### Estructura de una Oferta

**Datos mostrados:**
- Título del puesto (ej: "Desarrollador Full Stack")
- Nombre de la empresa (ej: "Empresa Tecnológica S.A.")
- Etiquetas/Tags:
  - Ubicación (provincia/localidad)
  - Modalidad de trabajo
  - Sector
- Fecha de publicación (formato relativo: "hace X días")
- Botón "Ver detalles"

#### Diseño Visual de Cards

**JobOffersSection (ofertas destacadas):**
- Fondo gris claro (#f2f2f2)
- Borde gris (#d9d9d9)
- Hover: borde naranja (#f46036)
- Layout flexible adaptable a mobile/desktop

**JobFiltersSection (ofertas filtradas):**
- Fondo blanco
- Sombra suave
- Borde gris con hover naranja
- Grid de 1 columna en móvil, 4 columnas en desktop (1 para filtros, 3 para ofertas)

#### Cantidad de Ofertas Mostradas

**Ofertas destacadas:** 3 ofertas iniciales
**Ofertas filtradas:** 6 ofertas en área principal
**Total visible inicial:** 9 ofertas

---

### 9. Diseño Visual y Responsive

#### Paleta de Colores

| Elemento | Color | Código Hex |
|----------|-------|------------|
| Header | Azul oscuro | `#05073c` |
| Fondo principal | Blanco | `#ffffff` |
| Fondo secundario | Gris claro | `#f2f2f2` |
| Texto principal | Azul oscuro | `#05073c` |
| Texto secundario | Gris oscuro | `#333333` |
| Texto terciario | Gris medio | `#666666` |
| Texto auxiliar | Gris claro | `#999999` |
| Borde | Gris | `#d9d9d9` |
| Acento primario | Naranja | `#f46036` |
| Acento secundario | Azul | `#0088ff` |
| Footer fondo | Azul oscuro | `#05073c` |
| Footer texto | Gris claro | `#d9d9d9` |

#### Tipografía

**Fuente:** Nunito (consistente con todas las pantallas)

**Pesos:**
- Normal (400): Texto general, labels
- Medium (500): Botones
- Semibold (600): Subtítulos, nombres de empresas
- Bold (700): Títulos principales

**Tamaños:**
- Título principal: 40px (desktop), 32px (mobile)
- Título sección: 24px
- Título oferta: 18-20px
- Texto general: 14-16px
- Texto pequeño: 12-14px

#### Layout y Espaciado

**Contenedor máximo:** 1200px
**Padding horizontal:** 24px (6 en Tailwind)
**Padding vertical:** 48px (12 en Tailwind)

**Gaps:**
- Entre secciones principales: 48px
- Entre elementos: 16-24px
- Dentro de cards: 16px

#### Breakpoints Responsive

**Mobile:** < 768px
- Layout de 1 columna
- Filtros y ofertas apilados verticalmente
- Barra de búsqueda apilada

**Desktop:** ≥ 768px
- Layout de múltiples columnas
- Barra de búsqueda horizontal
- Grid de 4 columnas (1 filtros + 3 ofertas)

**Ancho mínimo:** 1440px (especificado en componente principal)

---

### 10. Integración con Servicios

#### AuthService

**Archivo:** `src/services/auth.service.ts`

**Métodos utilizados:**

**`getUser(): UserData | null`**
- Obtiene información del usuario autenticado
- Usado en NavigationBarSection para mostrar nombre
- Retorna null si no hay usuario

**`logout(): void`**
- Limpia el usuario almacenado
- Limpia el token de autenticación
- Limpia credenciales de sessionStorage

**`saveUser(user: UserData): void`**
- Almacena información del usuario después del login
- Usado por Login.tsx al autenticar

#### Estructura del Usuario

```typescript
interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'candidate' | 'employer';
}
```

---

### 11. Interacciones del Usuario

#### Búsqueda

**Acción:** Usuario escribe en campos de búsqueda
**Efecto:**
- Se actualiza estado `searchFilters`
- Se muestra indicador de búsqueda activa en JobFiltersSection
- Formato: "Resultados para: **[área]** en **[ubicación]**"

**Acción:** Usuario hace click en botón "Buscar"
**Efecto esperado:** (Pendiente integración con backend)
- Filtrar ofertas según criterios
- Actualizar lista de ofertas mostradas

#### Filtrado

**Acción:** Usuario selecciona/deselecciona checkbox de filtro
**Efecto:**
- Toggle del valor en array de categoría correspondiente
- Actualización visual inmediata del checkbox
- (Pendiente) Filtrado de ofertas según criterios

**Acción:** Usuario hace click en "Limpiar filtros"
**Efecto esperado:** (Pendiente implementación)
- Resetear todos los arrays de selectedFilters a vacío
- Deseleccionar todos los checkboxes
- Mostrar todas las ofertas

#### Navegación

**Acción:** Usuario hace click en "Ver detalles" de una oferta
**Efecto esperado:** (Pendiente implementación)
- Navegar a pantalla de detalle de oferta
- Mostrar información completa de la oferta
- Permitir postulación

**Acción:** Usuario hace click en "Cerrar sesión"
**Efecto:**
- Llamada a `AuthService.logout()`
- Limpieza de credenciales en sessionStorage
- Navegación a `/login`

#### Acordeones de Filtros

**Acción:** Usuario hace click en título de categoría
**Efecto:**
- Toggle de estado abierto/cerrado
- Animación de expansión/contracción
- Cambio de icono (ChevronUp ↔ ChevronDown)

---

### 12. Estructura de Archivos

```
src/
├── pages/
│   ├── Login.tsx                            # Actualizado (recordar credenciales)
│   ├── home-candidato.tsx                   # Versión simple existente
│   ├── homecandidato.tsx                    # Nueva versión completa
│   └── sections/                            # Nueva carpeta
│       ├── NavigationBarSection.tsx         # Nuevo componente
│       ├── JobOffersSection.tsx             # Nuevo componente
│       ├── JobFiltersSection.tsx            # Nuevo componente
│       └── FooterSection.tsx                # Nuevo componente
├── components/
│   └── ui/
│       ├── header-logo.tsx                  # Reutilizado
│       ├── input.tsx                        # Reutilizado
│       └── button.tsx                       # Reutilizado
└── services/
    └── auth.service.ts                      # Utilizado para autenticación
```

---

### 13. Decisiones Técnicas

#### Arquitectura Modular

**Separación en secciones:**
- Cada sección es un componente independiente
- Facilita mantenimiento y testing
- Permite reutilización en otras pantallas
- Mejora organización del código

**Ventajas:**
- Código más legible y mantenible
- Responsabilidades claras por componente
- Facilita trabajo en equipo
- Permite lazy loading futuro

#### Estado Local vs. Global

**Estado local en HomeCandidato:**
- Filtros y búsquedas son locales a la pantalla
- No se necesita persistencia entre navegaciones
- Simplifica la arquitectura

**Futuras consideraciones:**
- Si se necesita compartir filtros con otras pantallas: usar Context API o Redux
- Si se necesita persistir filtros: agregar localStorage

#### SessionStorage para Credenciales

**Por qué sessionStorage y no localStorage:**
- Mayor seguridad: datos se borran al cerrar navegador
- Suficiente para el caso de uso (volver atrás en la navegación)
- No persiste entre sesiones

**Alternativas consideradas:**
- localStorage: más permanente pero menos seguro
- Cookies: overkill para este caso de uso
- Context API: no necesario solo para esta funcionalidad

#### Componentes de Sección

**Por qué crear carpeta sections/:**
- Organización clara de componentes específicos de la página
- Diferenciación con componentes UI reutilizables
- Escalabilidad para futuras pantallas con secciones

---

### 14. Pendientes de Implementación

**Integración con Backend:**
- Conectar búsqueda con API de ofertas
- Implementar filtrado real de ofertas
- Cargar ofertas dinámicamente desde backend
- Implementar paginación

**Funcionalidades:**
- Limpiar filtros (resetear estado)
- Ver detalles de oferta (navegación y nueva pantalla)
- Postularse a ofertas
- Guardar ofertas favoritas
- Historial de postulaciones

**Optimizaciones:**
- Debounce en campos de búsqueda
- Lazy loading de ofertas
- Caché de resultados
- Skeleton loaders durante carga

**Mejoras UX:**
- Animaciones de transición
- Loading states
- Empty states (sin resultados)
- Toast notifications para acciones
- Contadores de ofertas por filtro

---

### 15. Testing (Pendiente)

**Casos de prueba sugeridos:**

**Componentes:**
- Renderizado correcto de todas las secciones
- NavigationBarSection muestra usuario correcto
- Filtros se expanden/contraen correctamente
- Checkboxes funcionan correctamente

**Funcionalidad:**
- handleFilterChange agrega/remueve valores correctamente
- handleSearchFilterChange actualiza estado correcto
- Logout limpia credenciales y navega a login
- Credenciales se recuperan correctamente al volver

**Responsive:**
- Layout se adapta a mobile/desktop
- Todas las secciones son accesibles en mobile
- Imágenes y textos se ajustan correctamente

**Integración:**
- AuthService.getUser() retorna datos correctos
- AuthService.logout() limpia todo correctamente
- Navegación funciona entre todas las pantallas

---

### 16. Próximos Pasos

**Corto plazo:**
- Implementar funcionalidad de limpiar filtros
- Conectar con API real de ofertas
- Crear pantalla de detalle de oferta
- Implementar búsqueda y filtrado funcional

**Mediano plazo:**
- Agregar paginación de resultados
- Implementar sistema de postulaciones
- Agregar ofertas favoritas/guardadas
- Crear perfil de candidato editable

**Largo plazo:**
- Sistema de recomendaciones personalizadas
- Notificaciones de nuevas ofertas
- Chat con reclutadores
- Sistema de matching inteligente


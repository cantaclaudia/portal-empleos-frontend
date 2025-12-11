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

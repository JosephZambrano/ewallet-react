# eWallet App — Guía Maestra del Proyecto

> Documento de referencia para construir la aplicación paso a paso con React.  
> Cada fase explica **qué vamos a construir**, **por qué** y **qué conceptos aprenderás**.

---

## 🧭 Visión General

Una aplicación web de billetera financiera personal con:
- Autenticación real (registro + login con email/contraseña)
- Dashboard interactivo con gráficos de ingresos y gastos
- Registro y visualización de movimientos
- Programación de gastos y metas de ahorro
- Informes financieros con análisis
- Configuración de cuenta y perfil

**Inspiración visual:** Trust Wallet — minimalista, oscuro, moderno.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Por qué la usamos |
|------|-----------|-------------------|
| UI Framework | **React 18** | Librería más usada en la industria, componentes reutilizables |
| Build Tool | **Vite** | Más rápido que Create React App, estándar moderno |
| Estilos | **Tailwind CSS** | Utility-first, rápido de escribir, muy consistente |
| Routing | **React Router v6** | Navegación entre páginas sin recargar el navegador |
| Estado global | **Zustand** | Más simple que Redux, perfecto para apps medianas |
| Gráficos | **Recharts** | Librería de gráficos construida sobre React |
| Formularios | **React Hook Form** | Manejo de formularios con validación eficiente |
| Validación | **Zod** | Define y valida esquemas de datos (TypeScript-friendly) |
| Auth + DB | **Supabase** | Backend-as-a-service gratuito: auth + base de datos PostgreSQL |
| Íconos | **Lucide React** | Íconos SVG limpios y modernos |
| Fechas | **date-fns** | Manipulación de fechas sin complejidad |
| Notificaciones | **Sonner** | Toast notifications elegantes |

---

## 📁 Estructura de Carpetas

```
ewallet/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/              # Imágenes, SVGs estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes base (Button, Input, Card…)
│   │   ├── charts/          # Componentes de gráficos
│   │   └── layout/          # Sidebar, Header, Layout wrapper
│   ├── pages/               # Una carpeta por "pantalla"
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MovementsPage.jsx
│   │   ├── SchedulePage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── hooks/               # Custom hooks (lógica reutilizable)
│   │   ├── useAuth.js
│   │   ├── useTransactions.js
│   │   └── useScheduled.js
│   ├── store/               # Estado global con Zustand
│   │   ├── authStore.js
│   │   └── transactionStore.js
│   ├── lib/                 # Configuraciones de librerías externas
│   │   ├── supabase.js      # Cliente de Supabase
│   │   └── utils.js         # Funciones de utilidad
│   ├── services/            # Lógica de comunicación con la API/DB
│   │   ├── auth.service.js
│   │   └── transactions.service.js
│   ├── App.jsx              # Componente raíz + rutas
│   └── main.jsx             # Punto de entrada
├── .env                     # Variables de entorno (secretos)
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### 💡 Concepto: ¿Por qué esta estructura?

- **pages/** = cada archivo es una pantalla completa de la app
- **components/** = piezas pequeñas y reutilizables (un botón, una tarjeta)
- **hooks/** = lógica que varios componentes comparten (ej: "traer mis transacciones")
- **store/** = datos que necesitan estar disponibles en TODA la app simultáneamente
- **services/** = todo lo que habla con una API externa va aquí (separación de responsabilidades)

---

## 🗄️ Base de Datos — Supabase

### Tablas a crear en PostgreSQL

#### `profiles` (extiende la tabla `auth.users` de Supabase)
```sql
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT DEFAULT 'USD',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,        -- positivo=ingreso, negativo=gasto
  category    TEXT NOT NULL,
  type        TEXT CHECK (type IN ('income', 'expense')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `scheduled_items`
```sql
CREATE TABLE scheduled_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  type        TEXT CHECK (type IN ('expense', 'saving', 'income')),
  frequency   TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
  category    TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `saving_goals`
```sql
CREATE TABLE saving_goals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  target      NUMERIC(12, 2) NOT NULL,
  current     NUMERIC(12, 2) DEFAULT 0,
  color       TEXT DEFAULT '#3B82F6',
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 💡 Concepto: Row Level Security (RLS)
Supabase usa PostgreSQL con una función llamada **RLS** (seguridad a nivel de fila).
Significa que aunque dos usuarios usen la misma tabla `transactions`, cada uno **solo puede ver y modificar sus propios datos**. Lo configuraremos así:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política: solo puedes ver tus propias transacciones
CREATE POLICY "Users can only see their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🔐 Autenticación — Flujo Completo

### Pantallas de Auth

#### `/login` — LoginPage
- Email + contraseña
- Link "¿Olvidaste tu contraseña?" → flujo de reset
- Link "Crear cuenta"
- Validación en tiempo real con Zod + React Hook Form

#### `/register` — RegisterPage
- Nombre completo, email, contraseña, confirmar contraseña
- Validación: email válido, contraseña mínimo 8 caracteres, las dos contraseñas coinciden
- Al registrarse: crear usuario en `auth.users` + fila en `profiles`

### 💡 Conceptos de Auth
- **JWT (JSON Web Token):** cuando haces login, Supabase devuelve un token cifrado que prueba tu identidad en cada request
- **Session:** Supabase guarda la sesión en localStorage automáticamente
- **Protected Routes:** si intentas ir a `/dashboard` sin estar logueado, React Router te redirige a `/login`
- **onAuthStateChange:** listener que detecta si el usuario cierra sesión en otra pestaña

---

## 📱 Páginas y sus Responsabilidades

### 1. DashboardPage
**Datos que necesita:**
- Saldo total (suma de todas las transacciones del usuario)
- Ingresos del mes actual
- Gastos del mes actual
- Últimas 5 transacciones
- Distribución de gastos por categoría (para el donut)
- Ingresos vs gastos por mes (últimos 6 meses, para el bar chart)

**Conceptos que aprenderás:**
- `useEffect` + queries a Supabase
- Cálculos de agregación en JavaScript (`.reduce()`)
- Cómo pasar datos a Recharts
- Skeleton loaders mientras cargan los datos

### 2. MovementsPage
**Datos que necesita:**
- Todas las transacciones paginadas (50 por página)
- Filtros: tipo, categoría, rango de fechas, búsqueda por texto

**Conceptos que aprenderás:**
- Paginación con Supabase (`.range(from, to)`)
- Filtros dinámicos (construir query condicionalmente)
- `useMemo` para no recalcular filtros en cada render
- Debounce en el campo de búsqueda

### 3. SchedulePage
**Datos que necesita:**
- Lista de ítems programados del usuario
- Metas de ahorro con progreso

**Conceptos que aprenderás:**
- Formularios controlados vs no-controlados en React
- CRUD completo: crear, leer, actualizar, eliminar
- Optimistic updates (actualizar la UI antes de que el servidor confirme)

### 4. ReportsPage
**Datos que necesita:**
- Aggregaciones por mes (últimos 12 meses)
- Breakdown por categoría del mes seleccionado
- Tasa de ahorro calculada

**Conceptos que aprenderás:**
- `useMemo` para cálculos costosos
- Selector de período con `date-fns`
- Múltiples tipos de gráficos en Recharts (Area, Bar, Pie)

### 5. SettingsPage
**Datos que necesita:**
- Perfil del usuario (nombre, email, avatar)
- Preferencias (moneda, notificaciones)

**Conceptos que aprenderás:**
- Upload de imagen a Supabase Storage
- Actualización parcial de perfil
- Manejo de estado local vs global

---

## 🎨 Sistema de Diseño

### Paleta de colores (CSS variables en Tailwind config)
```js
colors: {
  bg: {
    primary:   '#0A0B0F',  // fondo principal
    secondary: '#13151C',  // sidebar, cards
    tertiary:  '#1C1F2A',  // hover states
    elevated:  '#252836',  // inputs, chips activos
  },
  accent: {
    blue:   '#3B82F6',   // acción principal
    green:  '#10B981',   // ingresos / positivo
    red:    '#EF4444',   // gastos / negativo / error
    amber:  '#F59E0B',   // advertencias / categoría
    purple: '#8B5CF6',   // categoría salud
  },
  text: {
    primary:   '#F1F5F9',
    secondary: '#94A3B8',
    muted:     '#475569',
  },
  border: {
    default: '#1E2333',
    strong:  '#2A2F42',
  }
}
```

### Tipografía
- **DM Sans** — texto general (limpio, moderno)
- **DM Mono** — números y montos (monoespaciado)

### Componentes UI base a crear en `components/ui/`
- `Button` — variantes: primary, ghost, danger; tamaños: sm, md, lg
- `Input` — con label, mensaje de error, ícono opcional
- `Card` — contenedor con borde sutil y border-radius
- `Badge` — pill con color semántico
- `Spinner` — loader animado
- `Modal` — overlay con contenido centrado
- `Avatar` — imagen de perfil con fallback de iniciales

---

## 🔄 Flujo de Estado Global (Zustand)

```
authStore
  ├── user: { id, email, full_name, avatar_url }
  ├── session: JWT session object
  ├── loading: boolean
  ├── setUser(user)
  ├── setSession(session)
  └── logout()

transactionStore
  ├── transactions: Transaction[]
  ├── loading: boolean
  ├── filters: { type, category, search, dateRange }
  ├── setTransactions(txs)
  ├── addTransaction(tx)
  ├── setFilters(filters)
  └── clearFilters()
```

### 💡 Concepto: ¿Cuándo usar estado global vs estado local?
- **Estado local (`useState`):** datos que solo usa ese componente (ej: si un modal está abierto)
- **Estado global (Zustand):** datos que necesitan múltiples páginas a la vez (ej: el usuario logueado, la lista de transacciones)

---

## 🗺️ Rutas de la Aplicación (React Router)

```
/                    → redirige a /dashboard si logueado, sino a /login
/login               → LoginPage (pública)
/register            → RegisterPage (pública)
/reset-password      → ResetPasswordPage (pública)
/dashboard           → DashboardPage (protegida)
/movements           → MovementsPage (protegida)
/schedule            → SchedulePage (protegida)
/reports             → ReportsPage (protegida)
/settings            → SettingsPage (protegida)
```

### 💡 Concepto: Protected Routes
```jsx
// Un wrapper que verifica si hay sesión activa
function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}
```

---

## 📦 Fases de Construcción

### Fase 1 — Setup del proyecto
1. Crear proyecto con Vite + React
2. Instalar todas las dependencias
3. Configurar Tailwind CSS con el sistema de diseño
4. Configurar Supabase (crear cuenta, proyecto, tablas)
5. Crear archivo `.env` con las claves de API
6. Estructura de carpetas base

**Aprenderás:** cómo iniciar un proyecto moderno desde cero, variables de entorno, por qué nunca commitear claves de API

### Fase 2 — Componentes UI base
1. Crear `Button`, `Input`, `Card`, `Badge`, `Spinner`
2. Crear el layout con sidebar + área de contenido
3. Implementar la navegación activa en el sidebar
4. Responsive design (sidebar colapsable en móvil)

**Aprenderás:** composición de componentes React, props y TypeScript básico, CSS responsive con Tailwind

### Fase 3 — Autenticación
1. Pantalla de Login con formulario validado
2. Pantalla de Registro
3. Integración con Supabase Auth
4. Protección de rutas
5. Persistencia de sesión al recargar la página
6. Flujo de reset de contraseña por email

**Aprenderás:** manejo de formularios, async/await, manejo de errores, localStorage, JWT básico

### Fase 4 — Dashboard
1. Conectar queries a Supabase
2. Calcular métricas (saldo, ingresos, gastos del mes)
3. Implementar gráfico de barras (Recharts)
4. Implementar gráfico de dona
5. Lista de últimas transacciones
6. Skeleton loaders

**Aprenderás:** useEffect, promesas, aggregación de datos, cómo funciona Recharts

### Fase 5 — Movimientos
1. Tabla/lista de transacciones con datos reales
2. Búsqueda con debounce
3. Filtros por tipo y categoría
4. Agregar nueva transacción (modal + formulario)
5. Editar y eliminar transacción

**Aprenderás:** CRUD completo, paginación, debounce, optimistic UI

### Fase 6 — Programar
1. Formulario para crear ítems recurrentes
2. Lista de programados con toggle activo/inactivo
3. Metas de ahorro con barras de progreso
4. Editar y eliminar programados

**Aprenderás:** formularios más complejos, operaciones PATCH/PUT, UI de progreso

### Fase 7 — Informes
1. Selector de período (mes/año)
2. Gráfico de área de tendencia
3. Breakdown por categoría
4. KPIs calculados dinámicamente
5. Exportar a PDF (básico con `window.print()`)

**Aprenderás:** `useMemo`, manipulación de fechas con date-fns, lógica de reportes

### Fase 8 — Configuración
1. Editar nombre y moneda
2. Upload de foto de perfil (Supabase Storage)
3. Cambio de contraseña
4. Cerrar sesión

**Aprenderás:** file upload, Supabase Storage, actualización de usuario

### Fase 9 — Pulido final
1. Animaciones con Framer Motion
2. Dark/light mode toggle
3. PWA básica (instalar en móvil)
4. Performance: lazy loading de páginas
5. Deploy en Vercel

**Aprenderás:** animaciones en React, code splitting, deploy, dominio personalizado

---

## ⚙️ Variables de Entorno (.env)

```bash
# Nunca subir este archivo a GitHub
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### 💡 Concepto: Variables de Entorno
Son valores que cambian según el entorno (desarrollo, producción) o que son secretos. En Vite, las variables que empiezan con `VITE_` son accesibles en el código del navegador. Las claves que NO deben estar en el frontend nunca empiezan con `VITE_`.

---

## 🧪 Convenciones de Código

### Nombrado
- Componentes: `PascalCase` → `TransactionCard.jsx`
- Hooks: `camelCase` con prefijo `use` → `useTransactions.js`
- Stores: `camelCase` con sufijo `Store` → `authStore.js`
- Servicios: `camelCase` con sufijo `.service` → `auth.service.js`
- CSS classes: usar Tailwind directamente, no crear clases custom salvo en `globals.css`

### Estructura de un componente
```jsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

// 2. Tipos/PropTypes (si usamos TypeScript)

// 3. Constantes del módulo (fuera del componente)
const CATEGORIES = ['Comida', 'Transporte', ...]

// 4. El componente
export function TransactionCard({ transaction, onDelete }) {
  // 4a. Hooks primero
  const [isExpanded, setIsExpanded] = useState(false)

  // 4b. Derived state / memoized values

  // 4c. Handlers
  const handleDelete = () => onDelete(transaction.id)

  // 4d. JSX
  return (
    <div>...</div>
  )
}
```

---

## 📋 Checklist de Inicio Rápido

Antes de escribir la primera línea de código, necesitamos:

- [ ] Node.js instalado (v18 o superior) → `node --version`
- [ ] npm o pnpm instalado → `npm --version`
- [ ] Cuenta en [supabase.com](https://supabase.com) (gratis)
- [ ] Cuenta en [vercel.com](https://vercel.com) (gratis, para deploy)
- [ ] Editor: VS Code con extensiones → ESLint, Tailwind CSS IntelliSense, Prettier
- [ ] Git instalado y configurado

---

## 🚀 Comando de inicio

Una vez que tengas Node instalado, el proyecto se crea con:

```bash
npm create vite@latest ewallet -- --template react
cd ewallet
npm install
npm run dev
```

Esto levanta la app en `http://localhost:5173`

---

*Guía versión 1.0 — eWallet App con React + Supabase*
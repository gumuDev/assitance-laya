# Guía de Configuración - Sistema de Asistencia

## 1. Configuración de Supabase

### Paso 1: Crear un proyecto en Supabase

1. Ve a [Supabase](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales del proyecto (URL y anon key)

### Paso 2: Ejecutar las migraciones

1. Ve al SQL Editor en el dashboard de Supabase
2. Abre el archivo `supabase/migrations/001_create_classes_table.sql`
3. Copia y pega el contenido en el SQL Editor
4. Ejecuta el script (Run)

Esto creará:
- La tabla `classes`
- Índices para optimización
- Trigger para actualizar `updated_at` automáticamente
- Políticas de Row Level Security (RLS)

### Paso 3: Configurar variables de entorno

1. Copia el archivo `.env` en la raíz del proyecto
2. Actualiza las variables con tus credenciales de Supabase:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Puedes encontrar estas credenciales en:
- Dashboard de Supabase → Settings → API

## 2. Instalación del Proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 3. Estructura del Proyecto

```
attendance-system/
├── src/
│   ├── pages/
│   │   └── classes/          # Módulo de Clases
│   │       ├── list.tsx      # Lista de clases
│   │       ├── create.tsx    # Crear clase
│   │       ├── edit.tsx      # Editar clase
│   │       └── show.tsx      # Ver detalle clase
│   ├── interfaces/           # Interfaces TypeScript
│   ├── utility/
│   │   └── supabaseClient.ts # Cliente de Supabase
│   └── App.tsx               # Configuración principal
├── supabase/
│   └── migrations/           # Scripts SQL
└── .env                      # Variables de entorno
```

## 4. Funcionalidades Implementadas - Módulo 1: Clases

✅ **Lista de Clases**
- Ver todas las clases en una tabla
- Ordenar por nombre, número o fecha
- Botones de acción (Ver, Editar, Eliminar)

✅ **Crear Clase**
- Formulario con validaciones
- Campos: Nombre y Número de Clase
- Generación automática de ID y timestamps

✅ **Editar Clase**
- Cargar datos existentes
- Actualizar información
- Validaciones en tiempo real

✅ **Ver Detalle de Clase**
- Mostrar toda la información de la clase
- Formato de fechas en español

## 5. Próximos Pasos

Según el plan del proyecto (PROJECT_SCAFFOLD.md), los próximos módulos son:

- **Módulo 2**: Gestión de Maestros (con generación de QR)
- **Módulo 3**: Gestión de Miembros (con generación de QR)
- **Módulo 4**: Registrar Asistencia (escaneo QR)
- **Módulo 5**: Historial de Asistencia (reportes)

## 6. Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## 7. Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Refine** - Framework para admin panels
- **Ant Design** - Componentes UI
- **Supabase** - Backend as a Service
- **React Router** - Navegación

## Soporte

Para más información consulta el archivo `PROJECT_SCAFFOLD.md` que contiene toda la documentación del proyecto.

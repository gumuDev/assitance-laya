# Datos de Prueba (Mockup Data)

Este folder contiene datos de prueba para el sistema de asistencia.

## 📋 Contenido

### `seed_data.sql`
Archivo SQL con datos mock que incluye:

- **2 Clases**:
  - 📚 **Matemáticas Avanzadas** (MAT-301) - Sábados 9:00-12:00
  - 📖 **Historia Universal** (HIS-201) - Domingos 10:00-13:00

- **12 Miembros** (6 por clase):
  - Variedad de patrones de asistencia (desde 100% hasta 20%)
  - Nombres y apellidos realistas

- **~50 Registros de Asistencia**:
  - 5 semanas de datos históricos
  - Fechas calculadas dinámicamente según la fecha actual
  - Horarios aleatorios dentro del rango permitido por cada clase

## 🚀 Cómo usar

### Opción 1: Desde Supabase Dashboard

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `seed_data.sql`
4. Haz click en **Run**

### Opción 2: Desde la línea de comandos

```bash
# Asegúrate de estar en el directorio del proyecto
cd attendance-system

# Ejecuta el script SQL
psql -h [TU_HOST] -U [TU_USUARIO] -d [TU_DATABASE] -f supabase/mockup/seed_data.sql
```

### Opción 3: Usando Supabase CLI

```bash
supabase db reset --db-url [TU_CONNECTION_STRING]
# Luego ejecuta las migraciones y el seed
```

## 📊 Datos Generados

### Clase: Matemáticas Avanzadas

| Nombre | Asistencia | Faltas |
|--------|-----------|--------|
| Carlos Rodríguez | 100% | 0 |
| Laura Fernández | 100% | 0 |
| María González | 80% | 1 |
| Juan Martínez | 60% | 2 |
| Ana López | 40% | 3 |
| Pedro Sánchez | 20% | 4 |

### Clase: Historia Universal

| Nombre | Asistencia | Faltas |
|--------|-----------|--------|
| Roberto Díaz | 100% | 0 |
| Isabel Morales | 100% | 0 |
| Carmen Ruiz | 80% | 1 |
| Sofía Ramírez | 80% | 1 |
| Diego Torres | 60% | 2 |
| Miguel Vargas | 40% | 3 |

## 🎯 Qué podrás ver en los reportes

Con estos datos podrás probar:

### ✅ Rankings
- Ver el top 10 de clases por asistencia
- Ver el top 10 de miembros por asistencia
- Filtrar por clase, tipo, persona

### 📈 Gráficos
- Gráfico de barras: distribución por clase
- Gráfico de líneas: tendencia en el tiempo
- Gráfico circular: maestros vs miembros

### 📋 Asistencia por Clase
- Seleccionar una clase específica
- Ver detalle de cada miembro con:
  - Días asistidos ✅
  - Días faltados ❌
  - Porcentaje de asistencia
- Expandir filas para ver fechas específicas en español e inglés

## 🗑️ Limpiar datos

Si quieres eliminar los datos de prueba:

```sql
-- Eliminar asistencias
DELETE FROM attendance WHERE class_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
);

-- Eliminar miembros
DELETE FROM members WHERE class_id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
);

-- Eliminar clases
DELETE FROM classes WHERE id IN (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e'
);
```

## 📝 Notas

- Las fechas se calculan dinámicamente basadas en `CURRENT_DATE`
- Los horarios de asistencia son aleatorios dentro del rango permitido
- Los UUIDs son fijos para facilitar referencias y limpieza
- Los códigos QR son únicos para cada miembro

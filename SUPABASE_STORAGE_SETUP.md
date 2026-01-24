# 📸 Configuración de Supabase Storage para Galería de Imágenes

## Pasos para configurar el almacenamiento de imágenes

### 1. Acceder a Supabase Dashboard
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu proyecto
3. Selecciona tu proyecto de portfolio

### 2. Crear el Bucket de Storage
1. En el menú lateral, haz clic en **Storage**
2. Haz clic en **"Create a new bucket"** o **"New Bucket"**
3. Configura el bucket con estos datos:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ **Activado** (muy importante para que las imágenes sean accesibles públicamente)
   - Haz clic en **"Create bucket"**

### 3. Configurar Políticas de Acceso (RLS Policies)

Por defecto, el bucket estará protegido. Necesitas crear políticas para permitir:

#### Política 1: Permitir lectura pública (GET)
1. En la página de Storage, selecciona el bucket `blog-images`
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"New Policy"**
4. Selecciona **"For full customization"** o crea una política personalizada
5. Configura:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT` (o marca la opción de lectura)
   - **Target roles**: `public` (o `anon`)
   - **Policy definition**: 
   ```sql
   true
   ```
   O usa el editor visual y selecciona "Allow all"
6. Guarda la política

#### Política 2: Permitir subida para usuarios autenticados (INSERT)
1. Crea otra política nueva
2. Configura:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: `INSERT` (o marca la opción de inserción/upload)
   - **Target roles**: `authenticated` o `anon` (si quieres permitir subidas sin autenticación)
   - **Policy definition**: 
   ```sql
   true
   ```
3. Guarda la política

### 4. Actualizar la Base de Datos

Necesitas agregar la columna `gallery_images` a tu tabla `blogs`:

1. Ve a **SQL Editor** en el menú lateral
2. Ejecuta este comando SQL:

```sql
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
```

3. Haz clic en **"Run"** para ejecutar

### 5. Verificar la Configuración

Para verificar que todo funciona:

1. Ve a **Storage** → `blog-images`
2. Intenta subir una imagen de prueba manualmente
3. Haz clic derecho en la imagen → **"Copy URL"**
4. Pega la URL en una nueva pestaña del navegador
5. Si ves la imagen, ¡todo está configurado correctamente! ✅

## 🎨 Cómo usar la galería en el Admin

1. Ve a `/admin` en tu aplicación
2. Crea o edita un blog post
3. Desplázate hasta la sección **"📸 Galería True Crime"**
4. Haz clic en **"Subir Imágenes de Galería"**
5. Selecciona una o varias imágenes desde tu computadora
6. Las imágenes se subirán automáticamente a Supabase
7. Verás una vista previa de las imágenes
8. Puedes eliminar imágenes haciendo clic en la X
9. Guarda el post

## 🔍 Resultado Final

Las imágenes aparecerán al final del artículo con un estilo "true crime":
- Imágenes superpuestas como fotos de archivo
- Rotación aleatoria para efecto desordenado
- Efecto polaroid con marco blanco
- Etiqueta "EVIDENCE #X" en cada foto
- Animación al hacer hover
- Efecto de cinta adhesiva en la parte superior

## ⚠️ Notas Importantes

- **Tamaño de archivos**: Supabase tiene límites de almacenamiento según tu plan
- **Formatos soportados**: JPG, PNG, WebP, GIF
- **Optimización**: Considera comprimir las imágenes antes de subirlas para mejor rendimiento
- **Backup**: Las imágenes se almacenan en Supabase, no en tu repositorio Git

## 🐛 Solución de Problemas

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el bucket sea público

### Error: "Bucket not found"
- Verifica que el nombre del bucket sea exactamente `blog-images`
- Revisa que el bucket esté creado en el proyecto correcto

### Las imágenes no se ven
- Verifica que el bucket sea público
- Revisa la política de lectura pública
- Comprueba la URL de la imagen en el navegador

### Error al subir imágenes
- Verifica la política de INSERT
- Revisa el tamaño del archivo (límite de Supabase)
- Comprueba la consola del navegador para más detalles

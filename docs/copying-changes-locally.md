# Cómo probar localmente los cambios del endpoint de sabores

Sigue estos pasos para traer a tu entorno local las modificaciones que hicimos en esta rama y ejecutarlas junto con tu proyecto actual.

1. **Actualiza tu copia del repositorio**
   - Si todavía no tienes este repositorio, clónalo: `git clone <URL-de-tu-repo>`
   - Si ya lo tienes, entra a la carpeta y asegúrate de estar en la rama correcta: `git checkout <nombre-de-tu-rama>`
   - Trae los cambios del servidor: `git pull`

2. **Copia los archivos modificados**
   - Los ajustes del endpoint viven en:
     - `src/routes/products.routes.js`
     - `src/controllers/products.controller.js`
     - `src/services/products.services.js`
   - Puedes copiar estos archivos directamente sobre los de tu proyecto o usar `git diff` para revisar cada cambio antes de aplicarlo.

3. **Instala dependencias si hacen falta**
   - Desde la raíz del proyecto ejecuta `npm install` para asegurarte de tener los paquetes actualizados.

4. **Configura las variables de entorno**
   - Revisa que tu archivo `.env` local tenga la misma configuración que usas actualmente (por ejemplo, URL de la base de datos, puertos, claves, etc.).

5. **Ejecuta la API localmente**
   - Inicia el servidor con `npm run dev` o el script que utilices normalmente.
   - Verifica en la consola que la aplicación levante sin errores.

6. **Prueba el endpoint**
   - Usa herramientas como Postman, Insomnia o `curl` para enviar la petición PATCH al endpoint `/api/v1/products/:productId/flavors/:flavorId/availability` con el body `{ "storeId": "<ID_TIENDA>", "available": true }` (cambia a `false` según necesites).
   - Confirma que la respuesta devuelva el estado actualizado.

7. **Integra el front-end**
   - Si tu front ya tiene la llamada lista, apunta la URL al servidor local y prueba cambiando entre `true` y `false`.

> Consejo: si prefieres no copiar archivos manualmente, puedes crear una rama en tu repositorio local y hacer `git cherry-pick <hash-del-commit>` para traer el commit específico con estos cambios.


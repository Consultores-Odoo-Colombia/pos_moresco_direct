# Instrucciones de instalación

## Instalación rápida

### 1. Copiar el módulo a Odoo
```bash
cd /ruta/a/odoo/custom_addons
# El módulo debe quedar en: custom_addons/pos_moresco_direct/
```

### 2. Reiniciar Odoo
```bash
# Modo desarrollo
./odoo-bin -c odoo.conf -u pos_moresco_direct --dev=all

# O reiniciar el servicio
sudo systemctl restart odoo
```

### 3. Actualizar la lista de aplicaciones
- Ir a **Aplicaciones**
- Hacer clic en **Actualizar lista de aplicaciones**
- Buscar "Moresco"
- Hacer clic en **Instalar**

### 4. Configurar el Punto de Venta
- **Punto de Venta → Configuración → Ajustes**
- En **Dispositivos conectados**, activar **"Moresco HY-918 (USB-RS232)"**
- Guardar

### 5. Permisos en Linux (¡Importante!)
```bash
# Agregar tu usuario al grupo del puerto serie
sudo usermod -a -G uucp $USER
# O (Ubuntu/Debian):
sudo usermod -a -G dialout $USER

# CERRAR SESIÓN y volver a entrar para que aplique
```

### 6. Configurar la báscula
- Código: `96814` + botón `TARA`
- Modo: **Continuo**
- Baud: **9600**
- Datos: **8**
- Paridad: **Ninguna**
- Stop: **1**

### 7. Probar la conexión
- Abrir una sesión del POS (en Chrome o Edge)
- Agregar un producto pesable
- Presionar **Ctrl+B** y seleccionar el puerto serie cuando se solicite
- Colocar peso sobre la báscula
- El peso debe aparecer en el indicador

## Opciones de línea de comandos de Odoo

### Instalar el módulo
```bash
./odoo-bin -c odoo.conf -i pos_moresco_direct
```

### Actualizar el módulo
```bash
./odoo-bin -c odoo.conf -u pos_moresco_direct
```

### Modo desarrollo con recarga automática
```bash
./odoo-bin -c odoo.conf -u pos_moresco_direct --dev=all
```

## Cloudcluster / alojamiento en la nube

Si usas Cloudcluster u otro alojamiento:

1. Subir el módulo vía SFTP/Git
2. Ruta: `/opt/odoo/custom_addons/pos_moresco_direct/`
3. Actualizar en Aplicaciones
4. La báscula debe estar conectada a tu PC local (no al servidor)
5. El navegador en tu PC pedirá permiso para el puerto USB

## Solución de problemas de instalación

### El módulo no aparece
```bash
# Verificar la ruta del módulo
ls -la /ruta/a/odoo/custom_addons/pos_moresco_direct/

# Verificar que existe __manifest__.py
cat custom_addons/pos_moresco_direct/__manifest__.py

# Reiniciar Odoo completamente
sudo systemctl restart odoo

# O terminar el proceso y arrancar de nuevo
ps aux | grep odoo
kill -9 <PID>
./odoo-bin -c odoo.conf
```

### Permiso denegado al instalar
```bash
# Corregir permisos de archivos
sudo chown -R odoo:odoo /ruta/a/odoo/custom_addons/pos_moresco_direct/
sudo chmod -R 755 /ruta/a/odoo/custom_addons/pos_moresco_direct/
```

### Errores de importación
```bash
# Verificar la sintaxis de Python
python3 -m py_compile models/pos_config.py

# Verificar que existen los archivos __init__.py
find . -name "__init__.py"
```

## Desinstalar

```bash
# Desde la interfaz: Aplicaciones > Moresco > Desinstalar

# Desde la línea de comandos:
./odoo-bin -c odoo.conf shell
>>> env['ir.module.module'].search([('name','=','pos_moresco_direct')]).button_immediate_uninstall()
```

## Entorno de desarrollo

### Activar el modo desarrollador
- Ajustes > Activar modo desarrollador
- O agregar a la URL: `?debug=1`

### Observar cambios en JS/XML
```bash
# Odoo 18 recarga los assets automáticamente en modo debug
# Solo refresca el navegador tras cambiar archivos JS/XML
```

### Depurar JavaScript
- Abrir las herramientas de desarrollo del navegador (F12)
- Pestaña Consola
- Buscar mensajes "Moresco"
- Revisar los registros del puerto serie

### Probar sin hardware
```bash
# Crear puertos serie virtuales (Linux)
socat -d -d pty,raw,echo=0 pty,raw,echo=0
# Crea dos puertos enlazados; envía datos a uno para recibir en el otro
```

## Verificación de requisitos

Dependencias de Python: ninguna (solo Odoo/JavaScript)

Verificación del navegador:
```javascript
// Abrir la consola del navegador y ejecutar:
if ('serial' in navigator) {
    console.log('✅ Web Serial API soportada');
} else {
    console.log('❌ Web Serial API NO soportada');
}
```

## Soporte

Ante cualquier problema, revisar:
1. README.md - Documentación completa
2. USAGE.md - Guía rápida de uso
3. CONFIG_EXAMPLES.py - Ejemplos de configuración
4. Registros de Odoo: `/var/log/odoo/odoo-server.log`
5. Consola del navegador: F12 > Consola

## Siguientes pasos

Después de la instalación:
1. Configurar un producto de prueba como pesable
2. Probar con la báscula conectada
3. Capacitar a los usuarios en el uso de la báscula y los atajos de teclado
4. Considerar activar la lectura automática para usuarios experimentados
5. Documentar la configuración específica de tu báscula

¡A pesar se ha dicho! 🎯

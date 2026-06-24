# -*- coding: utf-8 -*-
"""
Ejemplos de configuración de la báscula Moresco

Este archivo muestra distintos escenarios de configuración para la báscula Moresco HY-918.
"""

# ==========================================
# ESCENARIO 1: Moresco HY-918 estándar
# ==========================================
# Configuración más común para la Moresco HY-918

MORESCO_STANDARD = {
    'baud_rate': 9600,
    'data_bits': 8,
    'stop_bits': 1,
    'parity': 'none',
    'flow_control': 'none',
}

# Formato de datos enviado por la báscula:
# "ST,GS,+  1.500kg\r\n"
# o
# "  1.500 kg\n"


# ==========================================
# ESCENARIO 2: Moresco con otra velocidad (baud rate)
# ==========================================
# Algunas configuraciones usan velocidades más altas

MORESCO_FAST = {
    'baud_rate': 19200,  # o 38400
    'data_bits': 8,
    'stop_bits': 1,
    'parity': 'none',
    'flow_control': 'none',
}


# ==========================================
# ESCENARIO 3: Báscula RS232 genérica
# ==========================================
# Para básculas no Moresco que usan un protocolo similar

GENERIC_SCALE = {
    'baud_rate': 9600,
    'data_bits': 7,
    'stop_bits': 1,
    'parity': 'even',
    'flow_control': 'none',
}


# ==========================================
# ESCENARIO 4: Protocolo Mettler Toledo
# ==========================================
# Si adaptaste este módulo para Mettler Toledo

METTLER_TOLEDO = {
    'baud_rate': 9600,
    'data_bits': 8,
    'stop_bits': 1,
    'parity': 'none',
    'flow_control': 'none',
}
# Formato de datos: "S S   0.123kg\r\n"


# ==========================================
# Comandos de detección de puertos en Linux
# ==========================================
"""
# Listar dispositivos seriales
dmesg | grep tty

# Ver dispositivos USB
lsusb

# Revisar permisos del puerto
ls -l /dev/ttyUSB*

# Agregar el usuario al grupo serial (Arch Linux)
sudo usermod -a -G uucp $USER

# Agregar el usuario al grupo serial (Ubuntu/Debian)
sudo usermod -a -G dialout $USER

# Probar la lectura del puerto manualmente
cat /dev/ttyUSB0

# Monitorear la comunicación serial (requiere minicom)
minicom -D /dev/ttyUSB0 -b 9600

# Script de prueba en Python
python3 -c "import serial; port = serial.Serial('/dev/ttyUSB0', 9600); print(port.readline())"
"""


# ==========================================
# Detección de puertos en Windows
# ==========================================
"""
# PowerShell: listar puertos COM
Get-WmiObject -Class Win32_SerialPort | Select-Object DeviceID, Description

# O en CMD:
mode

# Revisar el administrador de dispositivos:
devmgmt.msc

# Puertos comunes: COM1, COM3, COM4, etc.
"""


# ==========================================
# Solución de problemas: códigos de configuración de la báscula
# ==========================================
"""
Configuración de la Moresco HY-918:

1. Entrar al modo de configuración: 96814 + TARA (o botón C)

2. Navegar el menú:
   - Type/Mode: seleccionar "Cont" (Continuo) o "Host"
   - Baud: 9600
   - Data: 8
   - Parity: None (N)
   - Stop: 1

3. Guardar y salir

Secuencias de configuración comunes:
- 96814C = entrar a configuración
- 96810 = modo de pantalla
- 96811 = modo de comunicación
- 96812 = ajustes de unidad
- 96813 = calibración (requiere contraseña)
"""


# ==========================================
# Ejemplos de análisis de formatos de datos
# ==========================================
"""
Distintas básculas envían distintos formatos:

Formato 1 (estándar Moresco):
    Crudo: "ST,GS,+  1.500kg\r\n"
    Análisis: quitar "ST,GS,", "kg", espacios → 1.500

Formato 2 (simple):
    Crudo: "  1.500 kg\n"
    Análisis: quitar "kg", espacios → 1.500

Formato 3 (solo numérico):
    Crudo: "+001500\r\n"
    Análisis: dividir entre 1000 → 1.500 (si está en gramos)

Formato 4 (con estado):
    Crudo: "ST  +1.500kg\r\n"
    Análisis: extraer el número → 1.500
    Códigos de estado:
    - ST = Estable
    - US = Inestable
    - OL = Sobrecarga
"""


# ==========================================
# Compatibilidad de navegadores con Web Serial API
# ==========================================
"""
Chrome/Chromium: ✅ Soportado (v89+)
Edge: ✅ Soportado (basado en Chromium)
Firefox: ❌ No soportado (hay una bandera experimental)
Safari: ❌ No soportado
Opera: ✅ Soportado (basado en Chromium)

Activar en Chrome:
- Ya está activado por defecto

Activar en Firefox (experimental):
- about:config
- Poner dom.serial.enabled = true
- Reiniciar el navegador
- Funcionalidad aún limitada

Banderas de Chromium (si hay problemas):
- chrome://flags/#enable-experimental-web-platform-features
"""


# ==========================================
# Consideraciones de seguridad
# ==========================================
"""
Seguridad de la Web Serial API:

1. Se requiere permiso del usuario
   - El navegador muestra un diálogo la primera vez
   - El usuario debe seleccionar el puerto explícitamente
   - El permiso es por origen (per-origin)

2. Requisito de HTTPS
   - Los sitios en producción deben usar HTTPS
   - localhost se permite para desarrollo
   - Usar certificado SSL para pruebas locales si es necesario

3. Política de mismo origen (same-origin)
   - No se puede acceder a puertos desde otros dominios
   - Las solicitudes de origen cruzado se bloquean

4. Permisos en Linux
   - El usuario debe estar en el grupo correcto (uucp/dialout)
   - Los permisos del archivo del dispositivo importan
   - No se recomienda sudo para aplicaciones web
"""


# ==========================================
# Consejos de rendimiento
# ==========================================
"""
1. Mantener el puerto abierto durante la sesión
   - No abrir/cerrar repetidamente
   - Reutilizar la conexión cuando sea posible

2. Manejo del búfer
   - Leer líneas completas (\r\n o \n)
   - Manejar correctamente las lecturas parciales

3. Tiempos de espera
   - Establecer un timeout de lectura razonable (2-3 segundos)
   - Manejar el timeout de forma controlada

4. Recuperación ante errores
   - Reconectar al perder la conexión
   - Limpiar los búferes ante errores
   - Mostrar mensajes de error útiles al usuario

5. Modo de lectura automática
   - Usar solo con usuarios capacitados
   - Puede confundir a principiantes
   - Es mejor usar primero el botón manual
"""

# PoS Moresco Direct Connect

## Descripción

Módulo para Odoo 18 Community Edition que conecta una báscula **Moresco HY-918** al Punto de Venta **directamente desde el navegador** mediante la **API JavaScript Web Serial**, usando un adaptador USB-RS232. **No requiere IoT Box** ni software intermedio. Incluye además una navegación completa por teclado para operar el POS sin mouse.

## Características

- ✅ Lectura de la báscula vía **Web Serial API** (sin IoT Box, sin proxy)
- ✅ Compatible con la báscula Moresco HY-918
- ✅ Lectura automática o manual del peso
- ✅ Reconexión automática y monitoreo persistente de la conexión
- ✅ Navegación 100% por teclado (sin mouse)
- ✅ Modo simulación (peso fijo o aleatorio) para pruebas sin hardware
- ✅ Configuración flexible de parámetros seriales
- ✅ Funciona con Odoo Community Edition, también alojado en la nube

## Requisitos

### Hardware
- Báscula Moresco HY-918
- Adaptador USB a RS232 (preferiblemente con chip FTDI o Prolific)
- Cable serial RS232

### Software
- Odoo 18 Community o Enterprise Edition
- Navegador compatible con Web Serial API: **Google Chrome** o **Microsoft Edge** 89 o superior

> **Nota:** La Web Serial API solo está disponible en navegadores basados en Chromium (Chrome, Edge, Opera). No funciona en Firefox ni Safari.

### Conectividad de hardware
- Báscula HY-918 → cable RS232 → adaptador USB-RS232 → equipo donde corre el navegador del POS

## Instalación

1. Copiar el módulo a la carpeta `custom_addons`:
```bash
cd /ruta/a/odoo/custom_addons
git clone <repositorio> pos_moresco_direct
# O copiar manualmente la carpeta
```

2. Actualizar la lista de módulos en Odoo:
   - Ir a **Aplicaciones**
   - Activar el **Modo desarrollador**
   - Hacer clic en **Actualizar lista de aplicaciones**

3. Buscar e instalar **"PoS Moresco Direct Connect"**

## Configuración

### 1. Configurar la báscula Moresco HY-918

La báscula debe estar en **modo continuo** para enviar datos constantemente:

1. Encender la báscula
2. Entrar al código de configuración: **`96814`** + **`TARA`** (o tecla **`C`**)
3. Buscar la opción de comunicación:
   - **Type/Mode**: seleccionar **`Cont`** (continuo) o **`Host`**
   - **Baud Rate**: **9600**
   - **Data Bits**: **8**
   - **Parity**: **None** (N)
   - **Stop Bits**: **1**
4. Guardar la configuración y salir

Parámetros típicos: **9600 8N1**

### 2. Conectar la báscula al equipo

1. Conectar la báscula al adaptador USB-RS232
2. Conectar el adaptador USB al equipo donde se ejecuta el navegador del POS
3. Verificar que el sistema operativo reconoce el dispositivo serial

### 3. Activar la báscula en Odoo

1. Ir a **Punto de Venta → Configuración → Ajustes**
2. En la sección **Dispositivos conectados**, activar **"Moresco HY-918 (USB-RS232)"**
3. Configurar los parámetros (usar los valores por defecto si no estás seguro):
   - **Baud Rate**: 9600
   - **Data Bits**: 8
   - **Stop Bits**: 1
   - **Parity**: None
   - Opcional: activar **"Auto Read"** para la lectura automática del peso
   - Opcional: activar **"Simulation Mode"** para pruebas sin báscula física
4. Guardar

### 4. Configurar productos pesables

Para cada producto que requiera pesaje:

1. Ir a **Productos**
2. Seleccionar el producto
3. Marcar **"Para pesar"** (To Weigh)
4. Unidad de medida: **kg** o **g**
5. Guardar

## Uso

### Conexión de la báscula

1. Abrir una sesión del Punto de Venta en **Chrome** o **Edge**
2. Presionar **Ctrl+B** (o hacer clic en el indicador de báscula de la barra superior)
3. Seleccionar el puerto serie de la báscula en el diálogo del navegador
4. El indicador mostrará el peso en vivo

> La autorización del puerto se recuerda: en las siguientes aperturas el módulo **reconecta automáticamente** sin volver a pedir el puerto.

### Modo manual

1. Agregar un producto pesable al carrito
2. Colocar el producto sobre la báscula
3. Usar el botón/atajo de lectura de peso
4. El peso se aplica a la línea seleccionada

### Modo automático

Si activaste **"Auto Read"**:

1. Al agregar un producto pesable
2. El peso se lee y se aplica automáticamente sin clics adicionales

## Navegación por teclado (sin mouse)

Este módulo incluye un sistema completo de navegación por teclado que permite al cajero operar el punto de venta **sin usar el mouse**.

### Atajos de teclado

| Tecla | Acción |
|-------|--------|
| **Escribir código/nombre** | Busca automáticamente productos |
| **Enter** | Selecciona el primer producto y lo agrega al carrito (con búsqueda activa) |
| **↑ / ↓** | Navega entre los productos visibles |
| **Tab** | Limpia la búsqueda y prepara para el siguiente producto |
| **F2** o **Esc** | Regresa a la barra de búsqueda |
| **Supr** o **Retroceso** | Elimina el último producto del carrito (con búsqueda vacía) |
| **F12** | Ir a la pantalla de pago |
| **Ctrl+B** | Conectar/reconectar la báscula (rara vez necesario) |
| **Alt+B** | Enfocar la barra de búsqueda |

#### En la pantalla de pago

| Tecla | Acción |
|-------|--------|
| **↑ / ↓** | Navega entre métodos de pago |
| **Enter** | Selecciona el método de pago / valida la orden si está pagada |

#### En la pantalla de recibo

| Tecla | Acción |
|-------|--------|
| **Enter** | Nueva orden (siguiente venta) |

> **Nota:** El cursor regresa automáticamente al campo de búsqueda después de crear una nueva orden, permitiendo continuar el flujo de trabajo sin usar el mouse.

### Flujo de trabajo recomendado

1. **Escanear o digitar** el código de barras del producto
2. **Presionar Enter** → el producto se agrega automáticamente al carrito
3. Si el producto es pesable, colocarlo en la báscula: el peso se lee y aplica automáticamente
4. **Presionar Tab** → limpia la búsqueda para el siguiente producto
5. Repetir el proceso
6. **Presionar F12** → ir a pagar cuando termines
7. **Flechas ↑/↓** → seleccionar la forma de pago
8. **Enter** → aplicar el pago y validar la orden
9. **Enter** → nueva orden

## Solución de problemas

### "Web Serial API not supported. Use Chrome or Edge browser."
- **Causa**: el navegador no soporta Web Serial API
- **Solución**: usar Google Chrome o Microsoft Edge (89 o superior)

### "Scale not connected. Click 'Connect Scale' button to connect."
- **Causa**: la báscula no está conectada en esta sesión
- **Solución**: presionar **Ctrl+B** y seleccionar el puerto serie

### "Permission denied" (Linux)
- **Causa**: el usuario no tiene permisos sobre el puerto serie
- **Solución**:
```bash
sudo usermod -a -G uucp $USER
# O, según la distribución:
sudo usermod -a -G dialout $USER
# Cerrar sesión y volver a entrar
```

### La báscula no envía datos
- **Causa**: no está en modo continuo
- **Solución**: configurar la báscula en modo "Cont" o "Host" (ver sección de configuración)

### Peso incorrecto o con formato extraño
- **Causa**: formato de datos no estándar
- **Solución**: revisar el manual de la báscula y ajustar la función `parseMorescoWeight` en `static/src/js/moresco_scale.js`

## Formatos de báscula soportados

- **Moresco HY-918**: `ST,GS,+  1.500kg\r\n`
- **Genérico simple**: `  1.500 kg\n`
- **Formato numérico**: `+001500\r\n` (gramos)

## Estructura del módulo

```
pos_moresco_direct/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── pos_config.py
│   └── res_config_settings.py
├── static/
│   ├── description/
│   └── src/
│       ├── css/
│       ├── js/
│       │   └── moresco_scale.js
│       └── xml/
├── views/
│   ├── pos_config_views.xml
│   └── res_config_settings_views.xml
├── i18n/
└── README.md
```

## Licencia

OPL-1 — Consulta el archivo LICENSE para más detalles.

## Créditos

Desarrollado por **Consultores Odoo Colombia** a partir de la necesidad de integrar básculas Moresco HY-918 con Odoo 18 Community Edition.

- Sitio web: https://consultoresodoocolombia.odoo.com/

---

**Nota**: Este módulo utiliza la Web Serial API, una tecnología relativamente nueva. Mantén tu navegador actualizado para una mejor compatibilidad.

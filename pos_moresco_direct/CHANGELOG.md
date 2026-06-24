# Registro de cambios

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue el [Versionado Semántico](https://semver.org/lang/es/).

## [18.0.2.3.1] - 2026-02-27

### Corregido
- ✅ La tecla Supr/Retroceso ahora funciona correctamente para eliminar el último producto
- Mejorada la detección de la tecla Retroceso (evita la navegación hacia atrás del navegador)
- Supr/Retroceso solo elimina productos cuando no hay texto en la búsqueda

### Añadido
- ✅ Enfoque automático en el campo de búsqueda después de crear una nueva orden
- Flujo completo con teclado entre ventas sin necesidad de mouse
- Tiempo de espera de 300 ms para esperar la transición de pantalla antes de enfocar

## [18.0.2.3.0] - 2026-02-27

### Corregido
- ✅ Enter ya no selecciona productos cuando el campo de búsqueda está vacío
- Evita agregar por error el primer producto de la lista completa al presionar Enter

### Añadido
- ✅ Función para eliminar el último producto del carrito con **Supr** o **Retroceso**
- Notificación visual al eliminar un producto (muestra el nombre del producto eliminado)
- Retorno automático al campo de búsqueda después de eliminar

## [18.0.2.2.1] - 2026-02-27

### Corregido
- ✅ Error de selector inválido en la pantalla de recibo (`:contains()` no es CSS válido)
- ✅ Selección automática del primer método de pago al abrir la pantalla de pago
- Mejora en la búsqueda del botón "Nueva Orden" con múltiples selectores y respaldo por texto

## [18.0.2.2.0] - 2026-02-26

### Añadido
- **Navegación completa por teclado en la pantalla de pago**
  - Flechas arriba/abajo para navegar entre métodos de pago
  - Enter para seleccionar el método de pago o validar la orden cuando está pagada
  - Resaltado visual del método de pago seleccionado
- **Navegación completa por teclado en la pantalla de recibo**
  - Enter para activar el botón "Nueva Orden"
- **Flujo 100% sin mouse** desde el escaneo del producto hasta la nueva orden

### Mejorado
- El flujo completo del POS ahora puede realizarse íntegramente con el teclado
- Retroalimentación visual mejorada con resaltado para los métodos de pago
- Selección de método de pago con animaciones suaves

### Técnico
- Nuevo archivo: `moresco_payment_keyboard.js` - Manejadores de teclado para pago y recibo
- CSS extendido para el resaltado de métodos de pago
- Parcheo de los componentes PaymentScreen y ReceiptScreen

## [18.0.2.1.0] - 2026-02-26

### Añadido
- **Tecla F12** para abrir la pantalla de pago (flujo completo sin mouse)
- **Reconexión automática de la báscula** al recargar la página
- **Conexión persistente de la báscula** - sin necesidad de desconectar/reconectar físicamente
- **Watchdog de conexión** que monitorea y reconecta la báscula cada 15 segundos
- **Lógica de reconexión mejorada** con reintentos y mejor manejo del puerto

### Corregido
- Problemas de reconexión de la báscula tras recargar la página
- Errores de puerto "ya abierto"
- Conexión de la báscula más estable y persistente

## [18.0.2.0.0] - 2026-02-26

### Añadido
- **Sistema completo de navegación por teclado** para operar el POS sin mouse
- Gestión automática del foco en la barra de búsqueda
- Navegación entre productos con las flechas (↑/↓)
- Tecla Enter para seleccionar y agregar productos al carrito
- Tecla Tab para limpiar la búsqueda y preparar el siguiente producto
- Teclas F2/Escape para regresar a la barra de búsqueda
- Resaltado visual de los productos seleccionados por teclado
- Enfoque automático de la barra de búsqueda al escribir
- Manejo inteligente de eventos de teclado (respeta el contexto)
- Estilos CSS para los indicadores de selección por teclado
- Soporte de modo oscuro para los resaltados de teclado
- Lectura automática de peso para productos pesables (sin atajo necesario)

### Mejorado
- Flujo de cajero optimizado para operaciones de alta velocidad
- Menor necesidad de interacción con mouse o pantalla táctil
- Mejor ergonomía para sesiones prolongadas de POS
- Integración fluida con lectores de códigos de barras (emulación de teclado)
- Mejor accesibilidad para usuarios que solo usan teclado

### Documentación
- Actualización de USAGE.md con la referencia de atajos de teclado
- Ejemplos de flujo de teclado añadidos a README.md
- Tabla de navegación por teclado con todos los atajos
- Ejemplos prácticos de flujo de trabajo

### Cambios técnicos
- Nuevo archivo: `moresco_keyboard_navigation.js` - Manejador principal de teclado
- Nuevo archivo: `moresco_keyboard_navigation.css` - Estilos visuales
- Actualización de `__manifest__.py` para incluir los nuevos recursos
- Parcheo de ProductScreen para el manejo de eventos de teclado
- Parcheo de ProductsWidget para la gestión del estado de selección

## [18.0.1.0.0] - 2026-02-23

### Añadido
- Versión inicial del módulo PoS Moresco Direct Connect
- Conexión directa al puerto serie mediante Web Serial API
- Soporte para la báscula Moresco HY-918
- Parámetros seriales configurables (baud rate, bits de datos, paridad, bits de parada)
- Lectura manual de peso mediante el botón "Leer báscula"
- Modo opcional de lectura automática para productos pesables
- Análisis de peso desde múltiples formatos de datos:
  - Formato estándar Moresco: "ST,GS,+  1.500kg\r\n"
  - Formato simple: "  1.500 kg\n"
  - Formato numérico: "+001500" (gramos)
- Opciones de configuración en el formulario de configuración del POS
- Notificaciones al usuario sobre el estado de la conexión y errores
- Verificación de compatibilidad del navegador con Web Serial API
- Persistencia de la conexión durante la sesión del POS
- Manejo y recuperación de errores

### Funcionalidades
- No requiere IoT Box (compatible con Community Edition)
- No requiere servidor proxy
- Funciona con Odoo alojado en la nube (Cloudcluster, etc.)
- Análisis de datos de peso en múltiples formatos
- Protección por tiempo de espera en las lecturas de la báscula
- Conversión automática de unidades (g a kg)
- Validación de peso (verificación de rango)
- Mantenimiento del puerto serie activo durante la sesión

### Documentación
- README.md con documentación completa
- USAGE.md con guía de inicio rápido
- INSTALL.md con instrucciones de instalación
- CONFIG_EXAMPLES.py con ejemplos de configuración
- Documentación y comentarios en el código

### Navegadores compatibles
- Chrome/Chromium 89+
- Microsoft Edge (basado en Chromium)
- Opera (basado en Chromium)

### Probado con
- Odoo 18.0 Community Edition
- Báscula Moresco HY-918
- Linux (Arch, Ubuntu)
- Windows 10/11
- Chrome 120+
- Edge 120+

## [Sin publicar]

### Planeado
- Soporte para modelos de báscula adicionales
- Funcionalidad de tara
- Cambio de unidades (kg/g/lb)
- Interfaz de calibración de la báscula
- Soporte para múltiples básculas
- Indicadores de estado de la báscula (estable/inestable/sobrecarga)
- Historial/registro de pesos
- Configuración avanzada de reglas de análisis
- Detección automática de la báscula
- Soporte para básculas Bluetooth
- Soporte multiidioma
- Pruebas unitarias
- Pruebas de integración

### En estudio
- Soporte para básculas con cálculo de precio
- Integración de impresión de etiquetas
- Análisis de etiquetas de báscula con código de barras
- Soporte para básculas de red (TCP/IP)
- Simulador de báscula para pruebas
- Soporte para dispositivos móviles
- Compatibilidad con PWA

## Numeración de versiones

Formato: `[Versión Odoo].[Mayor].[Menor].[Parche]`

Ejemplo: `18.0.1.0.0`
- 18.0 = Versión de Odoo
- 1 = Versión mayor (cambios incompatibles)
- 0 = Versión menor (nuevas funcionalidades)
- 0 = Versión de parche (correcciones)

## Notas de actualización

### De la versión X a la versión Y
(Se completará cuando se publiquen actualizaciones)

---

## Contribuciones

Consulta CONTRIBUTING.md para saber cómo contribuir a este proyecto.

## Licencia

OPL-1 - Consulta el archivo LICENSE para más detalles.

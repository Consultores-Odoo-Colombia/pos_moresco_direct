# Guía de pruebas

## Pruebas manuales

### Prueba 1: Instalación del módulo
**Objetivo**: Verificar que el módulo se instala correctamente

**Pasos**:
1. Ir a Aplicaciones
2. Actualizar la lista de aplicaciones
3. Buscar "moresco"
4. Hacer clic en Instalar

**Esperado**: El módulo se instala sin errores

**Verificación**:
- Revisar los registros de Odoo en busca de errores
- Verificar que el módulo aparece en las aplicaciones instaladas
- Comprobar que el formulario de configuración del POS tiene los campos Moresco

---

### Prueba 2: Configuración del POS
**Objetivo**: Verificar que las opciones de configuración funcionan

**Pasos**:
1. Ir a POS > Configuración > Ajustes
2. En Dispositivos conectados, ubicar "Moresco HY-918 (USB-RS232)"
3. Activar "Moresco HY-918 (USB-RS232)"
4. Establecer la velocidad (baud rate) en 9600
5. Guardar

**Esperado**: La configuración se guarda correctamente

**Verificación**:
- Los ajustes persisten tras guardar
- No hay errores en la interfaz ni en los registros
- Los campos se muestran/ocultan correctamente según la casilla de activación

---

### Prueba 3: Compatibilidad del navegador
**Objetivo**: Verificar el soporte de Web Serial API

**Pasos**:
1. Abrir el POS en Chrome
2. Abrir la consola del navegador (F12)
3. Ejecutar: `'serial' in navigator`

**Esperado**: Devuelve `true`

**Verificación**:
- Chrome/Edge: debe ser true
- Firefox: debe ser false (esperado)
- La consola no muestra errores

---

### Prueba 4: Conexión del puerto serie
**Objetivo**: Verificar que la báscula se conecta

**Requisitos previos**:
- Báscula conectada por USB
- Usuario en el grupo uucp/dialout
- Báscula encendida

**Pasos**:
1. Abrir una sesión del POS
2. Presionar Ctrl+B (o hacer clic en el indicador de báscula)
3. El navegador solicita seleccionar el puerto
4. Seleccionar el puerto correcto (por ejemplo, /dev/ttyUSB0)
5. Confirmar

**Esperado**:
- Aparece el diálogo de selección de puerto
- La conexión tiene éxito
- No se muestran errores

**Verificación**:
- La consola muestra "Moresco scale connected"
- No hay errores de "Permission denied"
- El puerto permanece abierto

---

### Prueba 5: Lectura de peso
**Objetivo**: Verificar que el peso se lee correctamente

**Requisitos previos**:
- Báscula conectada y puerto seleccionado
- Producto en el carrito marcado como "Para pesar"

**Pasos**:
1. Colocar un peso de 1.5 kg sobre la báscula
2. Esperar a que la báscula se estabilice
3. Usar el botón Pesar (o la lectura automática)
4. Revisar la cantidad del producto

**Esperado**:
- Notificación "Peso aplicado: 1.500 kg"
- La cantidad del producto se actualiza a 1.500
- El peso es exacto

**Verificación**:
- La consola muestra los datos crudos: "ST,GS,+  1.500kg"
- El peso analizado es correcto
- La cantidad de la línea de producto coincide

---

### Prueba 6: Modo de lectura automática
**Objetivo**: Verificar la lectura automática de peso

**Requisitos previos**:
- "Lectura automática" activada en la configuración del POS
- Báscula conectada

**Pasos**:
1. Abrir una sesión del POS
2. Colocar un peso sobre la báscula (por ejemplo, 2.3 kg)
3. Hacer clic en un producto pesable
4. Esperar 0.5 segundos

**Esperado**:
- El peso se lee automáticamente
- La cantidad se actualiza sin presionar el botón
- Aparece una notificación de éxito

**Verificación**:
- No se necesita hacer clic manualmente
- El peso se aplica en menos de 1 segundo
- El valor del peso es correcto

---

### Prueba 7: Varios productos
**Objetivo**: Verificar varios productos pesables

**Pasos**:
1. Agregar el primer producto pesable (1.5 kg)
2. Leer la báscula
3. Agregar el segundo producto pesable (2.3 kg)
4. Cambiar el peso en la báscula
5. Leer la báscula de nuevo

**Esperado**:
- Cada producto obtiene el peso correcto
- Los productos anteriores no cambian
- No hay mezcla de pesos

**Verificación**:
- Producto 1: 1.500 kg
- Producto 2: 2.300 kg
- Total de la orden correcto

---

### Prueba 8: Manejo de errores - Sin báscula
**Objetivo**: Verificar el comportamiento sin báscula

**Pasos**:
1. NO conectar la báscula
2. Abrir el POS
3. Usar el botón Pesar

**Esperado**:
- Notificación de advertencia (báscula no conectada)
- No hay caídas
- El usuario puede seguir trabajando

**Verificación**:
- Mensaje de error controlado
- El POS sigue funcional
- Se puede reintentar más tarde

---

### Prueba 9: Manejo de errores - Báscula desconectada
**Objetivo**: Verificar el comportamiento al desconectar la báscula

**Requisitos previos**:
- Báscula conectada y funcionando inicialmente

**Pasos**:
1. Conectar la báscula y leer el peso con éxito
2. Desconectar físicamente el cable USB
3. Intentar leer el peso de nuevo

**Esperado**:
- Notificación de error (conexión perdida)
- El estado del puerto se reinicia
- Se puede reconectar tras volver a conectar

**Verificación**:
- Mensaje de error apropiado
- Sin caída del navegador
- Estado recuperable (reconexión automática)

---

### Prueba 10: Distintos formatos de peso
**Objetivo**: Verificar el análisis de varios formatos

**Datos de prueba**:
- "ST,GS,+  1.500kg\r\n" → 1.500
- "  2.350 kg\n" → 2.350
- "+001234" → 1.234 (si >100, dividir entre 1000)
- "  0.750 kg" → 0.750

**Pasos**:
1. Configurar la báscula para enviar cada formato (o simular)
2. Leer el peso
3. Verificar el valor analizado

**Esperado**: Todos los formatos se analizan correctamente

**Verificación**:
- Revisar los registros de consola con los datos crudos
- Comprobar que el peso analizado coincide con lo esperado
- La cantidad se actualiza correctamente

---

### Prueba 11: Validación de peso
**Objetivo**: Verificar la validación del rango de peso

**Casos de prueba**:
- 0.001 kg → Válido (mínimo)
- 0.0001 kg → Inválido (demasiado pequeño)
- 999 kg → Válido (máximo)
- 1000 kg → Inválido (demasiado grande)

**Esperado**:
- Pesos válidos aceptados
- Pesos inválidos rechazados con advertencia
- Sin pesos negativos (salvo que se soporten explícitamente)

**Verificación**:
- La consola muestra la lógica de validación
- Notificaciones apropiadas
- Los pesos inválidos no actualizan la cantidad

---

### Prueba 12: Productos no pesables
**Objetivo**: Verificar el comportamiento con productos no pesables

**Pasos**:
1. Agregar un producto normal (no marcado como "Para pesar")
2. Usar el botón Pesar

**Esperado**:
- Advertencia: "El producto seleccionado no es pesable"
- No se aplica el peso
- La cantidad permanece en 1

**Verificación**:
- Se muestra el mensaje apropiado
- Sin errores
- La cantidad del producto no cambia

---

### Prueba 13: Persistencia de la sesión
**Objetivo**: Verificar que el puerto permanece abierto durante la sesión

**Pasos**:
1. Abrir una sesión del POS
2. Leer la báscula por primera vez (seleccionar puerto)
3. Leer la báscula una segunda vez
4. Leer la báscula una tercera vez

**Esperado**:
- El puerto se selecciona solo una vez
- Las lecturas siguientes usan el mismo puerto
- No se repiten los diálogos de permiso

**Verificación**:
- La conexión serial permanece establecida
- Consola: "Port already open"
- Lecturas siguientes más rápidas

---

### Prueba 14: Cerrar y reabrir el POS
**Objetivo**: Verificar el comportamiento entre cambios de sesión

**Pasos**:
1. Abrir una sesión del POS
2. Conectar la báscula y leer el peso
3. Cerrar la sesión del POS
4. Abrir una nueva sesión del POS
5. Intentar leer el peso

**Esperado**:
- La reconexión automática vuelve a conectar la báscula
- La lectura de peso funciona en la nueva sesión
- Sin conexiones obsoletas

**Verificación**:
- Inicio de sesión limpio
- Puerto accesible
- Sin errores de la sesión anterior

---

### Prueba 15: HTTPS / Cloudcluster
**Objetivo**: Verificar el funcionamiento con Odoo alojado

**Requisitos previos**:
- Odoo en un dominio HTTPS
- Báscula conectada localmente

**Pasos**:
1. Acceder a Odoo por la URL HTTPS
2. Abrir el POS
3. Intentar conectar la báscula

**Esperado**:
- Funciona sin configuración adicional
- O muestra una advertencia de seguridad con su solución

**Verificación**:
- Revisar la consola en busca de errores de seguridad
- Documentar cualquier solución alternativa necesaria
- Probar con certificado SSL si es necesario

---

## Ideas para pruebas automatizadas

### Pruebas unitarias (futuro)
```python
# tests/test_pos_moresco.py

def test_weight_parsing():
    """Probar parse_weight con varios formatos"""
    assert parse_weight("ST,GS,+  1.500kg") == 1.500
    assert parse_weight("  2.350 kg") == 2.350
    assert parse_weight("+001234") == 1.234

def test_weight_validation():
    """Probar la validación del rango de peso"""
    assert validate_weight(1.500) == True
    assert validate_weight(0.0001) == False
    assert validate_weight(1000) == False

def test_config_inheritance():
    """Probar que el modelo pos_config se extiende correctamente"""
    config = env['pos.config'].create({'name': 'Test PoS'})
    assert hasattr(config, 'moresco_scale_enabled')
    assert config.moresco_baud_rate == 9600
```

### Pruebas de integración (futuro)
```python
# tests/test_pos_integration.py

def test_order_with_scale():
    """Probar el flujo completo con báscula"""
    # Crear un producto pesable
    # Crear una orden
    # Simular la lectura de la báscula
    # Verificar que la cantidad se actualizó

def test_multiple_weighable_products():
    """Probar una orden con varios artículos pesables"""
    # Agregar varios productos
    # Leer distintos pesos
    # Verificar que cada producto es correcto
```

### Pruebas de JavaScript (futuro)
```javascript
// static/tests/moresco_scale_tests.js

QUnit.test("Scale connection", async function(assert) {
    // Simular navigator.serial
    // Probar getWeightFromMoresco()
    // Verificar la lógica de conexión
});

QUnit.test("Weight parsing", function(assert) {
    // Probar parseMorescoWeight()
    // Varios formatos de entrada
    // Casos límite
});
```

---

## Pruebas de rendimiento

### Prueba de carga
- Abrir 10 productos repetidamente
- Leer la báscula 100 veces
- Medir el tiempo de respuesta
- Revisar fugas de memoria

**Esperado**:
- Respuesta < 2 segundos
- Sin crecimiento de memoria
- Sin problemas de conexión

### Prueba de estrés
- Leer la báscula continuamente durante 1 hora
- Revisar caídas de conexión
- Monitorear la tasa de errores

**Esperado**:
- Conexión estable
- Sin caídas
- Tasa de error < 1%

---

## Pruebas de seguridad

### Prueba de permisos del puerto
```bash
# Quitar el usuario del grupo
sudo gpasswd -d $USER uucp

# Intentar acceder al puerto
# Debe fallar de forma controlada

# Volver a agregar
sudo usermod -a -G uucp $USER
```

### Prueba de origen cruzado
- Intentar acceder a la báscula desde otro dominio
- El navegador debe bloquearlo

### Prueba de HTTPS
- Probar en HTTP vs HTTPS
- Documentar las diferencias

---

## Matriz de pruebas por navegador

| Navegador | Versión | SO | Estado | Notas |
|-----------|---------|----|--------|-------|
| Chrome | 120+ | Linux | ✅ | Totalmente soportado |
| Chrome | 120+ | Windows | ✅ | Totalmente soportado |
| Edge | 120+ | Windows | ✅ | Totalmente soportado |
| Firefox | Última | Linux | ❌ | Sin Web Serial API |
| Safari | Última | macOS | ❌ | Sin Web Serial API |
| Opera | Última | Linux | ✅ | Basado en Chromium |

---

## Plantilla de informe de pruebas

```
Fecha de prueba: AAAA-MM-DD
Responsable: [Nombre]
Entorno: [Versión de Odoo, SO, Navegador]
Modelo de báscula: Moresco HY-918

Pruebas superadas: X/15
Pruebas fallidas: Y/15

Pruebas fallidas:
- Prueba #: [Descripción]
  - Error: [Mensaje de error]
  - Pasos para reproducir: [...]
  - Esperado vs Real: [...]

Notas:
- [Observaciones adicionales]

Aprobación: [Firma del responsable]
```

---

## Lista de verificación antes de publicar

- [ ] Todas las pruebas manuales superadas
- [ ] Probado en Chrome (Linux)
- [ ] Probado en Chrome (Windows)
- [ ] Probado en Edge (Windows)
- [ ] Probado con una báscula Moresco HY-918 real
- [ ] Probado con varios productos
- [ ] Probado el modo de lectura automática
- [ ] Probados los escenarios de error
- [ ] Documentación completa
- [ ] Sin errores en la consola
- [ ] Sin errores de Python en los registros
- [ ] Instrucciones de instalación verificadas
- [ ] README revisado
- [ ] Número de versión actualizado
- [ ] CHANGELOG actualizado

---

## Pruebas continuas

Para el desarrollo continuo:

1. **Después de cada cambio de código**:
   - Ejecutar las pruebas afectadas
   - Revisar la consola en busca de errores
   - Verificar que la báscula sigue conectándose

2. **Antes de cada commit**:
   - Ejecutar el conjunto completo de pruebas
   - Revisar regresiones
   - Actualizar las pruebas si es necesario

3. **Antes de cada publicación**:
   - Completar la lista de verificación de pruebas
   - Actualizar la documentación
   - Crear un informe de pruebas

---

Para preguntas o problemas durante las pruebas, consulta:
- README.md - Documentación completa
- INSTALL.md - Guía de instalación
- CONFIG_EXAMPLES.py - Ejemplos de configuración

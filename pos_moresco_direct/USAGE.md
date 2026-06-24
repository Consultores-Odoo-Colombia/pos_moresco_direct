# Integración de la báscula Moresco con el POS

## Guía de inicio rápido

### 1. Permisos en Linux
```bash
sudo usermod -a -G uucp $USER
```

### 2. Configuración de la Báscula
- Código: `96814` + `TARA`
- Modo: **Continuo**
- Parámetros: **9600 8N1**

### 3. En Odoo
- Punto de Venta > Configuración
- Activar "Moresco HY-918 (USB-RS232)" en Dispositivos conectados
- Productos: marcar como "Para pesar"

### 4. Uso
- Navegador: Chrome o Edge
- Primera vez: autorizar el puerto serie (Ctrl+B)
- Seleccionar un producto pesable
- El peso se lee y aplica automáticamente

## Navegación por Teclado (Sin Mouse)

El módulo incluye navegación completa por teclado para que el cajero trabaje sin usar el mouse:

### Atajos de Teclado Principales

| Tecla | Función |
|-------|---------|
| **Cualquier letra/número** | Enfoca automáticamente la barra de búsqueda |
| **Enter** | Selecciona el primer producto de los resultados y lo agrega al carrito |
| **↑ / ↓** | Navega entre los productos mostrados |
| **Enter** (con producto seleccionado) | Agrega el producto seleccionado al carrito |
| **F2** o **Esc** | Regresa el foco a la barra de búsqueda |
| **Tab** (en búsqueda) | Limpia la búsqueda y prepara para el siguiente producto |
| **F12** | Ir a pantalla de pago |
| **↑ / ↓** (en pago) | Navegar entre métodos de pago |
| **Enter** (en pago) | Seleccionar método / Validar orden |
| **Enter** (en recibo) | Nueva orden |
| **Ctrl+B** | Conectar/reconectar báscula (raramente necesario) |
| **Alt+B** | Enfocar barra de búsqueda |

### Flujo de Trabajo Típico (Solo Teclado)

1. **Digitar código de barras**: El cajero escribe el código
2. **Presionar Enter**: Selecciona automáticamente el primer producto
3. Si es pesable:
   - Colocar producto en báscula
   - Esperar lectura automática del peso
4. **Tab**: Limpia búsqueda para el siguiente producto
5. Repetir desde el paso 1

### Ejemplo Práctico

```
Cajero: "123456" [Enter]          → Agrega producto al carrito (peso automático)
        [Tab]                     → Limpia y prepara siguiente producto
        "789012" [Enter]          → Agrega siguiente producto
        [F12]                     → Ir a pantalla de pago
        [↓][↓][Enter]            → Selecciona forma de pago y valida
        [Enter]                   → Nueva orden
        [F2]                      → Si necesita volver a la búsqueda
        [↓] [↓] [Enter]          → Navega y selecciona tercer resultado
```

### Notas Importantes

- ✅ No es necesario hacer clic en ningún lugar
- ✅ El foco regresa automáticamente a la búsqueda después de agregar productos
- ✅ La navegación con flechas resalta visualmente el producto seleccionado
- ✅ Funciona en conjunto con lectores de códigos de barras USB (emula teclado)
- ✅ **La báscula se reconecta automáticamente** - sin desconexiones físicas necesarias
- ✅ F12 para pagar - workflow completo sin mouse
- ✅ **Pago 100% con teclado** - Flechas para elegir método, Enter para validar
- ✅ **Nueva orden con Enter** - Flujo completo de inicio a fin sin mouse

## Solución de problemas

### No lee la báscula
1. Verificar cable USB conectado
2. Báscula encendida
3. Configurada en modo continuo
4. Usuario con permisos de puerto serial

### Web Serial API no disponible
- Usar Chrome o Microsoft Edge
- Firefox no soportado (aún)

## Formatos de Peso

La báscula Moresco HY-918 típicamente envía:
```
ST,GS,+  1.500kg
```

El módulo parsea automáticamente varios formatos:
- `ST,GS,+  1.500kg`
- `  1.500 kg`
- `+001500` (gramos)

## Pruebas

Para probar sin báscula física, puedes usar el **Modo simulación** del módulo (peso fijo o aleatorio), o un emulador de puerto serie:
```bash
# Linux
socat -d -d pty,raw,echo=0 pty,raw,echo=0
# Esto crea dos puertos virtuales conectados
```

## Más información

Ver README.md para la documentación completa.

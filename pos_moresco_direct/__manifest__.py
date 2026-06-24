# -*- coding: utf-8 -*-
{
    'name': 'PoS Moresco Direct Connect',
    'version': '18.0.2.3.1',
    'category': 'Sales/Point of Sale',
    'summary': 'Conecta la báscula Moresco HY-918 al POS vía Web Serial API (sin IoT Box) y navega 100% con el teclado',
    'description': """
        Punto de Venta - Conexión directa de báscula Moresco + Navegación por teclado
        =============================================================================

        Este módulo conecta la báscula Moresco HY-918 al Punto de Venta de Odoo
        directamente desde el navegador mediante la API JavaScript Web Serial,
        usando un adaptador USB-RS232. No requiere IoT Box ni software intermedio.
        Incluye además una navegación completa por teclado para operar sin mouse.

        Funcionalidades:
        ----------------
        * Lectura de la báscula vía Web Serial API (Chrome/Edge), sin IoT Box
        * Lectura automática de peso para productos pesables
        * Compatible con la báscula Moresco HY-918 (9600 baudios, 8N1)
        * Funciona con Odoo Community Edition (también en la nube)
        * **Navegación completa por teclado - sin necesidad de mouse**
        * Flechas para navegar entre productos
        * Enter para seleccionar y agregar productos
        * Tab para limpiar la búsqueda y pasar al siguiente producto
        * F12 para ir al pago (flujo completo sin mouse)
        * Indicadores visuales para la selección por teclado
        * **Reconexión automática de la báscula** al recargar la página
        * Monitoreo persistente de la conexión y recuperación automática
        * **Flujo de pago completo por teclado** - flechas + Enter
        * **Operación 100% sin mouse** desde el escaneo hasta la nueva orden
        * Modo simulación (peso fijo o aleatorio) para pruebas sin báscula

        Requisitos:
        -----------
        * Báscula Moresco HY-918 con adaptador USB-RS232
        * Navegador Google Chrome o Microsoft Edge 89+ (compatible con Web Serial API)
        * Productos marcados como "Para pesar" en su ficha

        Configuración:
        --------------
        * Marca los productos como "Para pesar" en el formulario del producto
        * Conecta la báscula con el adaptador USB-RS232
        * Activa la báscula en Punto de Venta -> Configuración -> Dispositivos conectados
        * Usa los atajos de teclado para una operación rápida

        Atajos de teclado:
        ------------------
        Pantalla de productos:
        * Escribir para buscar productos
        * Enter: seleccionar el primer producto
        * Flechas arriba/abajo: navegar entre productos
        * Tab: siguiente búsqueda de producto
        * Supr/Retroceso: eliminar el último producto
        * F12: ir al pago
        * F2/Esc: enfocar la barra de búsqueda

        Pantalla de pago:
        * Flechas arriba/abajo: navegar entre métodos de pago
        * Enter: seleccionar método o validar la orden

        Pantalla de recibo:
        * Enter: nueva orden

        Báscula:
        * Ctrl+B: conectar la báscula (rara vez necesario, se reconecta sola)
        * Lectura automática de peso para productos pesables
        * Reconexión automática al recargar la página
    """,
    'author': 'consultoresodoocolombia',
    'website': 'https://consultoresodoocolombia.odoo.com/',
    'price': 20.00,
    'currency': 'USD',
    'images': ['static/description/main_screenshot.png'],
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_config_views.xml',
        'views/res_config_settings_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_moresco_direct/static/src/css/moresco_weight.css',
            'pos_moresco_direct/static/src/css/moresco_keyboard_navigation.css',
            'pos_moresco_direct/static/src/js/moresco_scale.js',
            'pos_moresco_direct/static/src/js/moresco_navbar_weight.js',
            'pos_moresco_direct/static/src/js/moresco_keyboard_navigation.js',
            'pos_moresco_direct/static/src/js/moresco_payment_keyboard.js',
            'pos_moresco_direct/static/src/js/moresco_product_card.js',
            'pos_moresco_direct/static/src/xml/pos_screen.xml',
            'pos_moresco_direct/static/src/xml/pos_navbar_weight.xml',
            'pos_moresco_direct/static/src/xml/moresco_product_card.xml',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'OPL-1',
}

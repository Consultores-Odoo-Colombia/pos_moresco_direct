PoS Moresco Direct Connect
==========================

.. toctree::
   :maxdepth: 2
   :caption: Contenido:

Resumen
-------
Conecta la báscula Moresco HY-918 al Punto de Venta de Odoo y permite operar el flujo de venta completo usando solo el teclado.

Descripción
-----------
Este módulo lee el peso de la báscula Moresco HY-918 directamente desde el navegador mediante la API JavaScript Web Serial, usando un adaptador USB-RS232. No requiere IoT Box ni software intermedio. El peso se aplica automáticamente a los productos pesables y se muestra en vivo en la barra superior del Punto de Venta. Adicionalmente incluye un sistema de navegación 100% por teclado para una operación rápida y sin mouse.

Características
--------------
* **Conexión directa vía Web Serial API:** la báscula se conecta desde el propio navegador (Chrome o Edge), sin IoT Box.
* **Lectura automática de peso:** el peso se aplica solo al seleccionar un producto pesable.
* **Reconexión automática:** monitoreo persistente que reconecta la báscula tras recargar la página.
* **Navegación 100% por teclado:** búsqueda, selección, pago y nueva orden sin tocar el mouse.
* **Modo simulación:** prueba el flujo de pesaje con peso fijo o aleatorio, sin báscula física.
* **Parámetros seriales configurables:** baud rate, bits de datos, bits de parada y paridad.

Requisitos
----------
* Odoo 18.0 Community Edition.
* Báscula Moresco HY-918 con adaptador USB-RS232.
* Navegador compatible con Web Serial API: Google Chrome o Microsoft Edge 89 o superior.
* Módulo base requerido: ``point_of_sale``.

Créditos
--------
* **Autor:** Consultores Odoo Colombia
* **Sitio web:** https://consultoresodoocolombia.odoo.com/

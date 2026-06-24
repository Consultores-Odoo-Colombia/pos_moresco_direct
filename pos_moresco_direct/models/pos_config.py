# -*- coding: utf-8 -*-

from odoo import fields, models, api


class PosConfig(models.Model):
    _inherit = 'pos.config'

    moresco_scale_enabled = fields.Boolean(
        string='Enable Moresco Scale',
        help='Enable the Moresco HY-918 scale via Web Serial API (USB-RS232 adapter, Chrome/Edge). No IoT Box required.',
        default=False,
    )
    
    moresco_baud_rate = fields.Integer(
        string='Baud Rate',
        default=9600,
        help='Serial port baud rate (default: 9600 for Moresco HY918)',
    )
    
    moresco_data_bits = fields.Integer(
        string='Data Bits',
        default=8,
        help='Serial port data bits (default: 8)',
    )
    
    moresco_stop_bits = fields.Integer(
        string='Stop Bits',
        default=1,
        help='Serial port stop bits (default: 1)',
    )
    
    moresco_parity = fields.Selection([
        ('none', 'None'),
        ('even', 'Even'),
        ('odd', 'Odd'),
    ], string='Parity', default='none', help='Serial port parity (default: None)')
    
    moresco_auto_read = fields.Boolean(
        string='Auto Read Weight',
        default=False,
        help='Automatically read weight when selecting a weighable product',
    )

    moresco_simulation_enabled = fields.Boolean(
        string='Simulation Mode',
        default=False,
        help='Use simulated weight values without a physical scale',
    )

    moresco_simulation_mode = fields.Selection([
        ('fixed', 'Fixed Weight'),
        ('random', 'Random Range'),
    ], string='Simulation Type', default='fixed')

    moresco_simulation_fixed_weight = fields.Float(
        string='Fixed Weight (kg)',
        default=1.000,
        digits=(16, 3),
    )

    moresco_simulation_min_weight = fields.Float(
        string='Min Weight (kg)',
        default=0.100,
        digits=(16, 3),
    )

    moresco_simulation_max_weight = fields.Float(
        string='Max Weight (kg)',
        default=3.000,
        digits=(16, 3),
    )


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_pos_config(self):
        result = super()._loader_params_pos_config()
        result['search_params']['fields'].extend([
            'moresco_scale_enabled',
            'moresco_baud_rate',
            'moresco_data_bits',
            'moresco_stop_bits',
            'moresco_parity',
            'moresco_auto_read',
            'moresco_simulation_enabled',
            'moresco_simulation_mode',
            'moresco_simulation_fixed_weight',
            'moresco_simulation_min_weight',
            'moresco_simulation_max_weight',
        ])
        return result

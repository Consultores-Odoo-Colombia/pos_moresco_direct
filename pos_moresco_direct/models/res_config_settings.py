# -*- coding: utf-8 -*-

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_moresco_scale_enabled = fields.Boolean(related='pos_config_id.moresco_scale_enabled', readonly=False)
    pos_moresco_auto_read = fields.Boolean(related='pos_config_id.moresco_auto_read', readonly=False)
    pos_moresco_simulation_enabled = fields.Boolean(related='pos_config_id.moresco_simulation_enabled', readonly=False)
    pos_moresco_simulation_mode = fields.Selection(related='pos_config_id.moresco_simulation_mode', readonly=False)
    pos_moresco_simulation_fixed_weight = fields.Float(related='pos_config_id.moresco_simulation_fixed_weight', readonly=False)
    pos_moresco_simulation_min_weight = fields.Float(related='pos_config_id.moresco_simulation_min_weight', readonly=False)
    pos_moresco_simulation_max_weight = fields.Float(related='pos_config_id.moresco_simulation_max_weight', readonly=False)
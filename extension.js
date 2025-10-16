/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */




import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

function toggleAppGrid() {
    Main.overview.show();
    Main.overview.dash.showAppsButton.checked = !Main.overview.dash.showAppsButton.checked;
}

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        this.add_child(new St.Icon({
            icon_name: 'view-app-grid-symbolic',
            style_class: 'system-status-icon',
        }));

        this._signalId = Main.overview.dash.showAppsButton.connectObject('style_changed',
            () => {
                if (Main.overview.dash.showAppsButton.checked) {
                    this.add_style_pseudo_class('checked');
                }
                else {
                    this.remove_style_pseudo_class('checked');
                }
            }, this);

        this.connect("button-press-event", (actor, event) => {
            toggleAppGrid();
            return true;
        });

	    this.connect("touch-event", (actor, event) => {
		if (event.type() == Clutter.EventType.TOUCH_END)
			toggleAppGrid();
		return true;
	    });
    }


    destroy() {
        if (this._signalId) {
            Main.overview.dash.showAppsButton.disconnect(this._signalId);
            this._signalId = null;
        }
        super.destroy();
    }
});

export default class AppGridButtonInTopPanelExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator, 2, 'left');
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

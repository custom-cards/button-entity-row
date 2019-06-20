class ButtonEntityRow extends Polymer.Element {
  static get template() {
    return Polymer.html`
<style>
 hui-generic-entity-row {
     margin: var(--ha-themed-slider-margin, initial);
 }
 .flex {
     display: flex;
     align-items: center;
 }
 .flex-box {
     display: flex;
     justify-content: space-between;
 }
 .flex-box paper-button:last-of-type {
     padding-right: 1.75em;
     min-width: 0px;
 }

 .flex-box paper-button:last-of-type ha-icon {
     padding-right: 0;
 }

 .flex-box paper-button:first-of-type state-badge {
     width: unset;
     margin-right: 0.5em;
 }

 paper-button {
     color: var(--primary-color);
     font-weight: 500;
     margin-right: -.57em;
     cursor: pointer;
 }
 ha-icon {
	 padding-right: 5px;
 }
 .icon-default {
	 color: var(--primary-color);
 }
 .icon-red {
	 color: var(--google-red-500);
 }
 .icon-green {
	 color: var(--google-green-500);
 }
 .icon-yellow {
	 color: var(--google-yellow-500);
 }
 .icon-grey {
	 color: var(--paper-grey-200);
 }
</style>
<template is="dom-repeat" items="[[buttons]]" as="row">
    <div class="flex-box">
        <template is="dom-repeat" items="[[row]]">
            <paper-button on-click="handleButton">
                <template is="dom-if" if="{{item.icon}}">
                    <ha-icon icon="[[item.icon]]" class$="[[getClass(item.icon_color)]]"><ha-icon>
                </template>
                <template is="dom-else">
                    <ha-state-icon state="[[item.state]]""><ha-state-icon>
                </template>
                {{item.name}}
            </paper-button>
        </template>
</template>

    `
  }

  static get properties() {
    return {
      _hass: Object,
      _config: Object,
      buttons: Array,
      stateObj: { type: Object, value: null },
    };
  }

  getClass(color) {
    if (!color) return 'icon-default'
    return `icon-${color}`
  }

  makeButtonFromEntity(entity) {
    const parts = entity.split('.')
    const domain = parts[0]
    let service
    switch (domain) {
    case 'light':
    case 'switch':
    case 'script':
      service = 'toggle'
      break
    case 'media_player':
      service = 'media_play_pause'
      break
    case 'scene':
      service = 'turn_on'
      break
    default:
      throw new Error(`cannot use ${entity} without a specifig action config`)
    }
    return {
      service: `${domain}.${service}`,
      service_data: {
        entity_id: entity
      }
    }
  }
  
  setConfig(config) {
    this._config = config;
    if (!config.buttons) {
      throw new Error("missing buttons")
    }
    if (!Array.isArray(config.buttons)) {
      throw new Error("buttons must be an array")
    }
    if (config.buttons.length <= 0) {
      throw new Error("at least one button required")
    }
    if (!Array.isArray(config.buttons[0])) {
      config.buttons = [config.buttons]
    }
    
    this.buttons = config.buttons.map(row => row.map(button => {
      if (typeof button === "string") {
        return this.makeButtonFromEntity(button)
      }
      if (button.entity) {
        return {
          ...this.makeButtonFromEntity(button.entity),
          icon: button.icon,
          icon_color: button.icon_color,
          name: button.name
        }
      }

      if (!button.service) throw new Error("service required")
      if (!button.service_data) button.service_data = {}
      if (!button.name) throw new Error("name required")
      return button
    }))

    
  }

  set hass(hass) {
    this._hass = hass;

    this.buttons = this.buttons.map(row => row.map(button => {
      const state = hass.states[button.service_data.entity_id]
      if (state) {
        button.state = state
      }
      if (button.name) return button
      if (button.icon) return button

      if (state && state.attributes && state.attributes.friendly_name) {
        button.name = state.attributes.friendly_name
        return button
      }
      return button
    }))

  }

  handleButton(evt) {
    const button = evt.model.get('item')
    const svc = button.service.split('.')
    this._hass.callService(svc[0], svc[1], button.service_data)
  }


  stopPropagation(ev) {
    ev.stopPropagation();
  }
}

customElements.define('button-entity-row', ButtonEntityRow);

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
 paper-button {
     color: var(--primary-color);
     font-weight: 500;
     margin-right: -.57em;
 }
 iron-icon {
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
<div class="flex-box">
    <template is="dom-repeat" items="[[_config.buttons]]">
        <paper-button on-click="handleButton">
            <template is="dom-if" if="{{item.icon}}">
                <iron-icon icon="[[item.icon]]" class$="[[getClass(item.icon_color)]]"><iron-icon>
            </template>
            {{item.action_name}}
        </paper-button>
    </template>
</div>
    `
  }

  static get properties() {
    return {
      _hass: Object,
      _config: Object,
      stateObj: { type: Object, value: null },
    };
  }

  getClass(color) {
    return `icon-${color}`
  }

  setConfig(config)
  {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
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

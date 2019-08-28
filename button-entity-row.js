import { LitElement, html, css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module"

class ButtonEntityRow extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      buttons: { type: Array }
    }
  }

  static get styles() {
    return css`
      hui-generic-entity-row {
        margin: var(--ha-themed-slider-margin, initial);
      }
      .flex-box {
        display: flex;
        justify-content: space-evenly;
      }
      paper-button {
        cursor: pointer;
        padding: 8px;
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .button-default {
        color: var(--paper-item-icon-color); /*var(--primary-color); */
      }
      .button-active {
        color: var(--paper-item-icon-active-color);
      }
      .button-inactive {
        color: var(--paper-item-icon-color);
      }
    `
  }

  render() {
    return html`
      <div class="flex-box">
        ${this.buttons.map(button => {
          const state = this.hass.states[button.entityId] || {}
          const icon = this.getCurrentIcon(button, state)
          const name = button.name || (!icon && state.attributes ? state.attributes.friendly_name : null)

          return html`
            <paper-button
              @click="${() => this.handleButtonClick(button)}"
              style="${this.getStyle(button.style)}"
              class="${this.getClass(state.state)}"
            >
              ${icon &&
                html`
                  <ha-icon icon="${icon}" style="${name ? "padding-right: 5px;" : ""}"></ha-icon>
                `}
              ${name}
              <paper-ripple center class="${name ? "" : "circle"}"></paper-ripple>
            </paper-button>
          `
        })}
      </div>
    `
  }

  getCurrentIcon(button, state) {
    let icon = button.icon
    if (state.attributes) {
      if (button.stateIcons && button.stateIcons[state.state]) {
        icon = button.stateIcons[state.state]
      }
      if (!icon) {
        icon = state.attributes.icon
      }
    }
    return icon
  }

  getClass(state) {
    switch (state) {
      case "on":
        return "button-active"
      case "off":
        return "button-inactive"
      default:
        return "button-default"
    }
  }

  withDefaultEntityService(entityId) {
    const domain = entityId.split(".")[0]
    let service
    switch (domain) {
      case "automation":
      case "cover":
      case "fan":
      case "input_boolean":
      case "light":
      case "script":
      case "switch":
      case "vacuum":
        service = "toggle"
        break
      case "media_player":
        service = "media_play_pause"
        break
      case "scene":
        service = "turn_on"
        break
      default:
        throw new Error(`service required, but was not found for ${entityId}`)
    }

    return {
      service: `${domain}.${service}`,
      serviceData: {
        entity_id: entityId
      }
    }
  }

  getStyle(styles) {
    return Object.keys(styles || {})
      .reduce((style, rule) => {
        return [...style, `${rule}: ${styles[rule]};`]
      }, [])
      .join(" ")
  }

  setConfig(config) {
    if (!config.buttons) throw new Error("missing buttons")
    if (!Array.isArray(config.buttons)) throw new Error("buttons must be an array")
    if (config.buttons.length <= 0) throw new Error("at least one button required")

    this.config = config
    this.buttons = config.buttons.map(item => {
      let button
      if (typeof item === "string") {
        button = {
          entityId: item
        }
      } else if (item.entity) {
        button = {
          entityId: item.entity,
          icon: item.icon,
          stateIcons: item.state_icons,
          style: item.style,
          name: item.name,
          service: item.service,
          serviceData: item.service_data
        }
      } else {
        throw new Error("button config is not supported")
      }

      if (!button.service) {
        button = { ...button, ...this.withDefaultEntityService(button.entityId) }
      }

      if (Array.isArray(button.serviceData)) {
        button.serviceData = button.serviceData.reduce((obj, item) => ({ ...obj, ...item }), {})
      }

      if (button.serviceData === null || typeof button.serviceData !== "object")
        throw new Error("serviceData must be an object")

      return button
    })
  }

  handleButtonClick(button) {
    const service = button.service.split(".")
    this.hass.callService(service[0], service[1], button.serviceData)
  }
}

customElements.define("button-entity-row", ButtonEntityRow)

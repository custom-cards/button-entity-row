import { LitElement, html, css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module"

class ButtonEntityRow extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      rows: { type: Array }
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
      ${this.rows.map(row => {
        return html`
          <div class="flex-box">
            ${row.map(button => {
              const state = this.hass.states[button.entityId] || {}
              const icon = this._getCurrentIcon(button, state)
              const name = button.name || (!icon && state.attributes ? state.attributes.friendly_name : null)

              return html`
                <paper-button
                  @click="${() => this._handleButtonClick(button)}"
                  style="${button.style}"
                  class="${this._getCurrentClass(state.state)}"
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
      })}
    `
  }

  setConfig(config) {
    if (!config.buttons) throw new Error("missing buttons")
    if (!Array.isArray(config.buttons)) throw new Error("buttons must be an array")
    if (config.buttons.length <= 0) throw new Error("at least one button required")

    if (!Array.isArray(config.buttons[0])) {
      config.buttons = [config.buttons]
    }

    this.config = config
    this.rows = config.buttons.map(row =>
      row.map(item => {
        let button =
          typeof item === "string"
            ? {
                entityId: item
              }
            : {
                entityId: item.entity,
                icon: item.icon,
                stateIcons: item.state_icons,
                style: this._getStyle(item.style),
                name: item.name,
                service: item.service,
                serviceData: item.service_data
              }

        if (!button.service) {
          button = { ...button, ...this._withDefaultEntityService(button.entityId) }
        }

        if (Array.isArray(button.serviceData)) {
          button.serviceData = this._mergeArrayItemsToObject(button.serviceData)
        }

        if (Array.isArray(button.stateIcons)) {
          button.stateIcons = this._mergeArrayItemsToObject(button.stateIcons)
        }

        return button
      })
    )
  }

  _withDefaultEntityService(entityId) {
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
        // No service available, will open the entity state modal if any
        return {}
    }

    return {
      service: `${domain}.${service}`,
      serviceData: {
        entity_id: entityId
      }
    }
  }

  _getCurrentIcon(button, state) {
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

  _getCurrentClass(state) {
    switch (state) {
      case "on":
        return "button-active"
      case "off":
        return "button-inactive"
      default:
        return "button-default"
    }
  }

  _getStyle(styles) {
    if (Array.isArray(styles)) {
      styles = this._mergeArrayItemsToObject(styles)
    }

    return Object.keys(styles || {})
      .reduce((style, rule) => {
        return [...style, `${rule}: ${styles[rule]};`]
      }, [])
      .join(" ")
  }

  _mergeArrayItemsToObject(arrayOfObjects) {
    return arrayOfObjects.reduce((obj, item) => ({ ...obj, ...item }), {})
  }

  _handleButtonClick(button) {
    if (button.service) {
      const service = button.service.split(".")
      this.hass.callService(service[0], service[1], button.serviceData)
    } else if (button.entityId) {
      this._showEntityMoreInfo(button.entityId)
    }
  }

  _showEntityMoreInfo(entityId) {
    const event = new Event("hass-more-info", { bubbles: true, cancelable: false, composed: true })
    event.detail = { entityId }
    this.dispatchEvent(event)
  }
}

customElements.define("button-entity-row", ButtonEntityRow)

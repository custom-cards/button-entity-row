# Button Entity Row

Creates a row or rows of buttons to be placed in an `entities` card.

## Usage

You can specify a specific service or an entity.

Entities map to services:

```
scene.*         -> scene.turn_on
light.*         -> light.toggle
script.*        -> script.toggle
switch.*        -> switch.toggle
media_player.*  -> media_player.media_play_pause
```

```yaml
resources:
  - url: /local/button-entity-row.js
    type: js

views:
  - title: Home
    id: home
    cards:
      - type: entities
        title: Living Room Lights
        show_header_toggle: false
        entities:
          - type: "custom:button-entity-row"
            buttons:
            
            # full configuration example
              - icon: mdi:lightbulb-on
                icon_color: yellow
                name: "On"
                service: scene.turn_on
                service_data:
                    entity_id: scene.lights_up
                    
            # basic entity, uses hass configured icon to display
              - scene.lights_out
              
            # entity with some overrides
              - icon: mdi:movie
                name: Movie
                entity: scene.movie_lights
```

You can also specify multply rows of buttons

```yaml
resources:
  - url: /local/button-entity-row.js
    type: js

views:
  - title: Home
    id: home
    cards:
      - type: entities
        title: Living Room Lights
        show_header_toggle: false
        entities:
          - type: "custom:button-entity-row"
            buttons:
              - - switch.light_1
                - switch.light_2
              - - media_player.roku
                - light.lamp
```

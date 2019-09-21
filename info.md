{% if installed and version_installed.replace("v", "").replace(".","") | int <= 20  %}
## Breaking changes after v0.2.0
* Removed depreciated `icon_color` attribute.
* Resource must now be defined using `type: module` instead of `js`
{% endif %}
## Images
<img src="https://github.com/custom-cards/button-entity-row/blob/master/examples/example-5.gif?raw=true" width="400px">
<img src="https://github.com/custom-cards/button-entity-row/blob/master/examples/example-gif.gif?raw=true" width="400px">
<img src="https://github.com/custom-cards/button-entity-row/blob/master/examples/example-1.png?raw=true" width="400px">
<img src="https://github.com/custom-cards/button-entity-row/blob/master/examples/example-3.png?raw=true" width="400px">

## Features
* Create icon, text, or icon-text buttons.
* Add css styling to each button.
* Call custom service when the button is clicked.
* Create multiple rows of buttons.
* Supports styling on/off state for entities.


// leaflet-bom-radar-card-editor.js
// Version 2.1.0 - Complete Fix

class LeafletBomRadarCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._rendered = false;
  }

  setConfig(config) {
    this._config = { ...config };
    console.log('BoM Radar Card Editor: Config set', this._config);
    
    if (this._rendered) {
      this.render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this.render();
      this._rendered = true;
    }
  }

  configChanged(newConfig) {
    console.log('BoM Radar Card Editor: Config changed', newConfig);
    
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._config) {
      console.warn('BoM Radar Card Editor: No config available for rendering');
      return;
    }

    console.log('BoM Radar Card Editor: Rendering with config', this._config);

    this.innerHTML = `
      <style>
        .card-config {
          padding: 16px;
        }
        .option {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .option label {
          flex: 1;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        .option input[type="number"],
        .option select {
          flex: 2;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .option input[type="checkbox"] {
          margin-left: auto;
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .help-text {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
          margin-left: 0;
          margin-bottom: 8px;
        }
        .section-header {
          font-size: 16px;
          font-weight: bold;
          margin: 24px 0 12px 0;
          color: var(--primary-text-color);
          border-bottom: 2px solid var(--divider-color);
          padding-bottom: 8px;
        }
        .section-header:first-child {
          margin-top: 8px;
        }
        .info-box {
          background: var(--secondary-background-color);
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--primary-text-color);
          border-left: 4px solid var(--primary-color);
        }
        .warning-box {
          background: var(--warning-color, #ff9800);
          color: white;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 13px;
        }
      </style>
      <div class="card-config">
        <div class="info-box">
          ℹ️ This card automatically loads radars based on your map view. No manual radar selection needed!
        </div>
        
        <div class="section-header">Display Settings</div>
        
        <div class="option">
          <label for="cache_hours">History Duration (hours)</label>
          <input
            type="number"
            id="cache_hours"
            min="1"
            max="24"
            .value="${this._config.cache_hours || 2}"
          />
        </div>
        <div class="help-text">
          Number of hours of radar history to display (1-24). Default: 2
        </div>
        
        <div class="option">
          <label for="default_zoom">Initial Zoom Level</label>
          <input
            type="number"
            id="default_zoom"
            min="5"
            max="15"
            .value="${this._config.default_zoom || 8}"
          />
        </div>
        <div class="help-text">
          Map zoom level when card loads (5=wide view, 15=close up). Default: 8
        </div>
        
        <div class="option">
          <label for="opacity">Radar Opacity</label>
          <input
            type="number"
            id="opacity"
            min="0"
            max="1"
            step="0.1"
            .value="${this._config.opacity || 0.7}"
          />
        </div>
        <div class="help-text">
          Transparency of radar overlay (0=invisible, 1=opaque). Default: 0.7
        </div>
        
        <div class="option">
          <label for="base_layer">Base Map Layer</label>
          <select id="base_layer">
            <option value="osm" ${this._config.base_layer === 'osm' || !this._config.base_layer ? 'selected' : ''}>
              OpenStreetMap
            </option>
            <option value="google" ${this._config.base_layer === 'google' ? 'selected' : ''}>
              Google Maps
            </option>
          </select>
        </div>
        <div class="help-text">
          Choose the underlying map style. Default: OpenStreetMap
        </div>
        
        <div class="section-header">Animation Settings</div>
        
        <div class="option">
          <label for="playback_speed">Playback Speed (ms)</label>
          <input
            type="number"
            id="playback_speed"
            min="100"
            max="2000"
            step="100"
            .value="${this._config.playback_speed || 500}"
          />
        </div>
        <div class="help-text">
          Milliseconds between frames (lower = faster animation). Default: 500ms
        </div>
        
        <div class="option">
          <label for="fade_duration">Fade Duration (ms)</label>
          <input
            type="number"
            id="fade_duration"
            min="0"
            max="1000"
            step="50"
            .value="${this._config.fade_duration || 300}"
          />
        </div>
        <div class="help-text">
          Transition time when switching radar images (0 = instant). Default: 300ms
        </div>
        
        <div class="section-header">Radar Coverage</div>
        
        <div class="option">
          <label for="max_radar_distance_km">Max Radar Distance (km)</label>
          <input
            type="number"
            id="max_radar_distance_km"
            min="200"
            max="1500"
            step="100"
            .value="${this._config.max_radar_distance_km || 800}"
          />
        </div>
        <div class="help-text">
          Maximum distance from viewport center to load radars. Default: 800km
        </div>
        
        <div class="section-header">Visual Options</div>
        
        <div class="option">
          <label for="show_legend">Show Rainfall Legend</label>
          <input
            type="checkbox"
            id="show_legend"
            ${this._config.show_legend !== false ? 'checked' : ''}
          />
        </div>
        <div class="help-text">
          Display the rainfall intensity legend on the map. Default: Yes
        </div>
      </div>
    `;

    // Attach event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.attachEventListeners();
    }, 10);
  }

  attachEventListeners() {
    const inputs = this.querySelectorAll('input, select');
    
    if (inputs.length === 0) {
      console.warn('BoM Radar Card Editor: No inputs found for event listeners');
      return;
    }
    
    console.log(`BoM Radar Card Editor: Attaching listeners to ${inputs.length} inputs`);
    
    inputs.forEach(input => {
      // Remove any existing listeners
      input.removeEventListener('change', this._boundValueChanged);
      input.removeEventListener('input', this._boundValueChanged);
      
      // Bind the handler
      if (!this._boundValueChanged) {
        this._boundValueChanged = (e) => this._valueChanged(e);
      }
      
      input.addEventListener('change', this._boundValueChanged);
      
      // For number inputs, also listen to input event for real-time updates
      if (input.type === 'number') {
        input.addEventListener('input', this._boundValueChanged);
      }
    });
  }

  _valueChanged(ev) {
    if (!this._config || !ev.target) {
      return;
    }

    const target = ev.target;
    const configValue = target.id;
    let value;

    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = parseFloat(target.value);
      // Validate number is within bounds
      if (isNaN(value)) {
        console.warn(`BoM Radar Card Editor: Invalid number for ${configValue}`);
        return;
      }
      
      // Apply min/max constraints
      const min = parseFloat(target.min);
      const max = parseFloat(target.max);
      if (!isNaN(min) && value < min) value = min;
      if (!isNaN(max) && value > max) value = max;
    } else {
      value = target.value;
    }

    // Don't update if value hasn't changed
    if (this._config[configValue] === value) {
      return;
    }

    console.log(`BoM Radar Card Editor: ${configValue} changed to ${value}`);

    // Create new config with updated value
    const newConfig = {
      ...this._config,
      [configValue]: value
    };

    this._config = newConfig;
    this.configChanged(newConfig);
  }
  
  disconnectedCallback() {
    // Clean up event listeners when element is removed
    const inputs = this.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.removeEventListener('change', this._boundValueChanged);
      input.removeEventListener('input', this._boundValueChanged);
    });
  }
}

customElements.define("leaflet-bom-radar-card-editor", LeafletBomRadarCardEditor);

console.info(
  '%c LEAFLET-BOM-RADAR-CARD-EDITOR %c Version 2.1.0 - Registered ',
  'color: green; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

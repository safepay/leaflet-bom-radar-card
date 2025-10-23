// leaflet-bom-radar-card.js
// Version 2.2.1 - Auth Fix: Use WebSocket API for ingress detection
// Dynamic Multi-Radar Support with Resolution

// ============================================================================
// EDITOR COMPONENT
// ============================================================================

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
      input.removeEventListener('change', this._boundValueChanged);
      input.removeEventListener('input', this._boundValueChanged);
      
      if (!this._boundValueChanged) {
        this._boundValueChanged = (e) => this._valueChanged(e);
      }
      
      input.addEventListener('change', this._boundValueChanged);
      
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
      if (isNaN(value)) {
        console.warn(`BoM Radar Card Editor: Invalid number for ${configValue}`);
        return;
      }
      
      const min = parseFloat(target.min);
      const max = parseFloat(target.max);
      if (!isNaN(min) && value < min) value = min;
      if (!isNaN(max) && value > max) value = max;
    } else {
      value = target.value;
    }

    if (this._config[configValue] === value) {
      return;
    }

    console.log(`BoM Radar Card Editor: ${configValue} changed to ${value}`);

    const newConfig = {
      ...this._config,
      [configValue]: value
    };

    this._config = newConfig;
    this.configChanged(newConfig);
  }
  
  disconnectedCallback() {
    const inputs = this.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (this._boundValueChanged) {
        input.removeEventListener('change', this._boundValueChanged);
        input.removeEventListener('input', this._boundValueChanged);
      }
    });
  }
}

// Register editor first
customElements.define("leaflet-bom-radar-card-editor", LeafletBomRadarCardEditor);

console.info(
  '%c LEAFLET-BOM-RADAR-CARD-EDITOR %c Registered ',
  'color: green; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

class LeafletBomRadarCard extends HTMLElement {
  constructor() {
    super();
    this.imageCache = new Map();
    this.radarTimestamps = new Map();
    this.activeOverlays = new Map();
    this.visibleRadars = new Set();
    this.allTimestamps = [];
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    this.playbackInterval = null;
    this.map = null;
    this.radarLocations = null;
    this.lastTimestampFetch = new Map();
    this.MIN_FETCH_INTERVAL = 600000;
    this.ingressUrl = null;
    this.updateViewportDebounce = null;
    this.currentResolution = null;
    this.isInSectionsDashboard = false;
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
  }

  connectedCallback() {
    this.isInSectionsDashboard = this._detectSectionsDashboard();
    console.log(`BoM Radar Card: Dashboard type: ${this.isInSectionsDashboard ? 'Sections' : 'Standard'}`);
  }

  _detectSectionsDashboard() {
    let parent = this.parentElement;
    let depth = 0;
    const maxDepth = 15;
    
    while (parent && depth < maxDepth) {
      const tagName = parent.tagName?.toLowerCase();
      const classList = Array.from(parent.classList || []);
      
      if (tagName === 'hui-section' || 
          tagName === 'hui-card' && classList.includes('section') ||
          classList.includes('sections') ||
          parent.getAttribute('type') === 'sections') {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }
    return false;
  }

  setConfig(config) {
    this.config = {
      cache_hours: config.cache_hours || 2,
      playback_speed: config.playback_speed || 500,
      default_zoom: config.default_zoom || 8,
      opacity: config.opacity || 0.7,
      base_layer: config.base_layer || 'osm',
      show_legend: config.show_legend !== false,
      fade_duration: config.fade_duration || 300,
      max_radar_distance_km: config.max_radar_distance_km || 800,
    };
    
    // Handle layout_options for sections
    if (config.layout_options) {
      this.config.layout_options = config.layout_options;
    }
    
    console.log('BoM Radar Card: Config set', this.config);
  }

  set hass(hass) {
    this._hass = hass;
  
    if (!this.content) {
      this.initializeWithHass().catch(err => {
        console.error('BoM Radar Card: Initialization failed:', err);
        this.showError(`Initialization failed: ${err.message}`);
      });
    }
  }
  
  async initializeWithHass() {
    console.log('BoM Radar Card: Starting initialization...');
    
    try {
      await this.getIngressUrl();
      console.log('BoM Radar Card: Ingress URL obtained:', this.ingressUrl);
      
      if (!this.radarLocations) {
        await this.loadRadarData();
        console.log('BoM Radar Card: Radar data loaded');
      }
      
      this.render();
      console.log('BoM Radar Card: Rendered');
      
      await this.setupMap();
      console.log('BoM Radar Card: Map setup complete');
      
      await this.initializeViewport();
      console.log('BoM Radar Card: Viewport initialized');
      
    } catch (error) {
      console.error('BoM Radar Card: Fatal initialization error:', error);
      
      if (this.initializationAttempts < this.maxInitAttempts) {
        this.initializationAttempts++;
        console.log(`BoM Radar Card: Retrying initialization (attempt ${this.initializationAttempts})...`);
        setTimeout(() => this.initializeWithHass(), 2000);
      } else {
        this.showError(`Failed to initialize after ${this.maxInitAttempts} attempts. Check add-on is running.`);
      }
    }
  }
  
  async getIngressUrl() {
    // For add-ons, the ingress path follows a predictable pattern
    // The slug from config.yaml is: bom_radar_proxy
    const possiblePaths = [
      '/api/hassio_ingress/bom_radar_proxy',
      // Fallback for local development
      '/api/hassio_ingress/local_bom_radar_proxy'
    ];
    
    for (const path of possiblePaths) {
      console.log('BoM Radar Card: Testing ingress path:', path);
      if (await this.testIngressUrl(path)) {
        this.ingressUrl = path;
        console.log('BoM Radar Card: Ingress URL validated:', path);
        return;
      }
    }
    
    throw new Error('Could not detect working ingress URL. Ensure add-on is running and accessible.');
  }

  async getIngressFromAPI() {
    if (!this._hass || !this._hass.callWS) {
      throw new Error('Home Assistant connection not available');
    }
    
    try {
      // Use WebSocket API instead of REST API to avoid auth issues
      const result = await this._hass.callWS({
        type: 'supervisor/api',
        endpoint: '/ingress/session',
        method: 'post',
        data: {
          addon: 'local_bom_radar_proxy'
        }
      });
      
      if (result && result.data && result.data.session) {
        return `/api/hassio_ingress/${result.data.session}`;
      }
    } catch (error) {
      console.warn('BoM Radar Card: WS API ingress detection failed:', error.message);
    }
    
    throw new Error('API ingress detection failed');
  }

  detectIngressFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/api\/hassio_ingress\/([^\/]+)/);
    
    if (match) {
      return `/api/hassio_ingress/${match[1]}`;
    }
    
    throw new Error('No ingress path in URL');
  }

  async tryCommonIngressPaths() {
    // Try to get actual add-on info from supervisor
    if (this._hass && this._hass.callWS) {
      try {
        const addons = await this._hass.callWS({
          type: 'supervisor/api',
          endpoint: '/addons',
          method: 'get'
        });
        
        if (addons && addons.data && addons.data.addons) {
          // Look for our add-on by name or slug
          const bomAddon = addons.data.addons.find(addon => 
            addon.name && addon.name.toLowerCase().includes('bom') && 
            addon.name.toLowerCase().includes('radar')
          );
          
          if (bomAddon && bomAddon.slug) {
            const testPath = `/api/hassio_ingress/${bomAddon.slug}`;
            console.log('BoM Radar Card: Found add-on slug:', bomAddon.slug);
            if (await this.testIngressUrl(testPath)) {
              return testPath;
            }
          }
        }
      } catch (error) {
        console.warn('BoM Radar Card: Could not query add-ons:', error.message);
      }
    }
    
    // Fallback to common paths
    const commonPaths = [
      '/api/hassio_ingress/bom_radar_proxy',
      '/api/hassio_ingress/local_bom_radar_proxy',
      '/api/hassio_ingress/bom-radar-proxy',
      '/local/bom-radar-proxy'
    ];
    
    for (const path of commonPaths) {
      console.log('BoM Radar Card: Testing path:', path);
      if (await this.testIngressUrl(path)) {
        return path;
      }
    }
    
    throw new Error('No common ingress paths work');
  }

  async testIngressUrl(url) {
    try {
      const testUrl = `${url}/health`;
      console.log('BoM Radar Card: Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        // Add credentials for ingress
        credentials: 'same-origin'
      });
      
      console.log('BoM Radar Card: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('BoM Radar Card: Health check response:', data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('BoM Radar Card: URL test failed:', url, error.message);
      return false;
    }
  }
  
  async apiRequest(endpoint) {
    if (!this.ingressUrl) {
      throw new Error('Ingress URL not initialized');
    }
    
    const url = `${this.ingressUrl}${endpoint}`;
    console.log('BoM Radar Card: API request:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  async loadRadarData() {
    try {
      const response = await this.apiRequest('/api/radars');
      const data = await response.json();
      
      this.radarLocations = {};
      data.features.forEach(feature => {
        const id = feature.properties.id;
        this.radarLocations[id] = {
          id: id,
          name: feature.properties.name,
          state: feature.properties.state,
          type: feature.properties.type,
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0]
        };
      });
      
      console.log(`BoM Radar Card: Loaded ${Object.keys(this.radarLocations).length} radar locations`);
    } catch (error) {
      console.error('BoM Radar Card: Failed to load radar data:', error);
      throw new Error(`Failed to load radar locations: ${error.message}`);
    }
  }

  render() {
    if (!this.content) {
      const mapHeight = this.isInSectionsDashboard ? '450px' : '500px';
      
      this.innerHTML = `
        <ha-card>
          <div class="card-header">
            <div class="name">Australian Weather Radar</div>
            <div class="radar-info" id="radar-info">Loading...</div>
          </div>
          <div class="card-content">
            <div id="map-container">
              <div id="radar-map" style="height: ${mapHeight}"></div>
              ${this.config.show_legend ? this.renderLegend() : ''}
              <div id="loading-overlay" class="loading-overlay" style="display: none;">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading radar data...</div>
              </div>
            </div>
            <div class="controls-container">
              ${this.renderControls()}
            </div>
            <div class="status-bar">
              <span id="timestamp-display">Initializing...</span>
              <span id="status-info"></span>
            </div>
          </div>
          <div id="error-message" class="error-message" style="display: none;"></div>
        </ha-card>
        <style>
          ${this.getStyles()}
        </style>
      `;
      this.content = this.querySelector('.card-content');
    }
  }

  renderLegend() {
    return `
      <div class="radar-legend">
        <div class="legend-title">Rainfall Rate</div>
        <div class="legend-items">
          <div class="legend-item"><span class="legend-color" style="background: #00ECEC;"></span>Light</div>
          <div class="legend-item"><span class="legend-color" style="background: #01A0F6;"></span>Moderate</div>
          <div class="legend-item"><span class="legend-color" style="background: #0000F6;"></span>Heavy</div>
          <div class="legend-item"><span class="legend-color" style="background: #00FF00;"></span>Very Heavy</div>
          <div class="legend-item"><span class="legend-color" style="background: #FFFF00;"></span>Intense</div>
          <div class="legend-item"><span class="legend-color" style="background: #FF0000;"></span>Extreme</div>
        </div>
      </div>
    `;
  }

  renderControls() {
    return `
      <div class="radar-controls">
        <div class="playback-controls">
          <button id="play-btn" class="control-btn" title="Play animation">▶</button>
          <button id="pause-btn" class="control-btn" title="Pause animation" style="display: none;">⏸</button>
          <button id="prev-btn" class="control-btn" title="Previous frame">⏮</button>
          <button id="next-btn" class="control-btn" title="Next frame">⏭</button>
          <button id="refresh-btn" class="control-btn" title="Refresh radar data">🔄</button>
        </div>
        <div class="timeline-container">
          <input type="range" 
                 id="timeline-slider" 
                 min="0" 
                 max="100" 
                 value="0"
                 class="timeline-slider"
                 title="Scrub through radar images">
          <div id="timeline-labels" class="timeline-labels"></div>
        </div>
        <div class="zoom-controls">
          <label>Zoom:</label>
          <button id="zoom-in" class="control-btn" title="Zoom in">+</button>
          <button id="zoom-out" class="control-btn" title="Zoom out">−</button>
          <button id="zoom-home" class="control-btn" title="Reset to home location">⌂</button>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      ha-card {
        overflow: hidden;
        height: 100%;
      }
      .card-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      .name {
        font-size: 24px;
        font-weight: 500;
      }
      .radar-info {
        font-size: 14px;
        color: var(--secondary-text-color);
      }
      .card-content {
        padding: 0;
        display: flex;
        flex-direction: column;
        height: calc(100% - 70px);
      }
      #map-container {
        position: relative;
        width: 100%;
        flex: 1;
      }
      #radar-map {
        height: 100%;
        width: 100%;
      }
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      .loading-spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .loading-text {
        color: white;
        margin-top: 16px;
        font-size: 16px;
      }
      .radar-legend {
        position: absolute;
        bottom: 40px;
        right: 10px;
        background: rgba(255, 255, 255, 0.95);
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        font-size: 12px;
        backdrop-filter: blur(4px);
      }
      .legend-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 13px;
      }
      .legend-items {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .legend-color {
        width: 24px;
        height: 14px;
        border: 1px solid #ccc;
        border-radius: 2px;
      }
      .controls-container {
        padding: 16px;
        background: var(--card-background-color);
        border-top: 1px solid var(--divider-color);
      }
      .radar-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .playback-controls {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .control-btn {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        padding: 10px 18px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
        min-width: 44px;
        min-height: 44px;
      }
      .control-btn:hover {
        background: var(--primary-color-dark, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .control-btn:active {
        transform: translateY(0);
      }
      .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .timeline-container {
        width: 100%;
        position: relative;
      }
      .timeline-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        outline: none;
        -webkit-appearance: none;
        background: var(--divider-color);
        cursor: pointer;
      }
      .timeline-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .timeline-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .timeline-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }
      .zoom-controls {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
      }
      .zoom-controls label {
        font-weight: 500;
      }
      .status-bar {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border-top: 1px solid var(--divider-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: var(--secondary-text-color);
        flex-wrap: wrap;
        gap: 8px;
      }
      #timestamp-display {
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .error-message {
        padding: 16px;
        background: var(--error-color, #f44336);
        color: white;
        text-align: center;
        font-size: 14px;
      }
      .leaflet-container {
        background: #a0d6f5 !important;
        font-family: inherit;
      }
      .leaflet-fade-anim .leaflet-popup {
        transition: opacity ${this.config.fade_duration}ms;
      }
      .leaflet-zoom-anim .leaflet-zoom-animated {
        transition: transform 0.25s cubic-bezier(0,0,0.25,1);
      }
      
      @media (max-width: 600px) {
        .card-header {
          flex-direction: column;
          align-items: stretch;
        }
        .name {
          font-size: 20px;
        }
        .playback-controls {
          justify-content: space-between;
        }
        .control-btn {
          flex: 1;
          min-width: auto;
          padding: 8px 12px;
        }
        .zoom-controls {
          justify-content: space-between;
        }
        .radar-legend {
          font-size: 10px;
          padding: 8px;
          bottom: 30px;
          right: 5px;
        }
        .legend-color {
          width: 20px;
          height: 12px;
        }
      }
    `;
  }

  async setupMap() {
    await this.loadLeaflet();
    
    const latitude = this._hass.config.latitude || -37.8136;
    const longitude = this._hass.config.longitude || 144.9631;
    
    this.map = L.map(this.querySelector('#radar-map'), {
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true
    }).setView([latitude, longitude], this.config.default_zoom);
    
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);
    
    this.map.attributionControl.setPrefix('Leaflet');
    
    this.addBaseLayer();
    this.addHomeMarker(latitude, longitude);
    this.setupEventListeners();
    
    this.map.on('moveend zoomend', () => {
      this.onViewportChange();
    });
    
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  async loadLeaflet() {
    if (window.L) return;
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  addBaseLayer() {
    if (this.config.base_layer === 'google') {
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '© Google Maps',
        maxZoom: 20
      }).addTo(this.map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
    }
  }

  addHomeMarker(lat, lon) {
    const homeIcon = L.divIcon({
      html: '<div style="font-size: 24px;">🏠</div>',
      className: 'home-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    L.marker([lat, lon], { icon: homeIcon })
      .addTo(this.map)
      .bindPopup('<b>Home</b>');
  }

  setupEventListeners() {
    this.querySelector('#play-btn').addEventListener('click', () => this.play());
    this.querySelector('#pause-btn').addEventListener('click', () => this.pause());
    this.querySelector('#prev-btn').addEventListener('click', () => this.previousFrame());
    this.querySelector('#next-btn').addEventListener('click', () => this.nextFrame());
    this.querySelector('#refresh-btn').addEventListener('click', () => this.refreshRadarData());
    
    this.querySelector('#timeline-slider').addEventListener('input', (e) => {
      this.goToFrame(parseInt(e.target.value));
    });
    
    this.querySelector('#zoom-in').addEventListener('click', () => {
      this.map.zoomIn();
    });
    
    this.querySelector('#zoom-out').addEventListener('click', () => {
      this.map.zoomOut();
    });
    
    this.querySelector('#zoom-home').addEventListener('click', () => {
      const homeLat = this._hass.config.latitude || -37.8136;
      const homeLon = this._hass.config.longitude || 144.9631;
      this.map.setView([homeLat, homeLon], this.config.default_zoom);
    });
  }

  getResolutionForZoom(zoom) {
    if (zoom >= 11) {
      return 64;
    } else if (zoom >= 9) {
      return 128;
    } else {
      return 256;
    }
  }

  async initializeViewport() {
    this.showLoading(true);
    this.updateStatusDisplay('Detecting visible radars...');
    
    try {
      await this.updateVisibleRadars();
      
      if (this.visibleRadars.size === 0) {
        this.updateStatusDisplay('No radars in view. Pan or zoom out to see radar coverage.');
        this.showLoading(false);
        return;
      }
      
      await this.loadTimestampsForVisibleRadars();
      await this.buildTimelineFromAllRadars();
      
      if (this.allTimestamps.length > 0) {
        this.currentFrameIndex = this.allTimestamps.length - 1;
        await this.displayCurrentFrame();
        this.updateTimeline();
        this.updateTimelineLabels();
      }
      
      this.updateRadarInfo();
      this.showLoading(false);
    } catch (error) {
      console.error('BoM Radar Card: Failed to initialize viewport:', error);
      this.showError('Failed to load radar data: ' + error.message);
      this.showLoading(false);
    }
  }

  onViewportChange() {
    clearTimeout(this.updateViewportDebounce);
    this.updateViewportDebounce = setTimeout(() => {
      this.updateVisibleRadarsAndDisplay();
    }, 300);
  }

  async updateVisibleRadarsAndDisplay() {
    const previousRadars = new Set(this.visibleRadars);
    const previousResolution = this.currentResolution;
    const newResolution = this.getResolutionForZoom(this.map.getZoom());
    
    await this.updateVisibleRadars();
    
    const radarsChanged = !this.setsEqual(previousRadars, this.visibleRadars);
    const resolutionChanged = previousResolution !== newResolution;
    
    if (radarsChanged || resolutionChanged) {
      if (resolutionChanged) {
        console.log(`BoM Radar Card: Resolution changed from ${previousResolution}km to ${newResolution}km`);
        this.currentResolution = newResolution;
      }
      
      if (radarsChanged) {
        console.log(`BoM Radar Card: Visible radars changed. Now showing: ${Array.from(this.visibleRadars).join(', ')}`);
      }
      
      await this.loadTimestampsForVisibleRadars();
      await this.buildTimelineFromAllRadars();
      
      if (this.allTimestamps.length > 0) {
        this.currentFrameIndex = Math.min(this.currentFrameIndex, this.allTimestamps.length - 1);
        await this.displayCurrentFrame();
        this.updateTimeline();
        this.updateTimelineLabels();
      }
      
      this.updateRadarInfo();
      this.updateStatusInfo();
      this.cleanupHiddenRadars();
    }
  }

  async updateVisibleRadars() {
    const bounds = this.map.getBounds();
    const center = this.map.getCenter();
    
    this.visibleRadars.clear();
    
    for (const [id, radar] of Object.entries(this.radarLocations)) {
      const radarLatLng = L.latLng(radar.lat, radar.lon);
      const distanceKm = center.distanceTo(radarLatLng) / 1000;
      
      if (bounds.contains(radarLatLng) || distanceKm <= this.config.max_radar_distance_km) {
        if (this.isRadarCoverageVisible(radar, bounds)) {
          this.visibleRadars.add(id);
        }
      }
    }
    
    console.log(`BoM Radar Card: Found ${this.visibleRadars.size} visible radars:`, Array.from(this.visibleRadars));
  }

  isRadarCoverageVisible(radar, bounds) {
    const resolution = this.getResolutionForZoom(this.map.getZoom());
    const maxRadiusKm = Math.max(256, resolution);
    
    const latDelta = maxRadiusKm / 111.32;
    const lonDelta = maxRadiusKm / (111.32 * Math.cos(radar.lat * Math.PI / 180));
    
    const radarBounds = L.latLngBounds(
      [radar.lat - latDelta, radar.lon - lonDelta],
      [radar.lat + latDelta, radar.lon + lonDelta]
    );
    
    return bounds.intersects(radarBounds);
  }

  async loadTimestampsForVisibleRadars() {
    const fetchPromises = [];
    
    for (const radarId of this.visibleRadars) {
      const lastFetch = this.lastTimestampFetch.get(radarId) || 0;
      const timeSinceLastFetch = Date.now() - lastFetch;
      
      if (timeSinceLastFetch >= this.MIN_FETCH_INTERVAL || !this.radarTimestamps.has(radarId)) {
        fetchPromises.push(this.fetchTimestampsForRadar(radarId));
      }
    }
    
    if (fetchPromises.length > 0) {
      this.updateStatusDisplay(`Loading timestamps for ${fetchPromises.length} radar(s)...`);
      await Promise.allSettled(fetchPromises);
    }
  }

  async fetchTimestampsForRadar(radarId) {
    try {
      const zoom = this.map.getZoom();
      const resolution = this.getResolutionForZoom(zoom);
      
      const limit = Math.ceil((this.config.cache_hours * 60) / 10);
      const response = await this.apiRequest(`/api/timestamps/${radarId}/${resolution}?limit=${limit}`);
      const data = await response.json();
      
      this.radarTimestamps.set(radarId, data.timestamps || []);
      this.lastTimestampFetch.set(radarId, Date.now());
      
      console.log(`BoM Radar Card: Fetched ${data.timestamps.length} timestamps for ${radarId} at ${resolution}km`);
    } catch (error) {
      console.error(`BoM Radar Card: Failed to fetch timestamps for ${radarId}:`, error);
      this.radarTimestamps.set(radarId, []);
    }
  }

  async buildTimelineFromAllRadars() {
    const timestampSet = new Set();
    
    for (const radarId of this.visibleRadars) {
      const timestamps = this.radarTimestamps.get(radarId) || [];
      timestamps.forEach(ts => timestampSet.add(ts));
    }
    
    this.allTimestamps = Array.from(timestampSet).sort();
    
    console.log(`BoM Radar Card: Built timeline with ${this.allTimestamps.length} unique timestamps`);
  }

  async displayCurrentFrame() {
    if (this.allTimestamps.length === 0) return;
    
    const currentTimestamp = this.allTimestamps[this.currentFrameIndex];
    
    const displayPromises = [];
    
    for (const radarId of this.visibleRadars) {
      const timestamps = this.radarTimestamps.get(radarId) || [];
      const closestTimestamp = this.findClosestTimestamp(timestamps, currentTimestamp);
      
      if (closestTimestamp) {
        displayPromises.push(this.displayRadarImage(radarId, closestTimestamp));
      }
    }
    
    await Promise.allSettled(displayPromises);
    
    this.updateTimestampDisplay(currentTimestamp);
  }

  findClosestTimestamp(timestamps, targetTimestamp) {
    if (timestamps.length === 0) return null;
    
    let closest = null;
    let minDiff = Infinity;
    
    for (const ts of timestamps) {
      if (ts <= targetTimestamp) {
        const diff = parseInt(targetTimestamp) - parseInt(ts);
        if (diff < minDiff) {
          minDiff = diff;
          closest = ts;
        }
      }
    }
    
    return closest || timestamps[0];
  }

  async displayRadarImage(radarId, timestamp) {
    const zoom = this.map.getZoom();
    const resolution = this.getResolutionForZoom(zoom);
    
    const cacheKey = `${radarId}_${timestamp}_${resolution}`;
    const overlayId = `${radarId}_overlay`;
    
    if (!this.imageCache.has(cacheKey)) {
      const imageUrl = `${this.ingressUrl}/api/radar/${radarId}/${timestamp}/${resolution}`;
      this.imageCache.set(cacheKey, imageUrl);
    }
    
    const imageUrl = this.imageCache.get(cacheKey);
    const radar = this.radarLocations[radarId];
    
    const bounds = this.calculateRadarBounds(radar, resolution);
    
    if (this.activeOverlays.has(overlayId)) {
      const oldOverlay = this.activeOverlays.get(overlayId);
      
      if (oldOverlay._image) {
        oldOverlay._image.style.transition = `opacity ${this.config.fade_duration}ms`;
        oldOverlay._image.style.opacity = '0';
        
        setTimeout(() => {
          this.map.removeLayer(oldOverlay);
        }, this.config.fade_duration);
      } else {
        this.map.removeLayer(oldOverlay);
      }
    }
    
    const overlay = L.imageOverlay(imageUrl, bounds, {
      opacity: 0,
      interactive: false,
      crossOrigin: 'anonymous',
      className: `radar-overlay radar-${radarId}`
    });
    
    overlay.addTo(this.map);
    this.activeOverlays.set(overlayId, overlay);
    
    overlay.on('load', () => {
      if (overlay._image) {
        overlay._image.style.transition = `opacity ${this.config.fade_duration}ms`;
        setTimeout(() => {
          overlay.setOpacity(this.config.opacity);
        }, 10);
      }
    });
  }

  calculateRadarBounds(radar, resolution = null) {
    let radiusKm;
    
    if (resolution) {
      radiusKm = resolution;
    } else {
      const zoom = this.map.getZoom();
      radiusKm = this.getResolutionForZoom(zoom);
    }
    
    const latDelta = radiusKm / 111.32;
    const lonDelta = radiusKm / (111.32 * Math.cos(radar.lat * Math.PI / 180));
    
    return [
      [radar.lat - latDelta, radar.lon - lonDelta],
      [radar.lat + latDelta, radar.lon + lonDelta]
    ];
  }

  cleanupHiddenRadars() {
    for (const [overlayId, overlay] of this.activeOverlays.entries()) {
      const radarId = overlayId.replace('_overlay', '');
      
      if (!this.visibleRadars.has(radarId)) {
        if (overlay._image) {
          overlay._image.style.transition = `opacity ${this.config.fade_duration}ms`;
          overlay._image.style.opacity = '0';
          
          setTimeout(() => {
            this.map.removeLayer(overlay);
            this.activeOverlays.delete(overlayId);
          }, this.config.fade_duration);
        } else {
          this.map.removeLayer(overlay);
          this.activeOverlays.delete(overlayId);
        }
      }
    }
  }

  updateRadarInfo() {
    const radarInfo = this.querySelector('#radar-info');
    if (radarInfo) {
      const count = this.visibleRadars.size;
      const radarNames = Array.from(this.visibleRadars)
        .map(id => this.radarLocations[id].name)
        .join(', ');
      
      radarInfo.textContent = count > 0 
        ? `Showing ${count} radar${count > 1 ? 's' : ''}: ${radarNames}`
        : 'No radars in view';
    }
  }

  updateStatusInfo() {
    const zoom = this.map.getZoom();
    const resolution = this.getResolutionForZoom(zoom);
    const statusInfo = this.querySelector('#status-info');
    
    if (statusInfo) {
      statusInfo.textContent = `Zoom: ${zoom} (${resolution}km resolution)`;
    }
  }

  updateTimestampDisplay(timestamp) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    
    const date = new Date(year, month - 1, day, hour, minute);
    
    const formatted = date.toLocaleString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const now = new Date();
    const ageMinutes = Math.round((now - date) / 60000);
    const ageText = ageMinutes < 60 
      ? `${ageMinutes}min ago` 
      : `${Math.round(ageMinutes / 60)}hr ago`;
    
    this.querySelector('#timestamp-display').textContent = `${formatted} (${ageText})`;
  }

  updateStatusDisplay(message) {
    this.querySelector('#timestamp-display').textContent = message;
  }

  updateTimeline() {
    const slider = this.querySelector('#timeline-slider');
    slider.max = Math.max(0, this.allTimestamps.length - 1);
    slider.value = this.currentFrameIndex;
  }

  updateTimelineLabels() {
    if (this.allTimestamps.length === 0) return;
    
    const labelsContainer = this.querySelector('#timeline-labels');
    const first = this.allTimestamps[0];
    const last = this.allTimestamps[this.allTimestamps.length - 1];
    
    const formatTime = (ts) => {
      const hour = ts.substring(8, 10);
      const minute = ts.substring(10, 12);
      return `${hour}:${minute}`;
    };
    
    labelsContainer.innerHTML = `
      <span>${formatTime(first)}</span>
      <span>${formatTime(last)}</span>
    `;
  }

  async refreshRadarData() {
    const refreshBtn = this.querySelector('#refresh-btn');
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳';
    
    this.showLoading(true);
    
    try {
      this.lastTimestampFetch.clear();
      
      const fetchPromises = [];
      for (const radarId of this.visibleRadars) {
        fetchPromises.push(this.fetchTimestampsForRadar(radarId));
      }
      
      await Promise.allSettled(fetchPromises);
      
      await this.buildTimelineFromAllRadars();
      
      if (this.allTimestamps.length > 0) {
        this.currentFrameIndex = this.allTimestamps.length - 1;
        await this.displayCurrentFrame();
        this.updateTimeline();
        this.updateTimelineLabels();
      }
      
      this.updateStatusDisplay('Radar data refreshed');
    } catch (error) {
      console.error('BoM Radar Card: Failed to refresh:', error);
      this.showError('Failed to refresh: ' + error.message);
    } finally {
      this.showLoading(false);
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄';
    }
  }

  play() {
    if (this.isPlaying || this.allTimestamps.length === 0) return;
    
    this.isPlaying = true;
    this.querySelector('#play-btn').style.display = 'none';
    this.querySelector('#pause-btn').style.display = 'inline-block';
    
    this.playbackInterval = setInterval(() => {
      this.nextFrame();
    }, this.config.playback_speed);
  }

  pause() {
    this.isPlaying = false;
    this.querySelector('#play-btn').style.display = 'inline-block';
    this.querySelector('#pause-btn').style.display = 'none';
    
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  async nextFrame() {
    if (this.allTimestamps.length === 0) return;
    
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.allTimestamps.length;
    await this.displayCurrentFrame();
    this.updateTimeline();
  }

  async previousFrame() {
    if (this.allTimestamps.length === 0) return;
    
    this.currentFrameIndex = (this.currentFrameIndex - 1 + this.allTimestamps.length) % this.allTimestamps.length;
    await this.displayCurrentFrame();
    this.updateTimeline();
  }

  async goToFrame(index) {
    if (index < 0 || index >= this.allTimestamps.length) return;
    
    this.currentFrameIndex = index;
    await this.displayCurrentFrame();
  }

  showLoading(show) {
    const overlay = this.querySelector('#loading-overlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    console.error('BoM Radar Card: Showing error:', message);
    const errorEl = this.querySelector('#error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 10000);
    }
  }

  setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  getCardSize() {
    return this.isInSectionsDashboard ? 4 : 6;
  }

  getLayoutOptions() {
    return {
      grid_columns: 4,
      grid_min_columns: 2,
      grid_max_columns: 4,
      grid_min_rows: 4,
      grid_max_rows: 6
    };
  }

  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  static getConfigElement() {
    return document.createElement("leaflet-bom-radar-card-editor");
  }

  static getStubConfig() {
    return {
      cache_hours: 2,
      playback_speed: 500,
      default_zoom: 8,
      opacity: 0.7,
      base_layer: "osm",
      show_legend: true,
      fade_duration: 300,
      max_radar_distance_km: 800
    };
  }
}

customElements.define('leaflet-bom-radar-card', LeafletBomRadarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'leaflet-bom-radar-card',
  name: 'Leaflet BoM Radar Card',
  description: 'Dynamic multi-radar display with viewport-based loading and resolution support',
  preview: false,
  documentationURL: 'https://github.com/safepay/leaflet-bom-radar-card',
  configurable: true
});

console.info(
  '%c LEAFLET-BOM-RADAR-CARD %c Version 2.2.1 - Auth Fix ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

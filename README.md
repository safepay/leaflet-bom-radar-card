# Leaflet BoM Radar Card for Home Assistant

A custom Home Assistant Lovelace card that displays Australian Bureau of Meteorology (BoM) weather radar imagery with dynamic multi-radar support, viewport-based loading, and resolution scaling.

## Features

- **Dynamic Multi-Radar Loading**: Automatically loads radars based on your map viewport
- **Resolution Scaling**: Adjusts radar resolution (64km, 128km, 256km) based on zoom level
- **Smooth Animations**: Fade transitions and timeline playback
- **Sections Dashboard Support**: Optimized for both standard and sections dashboards
- **Intelligent Caching**: Reduces load on BoM servers with local caching
- **Visual Editor**: Easy configuration through Home Assistant UI

## Prerequisites

1. **Home Assistant Add-on**: The BoM Radar Proxy add-on must be installed and running
2. **HACS** (recommended): For easy installation and updates

## Installation

### Method 1: HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the "+" button
4. Search for "Leaflet BoM Radar Card"
5. Click "Install"
6. Restart Home Assistant

### Method 2: Manual Installation

1. Download both files:
   - `leaflet-bom-radar-card.js`
   - `leaflet-bom-radar-card-editor.js`

2. Copy both files to your Home Assistant configuration directory:
   ```
   /config/www/leaflet-bom-radar-card.js
   /config/www/leaflet-bom-radar-card-editor.js
   ```

3. Add the resource in Home Assistant:
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - Set URL to: `/local/leaflet-bom-radar-card.js`
   - Set Resource type to: JavaScript Module
   - Click "Create"

4. **IMPORTANT**: Also add the editor as a resource:
   - Click "Add Resource" again
   - Set URL to: `/local/leaflet-bom-radar-card-editor.js`
   - Set Resource type to: JavaScript Module
   - Click "Create"

5. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)

## Add-on Setup

The card requires the BoM Radar Proxy add-on to be installed and running.

### Installing the Add-on

1. Go to Settings → Add-ons → Add-on Store
2. Click the three dots (⋮) in the top right
3. Select "Repositories"
4. Add the repository URL (ask your add-on provider)
5. Install "BoM Radar Proxy"
6. Start the add-on
7. Optionally enable "Start on boot" and "Watchdog"

### Verifying Add-on is Running

1. Open the add-on and check the "Info" tab shows it's running
2. Click "Open Web UI" - you should see a dashboard
3. Check the logs for any errors

## Adding the Card

### Visual Editor (Recommended)

1. Edit your dashboard
2. Click "Add Card"
3. Search for "Leaflet BoM Radar"
4. Click to add
5. Configure options in the visual editor:
   - **History Duration**: Hours of radar history (1-24)
   - **Initial Zoom Level**: Starting zoom (5-15)
   - **Radar Opacity**: Transparency (0-1)
   - **Base Map Layer**: OSM or Google Maps
   - **Playback Speed**: Animation speed in ms
   - **Fade Duration**: Transition time in ms
   - **Max Radar Distance**: Coverage radius in km
   - **Show Rainfall Legend**: Toggle legend display

### Manual YAML

```yaml
type: custom:leaflet-bom-radar-card
cache_hours: 2
playback_speed: 500
default_zoom: 8
opacity: 0.7
base_layer: osm
show_legend: true
fade_duration: 300
max_radar_distance_km: 800
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cache_hours` | number | 2 | Hours of radar history to display (1-24) |
| `playback_speed` | number | 500 | Milliseconds between animation frames |
| `default_zoom` | number | 8 | Initial map zoom level (5-15) |
| `opacity` | number | 0.7 | Radar overlay opacity (0-1) |
| `base_layer` | string | 'osm' | Base map: 'osm' or 'google' |
| `show_legend` | boolean | true | Show rainfall intensity legend |
| `fade_duration` | number | 300 | Fade transition time in ms |
| `max_radar_distance_km` | number | 800 | Max distance to load radars (km) |

## Troubleshooting

### Card Not Appearing

**Check Resource Registration:**
```
Settings → Dashboards → Resources
```
- Ensure `/local/leaflet-bom-radar-card.js` is listed
- Ensure `/local/leaflet-bom-radar-card-editor.js` is listed
- Both should be "JavaScript Module" type

**Clear Browser Cache:**
- Press Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
- Or open developer tools (F12) → Network tab → check "Disable cache"

### Editor Not Visible

**Symptom**: Card works but shows no config options when editing

**Solution**:
1. Ensure `leaflet-bom-radar-card-editor.js` is added as a resource
2. Check browser console (F12) for errors
3. Try removing and re-adding the card
4. Clear cache and refresh

**Check Console**:
```javascript
// Should see in console:
"LEAFLET-BOM-RADAR-CARD-EDITOR Version 2.1.0 - Registered"
```

### "Failed to Initialize" Error

**Check Add-on Status:**
1. Go to Settings → Add-ons → BoM Radar Proxy
2. Ensure it shows "Running"
3. Click "Open Web UI" - should see dashboard
4. Check "Log" tab for errors

**Check Ingress URL:**
- The card auto-detects the ingress URL
- Check browser console (F12) for messages like:
  ```
  "BoM Radar Card: Ingress URL validated: /api/hassio_ingress/..."
  ```

**Manual Ingress Test:**
- Open: `http://YOUR_HA_IP:8123/api/hassio_ingress/bom_radar_proxy/health`
- Should return JSON with `"status": "healthy"`

### No Radar Images Appearing

**Check Network Requests:**
1. Open browser console (F12) → Network tab
2. Look for failed requests to `/api/radar/...`
3. Check response codes and error messages

**Verify Radar Coverage:**
- Pan/zoom the map to ensure you're viewing an area with radar coverage
- Australia only - radars won't appear for other countries
- Try zooming out to see more radars

**Check Add-on Logs:**
```
Settings → Add-ons → BoM Radar Proxy → Log
```
- Look for FTP connection errors
- Check for timestamp fetch errors

### Sections Dashboard Issues

**Card Too Small/Large:**
- The card auto-detects sections dashboards
- Default height: 450px (sections) or 500px (standard)
- Manually adjust in sections: drag card corner to resize

**Map Not Fitting:**
- Click the home button (⌂) to reset view
- Adjust `default_zoom` config option
- Try different grid sizes in sections

### Performance Issues

**Slow Loading:**
- Reduce `cache_hours` (less data to fetch)
- Increase `max_radar_distance_km` only if needed
- Check add-on has sufficient resources

**Animation Stuttering:**
- Increase `playback_speed` (slower animation)
- Reduce `fade_duration` (faster transitions)
- Close other browser tabs

**High Memory Usage:**
- The card caches images in memory
- Reduce `cache_hours` to cache fewer images
- Refresh page to clear cache

## Browser Console Debugging

Open browser console (F12) to see detailed logging:

**Expected Messages:**
```
BoM Radar Card: Dashboard type: Sections
BoM Radar Card: Config set {cache_hours: 2, ...}
BoM Radar Card: Starting initialization...
BoM Radar Card: Ingress URL obtained: /api/hassio_ingress/...
BoM Radar Card: Radar data loaded
BoM Radar Card: Found 3 visible radars: IDR02, IDR68, IDR71
```

**Error Messages to Watch For:**
```
Failed to load radar data: [error details]
Could not detect working ingress URL
Failed to fetch timestamps
```

## Advanced Configuration

### Custom Map Height

Edit the card's JavaScript to change map height:

```javascript
// In leaflet-bom-radar-card.js, find:
const mapHeight = this.isInSectionsDashboard ? '450px' : '500px';

// Change to your preferred heights:
const mapHeight = this.isInSectionsDashboard ? '600px' : '700px';
```

### Multiple Instances

You can add multiple cards to different dashboards:
- Each card maintains its own state
- They share the same add-on backend
- Caching benefits all instances

### Home Location

The card uses your Home Assistant location settings:
```
Settings → System → General → Location
```
- The 🏠 marker shows this location
- Default zoom centers on this point

## Support

**Issues or Questions:**
- Check logs in: Settings → Add-ons → BoM Radar Proxy → Log
- Browser console: F12 → Console tab
- Add-on Web UI: Settings → Add-ons → BoM Radar Proxy → Open Web UI

**Reporting Bugs:**
Include:
1. Home Assistant version
2. Browser and version
3. Error messages from browser console
4. Add-on logs
5. Card configuration (YAML)

## Credits

- **Radar Data**: Australian Bureau of Meteorology (BoM)
- **Mapping**: Leaflet.js
- **Base Maps**: OpenStreetMap contributors, Google Maps

## License

MIT License - See LICENSE file for details

---

**Note**: This card requires the BoM Radar Proxy add-on to function. The add-on handles FTP connections to BoM servers and implements caching to minimize server load.

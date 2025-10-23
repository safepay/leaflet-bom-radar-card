# Leaflet BoM Radar Card

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)
[![hacs][hacs-shield]][hacs]

A custom Home Assistant card that displays Australian Bureau of Meteorology radar imagery on an interactive Leaflet map with automatic, viewport-based radar loading.

![Radar Card Demo](screenshots/main-view.png)

## Features

### 🗺️ Dynamic Multi-Radar Display
- Automatically detects and loads radars visible in viewport
- Seamlessly blends overlapping radar coverage
- No manual radar selection needed

### 🎯 Smart Location Awareness
- Starts centered on your Home Assistant home location
- Automatically switches radars as you pan and zoom
- Only shows relevant data for your current view

### ⚡ Intelligent Performance
- Caches images for fast loading
- Smooth fade transitions between radar updates
- Optimized for mobile devices

### 🌐 Full Remote Access
- Works with Nabu Casa, DuckDNS, or any remote access method
- Uses Home Assistant's secure ingress system
- Full functionality in mobile apps

## Prerequisites

**Required:** [BoM Radar Proxy Add-on](https://github.com/safepay/addon-bom-radar-proxy)

This card communicates with the BoM Radar Proxy add-on to fetch radar images. Install the add-on first:

1. Add repository: `https://github.com/safepay/addon-bom-radar-proxy`
2. Install "BoM Radar Proxy" from Add-on Store
3. Start the add-on

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click "+" and search for "Leaflet BoM Radar Card"
4. Click "Download"
5. Restart Home Assistant

### Manual Installation

1. Download `leaflet-bom-radar-card.js` and `leaflet-bom-radar-card-editor.js`
2. Copy both files to `/config/www/leaflet-bom-radar-card/`
3. Add resources in Settings → Dashboards → Resources:
   - URL: `/local/leaflet-bom-radar-card/leaflet-bom-radar-card.js`
     Type: JavaScript Module
   - URL: `/local/leaflet-bom-radar-card/leaflet-bom-radar-card-editor.js`
     Type: JavaScript Module
4. Restart Home Assistant

## Configuration

### Minimal (Recommended)
```yaml
type: custom:leaflet-bom-radar-card
```

### All Options
```yaml
type: custom:leaflet-bom-radar-card
cache_hours: 2                    # Hours of history to display (1-24)
playback_speed: 500               # Animation speed in milliseconds
default_zoom: 8                   # Initial map zoom level (5-15)
opacity: 0.7                      # Radar overlay opacity (0-1)
base_layer: osm                   # Base map: 'osm' or 'google'
show_legend: true                 # Show rainfall intensity legend
fade_duration: 300                # Fade transition time in ms
max_radar_distance_km: 800        # Max distance from center to load radars
```

## Usage

### Controls

- **▶ Play/Pause**: Animate through radar history
- **⏮/⏭ Previous/Next**: Step through individual frames
- **🔄 Refresh**: Fetch latest radar images
- **Timeline Slider**: Scrub to any point in history
- **+/− Zoom**: Zoom in/out
- **⌂ Home**: Return to home location

### Tips

- **Pan the map** to see different radar coverage areas
- **Zoom in/out** to adjust detail level
- **Play animation** to see storm movement
- **Use timeline** to review past weather

## How It Works

The card uses a dynamic loading system:
```
User pans map 
  → Calculate viewport bounds
  → Find radars in view
  → Fetch radar images
  → Blend overlays
  → Remove off-screen radars
```

### Intelligent Caching

- **Historical images** (>30 min old): Cached for 24 hours
- **Current images** (<30 min old): Refresh every 10 minutes
- **Based on image timestamp**: Uses filename timestamp, not file date
- **Automatic cleanup**: Old images removed automatically

## Supported Radars

All 60+ BoM radars across Australia are supported, including:

**Major Cities:**
- Melbourne (IDR023)
- Sydney (IDR713)  
- Brisbane (IDR663)
- Adelaide (IDR643)
- Perth (IDR703)
- Hobart (IDR763)
- Darwin (IDR633)
- Canberra (IDR403)

**Coverage:**
- Full populated areas
- Coastal monitoring
- Regional coverage

See [radars.json](radars.json) for complete list.

## Troubleshooting

### Add-on Issues

**"Failed to load radar locations"**
- Check add-on is running (Settings → Add-ons → BoM Radar Proxy)
- View add-on logs for errors
- Verify ingress is enabled

**"Cannot GET /"**
- Add-on needs to be rebuilt with latest server.js
- Or access via card (uses `/api/*` endpoints)

### Card Issues

**Blank map displays**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12) for errors
- Verify Leaflet.js loaded

**No radar images**
- Ensure add-on is running
- Check add-on can access BoM FTP
- Try refresh button (🔄)
- View add-on logs

**Radars not switching when panning**
- Check browser console for errors
- Verify radars are in viewport
- Try zooming in/out

### Performance

**Slow loading**
- Check internet connection
- Verify add-on cache settings
- Reduce `cache_hours` for fewer images

**High memory usage**
- Lower `max_radar_distance_km`
- Reduce `cache_hours`
- Clear browser cache

## Mobile Support

✅ Fully supported on:
- Home Assistant iOS app
- Home Assistant Android app
- Mobile web browsers
- Tablets

All features work identically on mobile and desktop.

## Screenshots

![Animation Demo](screenshots/animation.gif)
*Radar animation showing storm movement*

![Mobile View](screenshots/mobile.png)
*Mobile app view with full controls*

## Development

### Building Locally
```bash
# Clone repository
git clone https://github.com/safepay/leaflet-bom-radar-card.git
cd leaflet-bom-radar-card

# Test locally
python3 -m http.server 8000
# Access at http://localhost:8000
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- **Leaflet.js** - Interactive map library
- **OpenStreetMap** - Map tile provider
- **Bureau of Meteorology** - Radar data source
- **Home Assistant Community** - Testing and feedback

## Links

- 📦 [BoM Radar Proxy Add-on](https://github.com/safepay/addon-bom-radar-proxy)
- 📖 [Documentation](https://github.com/safepay/leaflet-bom-radar-card/wiki)
- 🐛 [Report Issues](https://github.com/safepay/leaflet-bom-radar-card/issues)
- 💬 [Discussions](https://github.com/safepay/leaflet-bom-radar-card/discussions)

---

**Made with ❤️ for the Home Assistant community**

[releases-shield]: https://img.shields.io/github/release/safepay/leaflet-bom-radar-card.svg
[releases]: https://github.com/safepay/leaflet-bom-radar-card/releases
[license-shield]: https://img.shields.io/github/license/safepay/leaflet-bom-radar-card.svg
[hacs-shield]: https://img.shields.io/badge/HACS-Default-41BDF5.svg
[hacs]: https://github.com/hacs/integration

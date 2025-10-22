# Leaflet BoM Radar Card

Dynamic multi-radar weather display for Home Assistant with automatic viewport-based loading.

## ⚠️ Important: Requires Add-on

This card **requires** the **BoM Radar Proxy** add-on to function.

**Install the add-on first:**
1. Go to Settings → Add-ons → Add-on Store
2. Click ⋮ → Repositories
3. Add: `https://github.com/safepay/addon-bom-radar-proxy`
4. Install "BoM Radar Proxy" add-on
5. Start the add-on

## Features

- 🗺️ **Automatic radar detection** - Loads radars based on map viewport
- 🎯 **Location aware** - Centers on your Home Assistant home location
- 🔄 **Seamless blending** - Multiple radars overlay smoothly
- ⏯️ **Animation controls** - Play through radar history
- 📱 **Mobile friendly** - Works on iOS and Android apps
- 🌐 **Remote access** - Full functionality via Nabu Casa or DuckDNS

## Quick Start

### Minimal Configuration
```yaml
type: custom:leaflet-bom-radar-card
```

That's it! The card will:
- Center on your home location
- Automatically load visible radars
- Update as you pan and zoom
- Refresh every 10 minutes

### Full Configuration
```yaml
type: custom:leaflet-bom-radar-card
cache_hours: 2                    # Hours of history (1-24)
playback_speed: 500               # Animation speed in ms
default_zoom: 8                   # Initial zoom (5-15)
opacity: 0.7                      # Radar opacity (0-1)
base_layer: osm                   # 'osm' or 'google'
show_legend: true                 # Show rainfall legend
fade_duration: 300                # Fade transition in ms
max_radar_distance_km: 800        # Max distance to load radars
```

## How It Works

As you pan and zoom the map:
1. Card detects which radars are visible
2. Automatically fetches radar imagery
3. Blends multiple radars seamlessly
4. Removes radars that leave viewport

No manual radar selection needed!

## Troubleshooting

### "Failed to load radar locations"
- Ensure BoM Radar Proxy add-on is installed and running
- Check add-on logs for errors

### Blank map
- Clear browser cache
- Check browser console (F12) for errors

### Radars not loading
- Verify add-on is running (green status)
- Check add-on Web UI works
- Try the refresh button (🔄)

## Support

- 📖 [Full Documentation](https://github.com/safepay/leaflet-bom-radar-card)
- 🐛 [Report Issues](https://github.com/safepay/leaflet-bom-radar-card/issues)
- 💬 [Discussions](https://github.com/safepay/leaflet-bom-radar-card/discussions)

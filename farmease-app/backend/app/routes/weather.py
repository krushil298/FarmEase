"""
Weather Proxy Endpoint
───────────────────────
GET  /api/weather?lat=...&lon=...
GET  /api/weather/forecast?lat=...&lon=...

Proxies Open-Meteo API so the mobile app doesn't require an API key.
"""

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def map_wmo_code(code: int) -> str:
    """Map WMO weather interpretation codes to string conditions."""
    if code == 0:
        return "Clear"
    elif code in [1, 2, 3]:
        return "Clouds"
    elif code in [45, 48]:
        return "Fog"
    elif code in [51, 53, 55, 56, 57]:
        return "Drizzle"
    elif code in [61, 63, 65, 66, 67, 80, 81, 82]:
        return "Rain"
    elif code in [71, 73, 75, 77, 85, 86]:
        return "Snow"
    elif code in [95, 96, 99]:
        return "Thunderstorm"
    return "Clear"

@router.get("/weather")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    units: str = Query("metric", description="Units: metric / imperial"),
):
    """Get current weather for a location (proxies Open-Meteo)."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            # Fetch weather from Open-Meteo
            resp = await client.get(
                OPEN_METEO_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
                    "hourly": "temperature_2m,weather_code",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min",
                    "wind_speed_unit": "kmh" if units == "metric" else "mph",
                    "timezone": "auto"
                },
            )
            resp.raise_for_status()
            data = resp.json()
            
            # Use Nominatim for reverse geocoding to get city name
            city_name = "Unknown Location"
            country = ""
            try:
                geo_resp = await client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"format": "json", "lat": lat, "lon": lon},
                    headers={"User-Agent": "FarmEase-App/1.0"}
                )
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    address = geo_data.get("address", {})
                    city_name = address.get("city") or address.get("town") or address.get("village") or address.get("county", "Unknown Location")
                    country = address.get("country_code", "").upper()
            except Exception:
                pass # Ignore geocoding errors if it fails
            
            # 1. Current Weather
            current = data.get("current", {})
            wmo_code = current.get("weather_code", 0)
            condition = map_wmo_code(wmo_code)
            
            # 2. Hourly Forecast (next 24 hours)
            hourly_data = data.get("hourly", {})
            h_times = hourly_data.get("time", [])
            h_temps = hourly_data.get("temperature_2m", [])
            h_codes = hourly_data.get("weather_code", [])
            
            # Open-Meteo hourly returns a massive array (often 168 hours). We need the next 24 starting near now.
            # We can find the closest hour to `current.time`, or just take the first 24 if 'auto' timezone aligns.
            # Open-Meteo typically returns past hours of today too, so we'll just return the next 24 items from current hour.
            current_time = current.get("time")
            start_idx = 0
            if current_time and current_time in h_times:
                start_idx = h_times.index(current_time)
                
            hourly_list = []
            for i in range(start_idx, min(start_idx + 24, len(h_times))):
                code = h_codes[i] if i < len(h_codes) else 0
                hourly_list.append({
                    "time": h_times[i],
                    "temp": h_temps[i] if i < len(h_temps) else 0,
                    "condition": map_wmo_code(code)
                })
                
            # 3. Daily Forecast (5 Days)
            daily_data = data.get("daily", {})
            d_times = daily_data.get("time", [])
            d_max = daily_data.get("temperature_2m_max", [])
            d_min = daily_data.get("temperature_2m_min", [])
            d_codes = daily_data.get("weather_code", [])
            
            daily_list = []
            for i in range(min(5, len(d_times))):
                code = d_codes[i] if i < len(d_codes) else 0
                daily_list.append({
                    "time": d_times[i],
                    "temp_max": d_max[i] if i < len(d_max) else 0,
                    "temp_min": d_min[i] if i < len(d_min) else 0,
                    "condition": map_wmo_code(code)
                })
            
            # Return unified payload
            return {
                "location": {
                    "city": city_name,
                    "country": country,
                    "lat": lat,
                    "lon": lon
                },
                "current": {
                    "temp": current.get("temperature_2m", 0),
                    "condition": condition,
                    "feels_like": current.get("apparent_temperature", 0),
                    "humidity": current.get("relative_humidity_2m", 0),
                    "wind_speed": current.get("wind_speed_10m", 0),
                    "wind_deg": current.get("wind_direction_10m", 0)
                },
                "hourly": hourly_list,
                "daily": daily_list
            }

        except httpx.HTTPStatusError as e:
            print(f"HTTPStatusError fetching weather: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="Weather API error")
        except httpx.RequestError as e:
            print(f"RequestError fetching weather: {e}")
            raise HTTPException(status_code=503, detail="Weather service unavailable")


@router.get("/weather/forecast")
async def get_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    units: str = Query("metric", description="Units: metric / imperial"),
):
    """Get daily forecast (proxies Open-Meteo)."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(
                OPEN_METEO_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                    "wind_speed_unit": "kmh" if units == "metric" else "mph",
                    "timezone": "auto"
                },
            )
            resp.raise_for_status()
            data = resp.json()
            
            try:
                geo_resp = await client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"format": "json", "lat": lat, "lon": lon},
                    headers={"User-Agent": "FarmEase-App/1.0"}
                )
                city_name = "Unknown Location"
                country = ""
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    address = geo_data.get("address", {})
                    city_name = address.get("city") or address.get("town") or address.get("village") or address.get("county", "Unknown Location")
                    country = address.get("country_code", "").upper()
            except Exception:
                city_name = "Unknown Location"
                country = ""

            daily = data.get("daily", {})
            times = daily.get("time", [])
            max_temps = daily.get("temperature_2m_max", [])
            min_temps = daily.get("temperature_2m_min", [])
            weather_codes = daily.get("weather_code", [])
            precip_probs = daily.get("precipitation_probability_max", [])
            
            forecast_list = []
            for i in range(len(times)):
                if i >= 5: # Only return 5 days
                    break
                    
                wmo_code = weather_codes[i] if i < len(weather_codes) else 0
                condition = map_wmo_code(wmo_code)
                avg_temp = (max_temps[i] + min_temps[i]) / 2 if (i < len(max_temps) and i < len(min_temps)) else 0
                
                forecast_list.append({
                    "dt_txt": f"{times[i]} 12:00:00",
                    "main": {
                        "temp": avg_temp,
                        "temp_max": max_temps[i] if i < len(max_temps) else 0,
                        "temp_min": min_temps[i] if i < len(min_temps) else 0,
                        "humidity": precip_probs[i] if i < len(precip_probs) else 0, # Map precip prob to humidity for now to avoid breaking contract
                    },
                    "weather": [{"main": condition, "description": condition.lower(), "icon": "01d"}],
                })
                
            return {
                "city": {"name": city_name, "country": country, "coord": {"lat": lat, "lon": lon}},
                "cnt": len(forecast_list),
                "list": forecast_list,
            }

        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Forecast API error")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Forecast service unavailable")

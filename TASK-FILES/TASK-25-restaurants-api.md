---
status: complete
---

# TASK-25 · Restaurants API

Backend endpoints for restaurant management: search local DB, import from Google Places, add manually.

## Goal

Maintain a local restaurant database. Users can search it, import nearby restaurants from Google Places (if API key configured), or add restaurants manually. Restaurants are linked to meatups via `RestaurantId` FK.

## Endpoints

### Search Restaurants
`GET /api/restaurants/search?q=&zip=&radiusMiles=25` — auth required

- Queries local DB by name or city (case-insensitive contains).
- If `zip` provided, geocodes it and filters/sorts by distance.
- Returns `{ source: "db", restaurants: RestaurantDto[] }`.

---

### Import Nearby (Google Places)
`POST /api/restaurants/import?zip=33602&radiusMiles=25` — auth required

- Returns 503 if `GooglePlaces:ApiKey` not configured.
- Geocodes zip, calls Google Places New API `/places:searchNearby` for restaurant types within radius.
- Skips records already in DB by `ExternalPlaceId`.
- Parses `formattedAddress` into Street1, City, State, Zip fields.
- Returns `{ imported: N }`.

---

### Add Restaurant Manually
`POST /api/restaurants` — auth required

Request:
```json
{
  "name": "Bern's Steak House",
  "street1": "1208 S Howard Ave",
  "city": "Tampa", "state": "FL", "zip": "33606", "country": "US",
  "phone": "(813) 251-2421",
  "website": "https://bernssteakhouse.com"
}
```
- Geocodes Zip via Nominatim if Latitude/Longitude not supplied.

---

### Get Restaurant
`GET /api/restaurants/{id}` — auth required

## DTOs

```csharp
record RestaurantDto(int Id, string Name, string? Phone, string? Website,
    string Street1, string? Street2, string City, string State, string Zip, string Country,
    double? Latitude, double? Longitude, string? ExternalPlaceId, double? DistanceMiles);

record CreateRestaurantRequest(string Name, string Street1, string City, string State, string Zip,
    string Country = "US", string? Phone = null, string? Website = null,
    string? ExternalPlaceId = null, double? Latitude = null, double? Longitude = null);
```

## Services

### GeocodingService (`backend/Services/GeocodingService.cs`)
- `ZipToCoordinatesAsync(zip, country)` — calls Nominatim OpenStreetMap free API
- `DistanceMiles(lat1, lng1, lat2, lng2)` — static Haversine formula

Nominatim HTTP client registered with `User-Agent` header (required by Nominatim ToS):
```csharp
builder.Services.AddHttpClient("nominatim", c =>
    c.DefaultRequestHeaders.Add("User-Agent", "SteakholdersMeatup/1.0 ..."));
```

### PlacesService (`backend/Services/PlacesService.cs`)
- `IsConfigured` — checks `GooglePlaces:ApiKey` in config
- `SearchNearbyAsync(lat, lng, radiusMeters)` — calls Google Places New API
  - Uses `X-Goog-Api-Key` and `X-Goog-FieldMask` headers
  - Returns `List<PlaceResult>?`; null on failure

## Configuration

`appsettings.Development.json`:
```json
{
  "GooglePlaces": { "ApiKey": "" }
}
```
Leave empty — endpoints gracefully return 503 when unconfigured.

## File

`backend/Endpoints/RestaurantEndpoints.cs`

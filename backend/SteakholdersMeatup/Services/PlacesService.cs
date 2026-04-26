using System.Text.Json;

namespace SteakholdersMeatup.Services;

public class PlacesService(IHttpClientFactory httpFactory, IConfiguration config)
{
    private string? ApiKey => config["GooglePlaces:ApiKey"];

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    /// <summary>
    /// Search nearby restaurants via Google Places API (New).
    /// Returns null when API key is not configured.
    /// </summary>
    public async Task<List<PlaceResult>?> SearchNearbyAsync(double lat, double lng, int radiusMeters = 40234)
    {
        if (!IsConfigured) return null;

        var client = httpFactory.CreateClient("googleplaces");
        client.DefaultRequestHeaders.Add("X-Goog-Api-Key", ApiKey);
        client.DefaultRequestHeaders.Add("X-Goog-FieldMask",
            "places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri");

        var body = JsonSerializer.Serialize(new
        {
            includedTypes = new[] { "restaurant", "steak_house", "meal_takeaway" },
            maxResultCount = 20,
            locationRestriction = new
            {
                circle = new
                {
                    center = new { latitude = lat, longitude = lng },
                    radius = (double)radiusMeters
                }
            }
        });

        try
        {
            var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://places.googleapis.com/v1/places:searchNearby", content);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("places", out var places)) return [];

            var results = new List<PlaceResult>();
            foreach (var place in places.EnumerateArray())
            {
                var name = place.TryGetProperty("displayName", out var dn)
                    ? dn.TryGetProperty("text", out var t) ? t.GetString() ?? "" : ""
                    : "";

                var address = place.TryGetProperty("formattedAddress", out var fa) ? fa.GetString() : null;
                var phone = place.TryGetProperty("internationalPhoneNumber", out var ph) ? ph.GetString() : null;
                var website = place.TryGetProperty("websiteUri", out var wu) ? wu.GetString() : null;
                var placeId = place.TryGetProperty("id", out var pid) ? pid.GetString() : null;

                double? pLat = null, pLng = null;
                if (place.TryGetProperty("location", out var loc))
                {
                    if (loc.TryGetProperty("latitude", out var pla)) pLat = pla.GetDouble();
                    if (loc.TryGetProperty("longitude", out var plo)) pLng = plo.GetDouble();
                }

                results.Add(new PlaceResult(placeId, name, address, phone, website, pLat, pLng));
            }

            return results;
        }
        catch
        {
            return null;
        }
    }
}

public record PlaceResult(
    string? PlaceId,
    string Name,
    string? FormattedAddress,
    string? Phone,
    string? Website,
    double? Latitude,
    double? Longitude
);

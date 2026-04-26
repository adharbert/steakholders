using System.Text.Json;

namespace SteakholdersMeatup.Services;

public class GeocodingService(IHttpClientFactory httpFactory)
{
    public async Task<(double Lat, double Lng)?> ZipToCoordinatesAsync(string zip, string country = "US")
    {
        var client = httpFactory.CreateClient("nominatim");
        var url = $"https://nominatim.openstreetmap.org/search?postalcode={Uri.EscapeDataString(zip)}&country={Uri.EscapeDataString(country)}&format=json&limit=1";

        try
        {
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (root.GetArrayLength() == 0) return null;

            var first = root[0];
            if (!first.TryGetProperty("lat", out var latEl) || !first.TryGetProperty("lon", out var lngEl))
                return null;

            if (!double.TryParse(latEl.GetString(), out var lat) || !double.TryParse(lngEl.GetString(), out var lng))
                return null;

            return (lat, lng);
        }
        catch
        {
            return null;
        }
    }

    // Haversine distance in miles
    public static double DistanceMiles(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 3958.8;
        var dLat = ToRad(lat2 - lat1);
        var dLng = ToRad(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;
}

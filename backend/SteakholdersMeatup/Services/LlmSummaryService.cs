using System.Net.Http.Json;
using System.Text.Json;

namespace SteakholdersMeatup.Services;

public class LlmSummaryService(IConfiguration config, IHttpClientFactory httpClientFactory)
{
    public async Task<string?> GenerateSummaryAsync(
        string restaurantName,
        IEnumerable<(string CutName, double Score, string? Notes)> reviews)
    {
        var apiKey = config["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return null;

        var reviewLines = reviews.Select((r, i) =>
        {
            var line = $"{i + 1}. Cut: {r.CutName}, Overall: {r.Score:F1}/5";
            if (!string.IsNullOrWhiteSpace(r.Notes))
                line += $" — \"{r.Notes}\"";
            return line;
        });

        var prompt = $"""
            You are writing a concise restaurant review summary for "{restaurantName}", a steakhouse visited by a private dining club called the Steakholders.

            Member reviews:
            {string.Join("\n", reviewLines)}

            Write 2–3 focused paragraphs summarising the group's collective experience: the quality and variety of cuts ordered, standout flavour and doneness notes, and the overall value. Use descriptive, appetising language. Write in third person; do not mention individual reviewer names. Do not fabricate details not present in the reviews.
            """;

        var requestBody = new
        {
            model = "claude-opus-4-7",
            max_tokens = 512,
            messages = new[] { new { role = "user", content = prompt } }
        };

        var client = httpClientFactory.CreateClient("anthropic");
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages")
        {
            Content = JsonContent.Create(requestBody)
        };
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("content")[0].GetProperty("text").GetString();
    }
}

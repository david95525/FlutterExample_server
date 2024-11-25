using Azure.AI.Vision.ImageAnalysis;
using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FlutterExample_server.Models;
using System.Net;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Globalization;

namespace FlutterExample_server.Controllers
{

    public class AzureAIVisionController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private string key;
        private string endpoint;
        public AzureAIVisionController(IConfiguration configuration, IWebHostEnvironment env)
        {
            _env = env;
            _configuration = configuration;
            endpoint = _configuration.GetSection("VISION_ENDPOINT").Value ?? string.Empty;
            key = _configuration.GetSection("VISION_KEY").Value ?? string.Empty;
        }
        public IActionResult Index(string redirect_uri)
        {
            if (string.IsNullOrEmpty(redirect_uri))
            {
                redirect_uri = "/";
            }
            Response.Cookies.Append("redirect_uri", redirect_uri);
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Back([FromBody] BloodPressureModel data)
        {
            string? uri = string.Empty;
            Request.Cookies.TryGetValue("redirect_uri", out uri);
            return Ok(new { redirect_uri = uri + $"?sys={data.sys}&dia={data.dia}&pul={data.pul}" });
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ImageAnalyze([FromBody] ImageModel model)
        {

            Task.Run(() =>
            {
                string file = Path.Combine(_env.WebRootPath, "scan", "2038", "1");
                if (!Directory.Exists(file))
                {
                    Directory.CreateDirectory(file);
                }
                string filename = $"test_{DateTime.Now.ToString("yyyyMMddhhmm")}.jpg";
                string filePath = Path.Combine(file, filename);
                MemoryStream ms = new MemoryStream(Convert.FromBase64String(model.imagestring));
                FileStream stream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
                byte[] b = ms.ToArray();
                stream.Write(b, 0, b.Length);
                stream.Close();
            });
            byte[] image = Convert.FromBase64String(model.imagestring);
            BinaryData imageData = BinaryData.FromBytes(image);
            ImageAnalysisClient client = new ImageAnalysisClient(new Uri(endpoint), new AzureKeyCredential(key));
            ImageAnalysisResult result = client.Analyze(imageData, VisualFeatures.Read | VisualFeatures.Caption, new ImageAnalysisOptions { GenderNeutralCaption = true });
            List<string> resultlist = new List<string>();
            int sys = 0, dia = 0, pul = 0;
            bool ContainMicrolife = false;
            if (result.Caption.Confidence > 0.6)
            {
                foreach (DetectedTextBlock block in result.Read.Blocks)
                {
                    IReadOnlyList<DetectedTextLine> lines = block.Lines;
                    (sys, dia, pul, ContainMicrolife, resultlist) = Process(lines, ContainMicrolife, resultlist);
                }
            }
            return Ok(new
            {
                resultlist = resultlist,
                confidence = result.Caption.Confidence.ToString(),
                ismicrolife = ContainMicrolife,
                sys = sys,
                dia = dia,
                pul = pul,
            });
        }

        private (int sys, int dia, int pul, bool ContainMicrolife, List<string> resultlist)
            Process(IReadOnlyList<DetectedTextLine> lines, bool ContainMicrolife, List<string> resultlist)
        {
            int number = 0, order = 0, sys = 0, dia = 0, pul = 0;
            for (int i = 0; i < lines.Count; i++)
            {
                string text = lines[i].Text.Replace(" ", "");
                resultlist.Add(text);
                if (text.Contains("microlife"))
                    ContainMicrolife = true;
                if (text == "SYS" && i > 1)
                {
                    if (int.TryParse(lines[i - 1].Text.Replace(" ", ""), out number))
                    {
                        if (dia == number) dia = 0;
                        if (pul == number) pul = 0;
                        sys = number;
                        order = 1;
                        continue;
                    }
                }
                if (text == "DIA" && i > 1)
                {
                    if (int.TryParse(lines[i - 1].Text.Replace(" ", ""), out number))
                    {
                        if (sys == number) sys = 0;
                        if (pul == number) pul = 0;
                        dia = number;
                        order = 2;
                        continue;
                    }
                }
                if (text == "PUL" && i > 1)
                {
                    if (int.TryParse(lines[i - 1].Text.Replace(" ", ""), out number))
                    {
                        if (sys == number) sys = 0;
                        if (dia == number) dia = 0;
                        pul = number;
                        continue;
                    }
                }
                if (int.TryParse(text, out number))
                {
                    if (number > 1 && number <= 250)
                    {
                        switch (order)
                        {
                            case 0:
                                sys = number; order++;
                                break;
                            case 1:
                                dia = number; order++;
                                break;
                            case 2:
                                pul = number; order++;
                                break;
                        }

                    }
                }
            }
            if (!ContainMicrolife)
            {
                sys = 0; dia = 0; pul = 0;
            }
            return (sys, dia, pul, ContainMicrolife, resultlist);
        }
        public class ImageModel
        {
            public string imagestring { get; set; } = string.Empty;
        }
    }
}

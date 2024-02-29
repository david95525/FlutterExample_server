namespace FlutterExample_server.Models
{
    public class MemberModel
    {
        public int code { get; set; }
        public string email { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public int age { get; set; }
        public string sex { get; set; } = string.Empty;
        public double height { get; set; }
        public double weight { get; set; }
    }
}

namespace FlutterExample_server.Models
{
    public class Result
    {
        /// <summary>
        /// 狀態碼
        /// 10000 正確執行無任何錯誤
        /// 2001  登入失敗
        /// 9999  異常錯誤
        /// </summary>
        public int code { get; set; }
        /// <summary>
        /// 訊息
        /// </summary>
        public string info { get; set; } = string.Empty;
        public UserModel? data { get; set; }
        public List<BloodPressureModel>? bpm_data { get; set; }
    }
    public class UserModel
    {
        public int id { get; set; }
        public string email { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
    }

}

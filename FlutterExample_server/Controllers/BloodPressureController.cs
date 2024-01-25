using FlutterExample_server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FlutterExample_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloodPressureController : ControllerBase
    {
        [HttpGet]
        [Route("[action]")]
        public Result Get()
        {
            Result result = new Result();
            result.code = 10000;
            result.info = "Success";
            result.bpm_data = GenerateDataList();
            return result;
        }
        private List<BloodPressureModel> GenerateDataList()
        {
            List<BloodPressureModel> result = new List<BloodPressureModel>()
            {
                new BloodPressureModel{
                    bpm_id = 1, note ="test01",sys = 118, dia = 68,pul = 62,afib = 0,pad = 0,mode = 0,source=0,
                    update_date =new DateTime(2023,1,1,0,0,0)
                },
                new BloodPressureModel{
                    bpm_id = 2, note ="test02",sys = 119, dia = 69,pul = 63,afib = 1,pad = 0,mode = 0,source=1,
                    update_date =new DateTime(2023,1,2,0,0,0)
                },
                new BloodPressureModel{
                    bpm_id = 3, note ="test02",sys = 120, dia = 70,pul = 64,afib = 0,pad = 1,mode = 1,source=2,
                    update_date =new DateTime(2023,1,2,0,0,0)
                }
            };
            return result;
        }
    }

}

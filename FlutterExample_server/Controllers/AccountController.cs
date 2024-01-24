using FlutterExample_server.Models;
using Microsoft.AspNetCore.Mvc;

namespace FlutterExample_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly string _email = "test@test.com";
        private readonly string _password = "test123";
        [HttpPost]
        [Route("[action]")]
        public Result Login(LoginModel data)
        {
            Result result = new Result();

            if (data.Password == _password && data.Email == _email)
            {
                UserModel userModel = new UserModel
                {
                    id = 1,
                    email = data.Email,
                    name = "Johnny"
                };
                result.code = 10000;
                result.info = "Success";
                result.data = userModel;
                return result;
            }
            result.code = 2001;
            result.info = "Fail";
            result.data = new UserModel();
            return result;
        }
    }
}

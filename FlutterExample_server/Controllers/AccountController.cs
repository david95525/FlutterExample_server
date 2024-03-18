using FlutterExample_server.Models;
using Microsoft.AspNetCore.Mvc;

namespace FlutterExample_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly string _email = "test@test.com";
        private readonly string _password = "test01";
        private readonly string _email02 = "test02@test.com";
        private readonly string _password02 = "test02";
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

        [HttpPost]
        [Route("[action]")]
        public MemberModel MemberLogin(LoginModel data)
        {
            MemberModel memberModel = new MemberModel
            {
                code = 2001
            };
            if (data.Password == _password && data.Email == _email)
            {
                memberModel = new MemberModel
                {
                    email = data.Email,
                    name = "Johnny",
                    sex = "Male",
                    age = 25,
                    height = 175,
                    weight = 70,
                    code = 10000
                };
                return memberModel;
            }
            if (data.Password == _password02 && data.Email == _email02)
            {
                memberModel = new MemberModel
                {
                    email = data.Email,
                    name = "Amy",
                    sex = "Female",
                    age = 22,
                    height = 165,
                    weight = 54,
                    code = 10000
                };
                return memberModel;
            }

            return memberModel;
        }
        [HttpGet]
        [Route("[action]")]
        public IActionResult GetCode(string redirect_uri)
        {
            string url = redirect_uri + "?code=test1234";
            return Redirect(url);
        }
        [HttpGet]
        [Route("[action]")]
        public IActionResult TestCookie(string redirect_uri)
        {
            HttpContext.Response.Cookies.Append("redirect_uri", redirect_uri);
            return RedirectToAction("LoadCookie", "Account");
        }
        public IActionResult LoadCookie()
        {
            string? url = HttpContext.Request.Cookies["redirect_uri"];
            return Redirect(url);
        }
    }
}

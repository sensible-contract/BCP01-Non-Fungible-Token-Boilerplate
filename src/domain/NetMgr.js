const { app } = require("../app");
const { ErrCode } = require("../const");
const { CodeError } = require("../util/CodeError");
class NetMgr {
  static checkParams(req, res, params, body) {
    let data = params;
    if (req.originalMethod == "POST") {
      data = body;
    }
    return true;
  }

  static listen(method, route, func) {
    app.http.listen(method, route, (req, res, params, body) => {
      console.log("request:", route, body);
      if (!this.checkParams(req, res, params, body)) return;
      const run = async () => {
        let code = ErrCode.EC_OK;
        let data = {};
        try {
          data = await func(req, res, params, body);
        } catch (e) {
          if (e instanceof CodeError) {
            code = e.code;
            console.error(e.message);
          } else {
            code = ErrCode.EC_INNER_ERROR;
            console.error(route, params, body, e);
          }
        } finally {
          res.json({
            code,
            data,
          });
        }
      };
      run();
    });
  }
}

module.exports = {
  NetMgr,
};

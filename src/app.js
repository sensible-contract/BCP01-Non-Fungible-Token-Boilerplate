const { Logger } = require("hns-logger-plugin");
const { Http } = require("hns-http-plugin");
const { Dao } = require("hns-dao-plugin");
const { Application } = require("hns-app");
require("./lib/fix_bsv_in_scrypt");
exports.app = new Application();
var app = exports.app;
(async () => {
  try {
    app.loadConfig("loggerConfig", require("./config/logger.json"));
    app.logger = new Logger(app, app.get("loggerConfig"));
    app.logger.replaceConsole();

    app.loadConfig("daoConfig", require("./config/dao.json"));
    app.dao = new Dao(app, app.get("daoConfig"));
    await app.dao.init();

    app.loadConfig("httpConfig", require("./config/http.json"));
    app.http = new Http(app, app.get("httpConfig"));
    app.http.setExceptionHandler((req, res, e) => {
      let errString;
      if (typeof e == "string") {
        errString = e;
        console.error(e);
      } else {
        errString = e.message;
        console.setStack(e.stack).error(e.message);
      }

      res.json({
        code: 500,
        message: errString,
      });
    });

    app.http.start();

    app.loadConfig("nftConfig", require("./config/nft.json"));
    const { NftMgr } = require("./domain/NftMgr");
    NftMgr.init(app.get("nftConfig"));

    var express = require("express");
    var ep = app.http.http;
    ep.use("/", express.static("./public"));
    ep.use((req, res, next) => {
      res.render("index.html");
    });

    var ejs = require("ejs");
    ep.set("views", __dirname + "/../public");
    ep.set("view engine", "ejs");
    ep.engine("html", ejs.__express);
    ep.set("view engine", "html");
    console.log("start completed");
  } catch (e) {
    console.error("start failed", e);
  }
})();

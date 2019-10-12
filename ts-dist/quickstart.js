"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_util_1 = require("./login_util");
var filePath = "./data/cookies/";
var loginUtil = new login_util_1.LoginUtil(filePath);
loginUtil.login();

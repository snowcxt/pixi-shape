/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/sammy/index.d.ts" />
import "../styles/theme.less";
import "../styles/main.less";
import {init} from "./showcase";
import "../../node_modules/jquery/dist/jquery.slim.min.js";
import "imports?define=>false!../../node_modules/sammy/lib/sammy.js";

const app = $.sammy(function() {
    this.get("/", function() {
        init();
    });
});

$(function() {
    app.run();
});

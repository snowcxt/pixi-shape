/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/sammy/index.d.ts" />
import "../styles/theme.less";
import "../styles/main.less";
import "../../node_modules/jquery/dist/jquery.slim.min.js";
import "imports?define=>false!../../node_modules/sammy/lib/sammy.js";
import route, {IRoute} from "./route";
import {init} from "./showcase";

route([
    {
        url: "/",
        view: "index",
        cb: init
    },
    {
        url: "/#try",
        view: "try"
    }
]);

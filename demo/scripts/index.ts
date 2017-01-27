/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/sammy/index.d.ts" />
import "../styles/theme.less";
import "../styles/main.less";
import "jquery/dist/jquery.slim.min.js";
import "imports?define=>false!sammy/lib/sammy.js";
import route, {IRoute} from "./route";
import {init} from "./showcase";
import {initTry} from "./try";

route([
    {
        url: "/",
        view: "index",
        cb: init
    },
    {
        url: "/#try",
        view: "try",
        cb: initTry
    }
]);

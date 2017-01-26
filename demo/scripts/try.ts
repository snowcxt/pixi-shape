/// <reference path="../../node_modules/@types/codemirror/index.d.ts" />
import "codemirror/lib/codemirror.css";
import * as CodeMirror from "codemirror/lib/codemirror";
import "codemirror/mode/javascript/javascript";

export function initTry() {
    CodeMirror(document.getElementById("code"), {
        value: "function myScript(){return 100;}\n",
        mode: "javascript"
    });
}

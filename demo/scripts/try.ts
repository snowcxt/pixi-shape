/// <reference path="../../node_modules/@types/codemirror/index.d.ts" />
import "codemirror/lib/codemirror.css";
import * as CodeMirror from "codemirror/lib/codemirror";
import "codemirror/mode/javascript/javascript";

export function initTry() {
    let isChanged = false;
    const tryIframe = $("#try");

    function loadIframe() {
        tryIframe.attr("src", "demo/views/example.html?" + Date.now());
    }
    const editor = CodeMirror(document.getElementById("code"), {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true
    });

    editor.on("change", function() {
        isChanged = true;
    });

    editor.on("blur", function() {
        if (isChanged) {
            isChanged = false;
            loadIframe();
        }
    });

    tryIframe.on("load", function() {
        tryIframe.contents().find("#js-try").html(editor.getValue());
    });

    $.get("demo/views/example.js", function(data) {
        editor.setValue(data);
        loadIframe();
    });
}

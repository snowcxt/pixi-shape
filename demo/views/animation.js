// append buttons
$('<p><input id="seek" type="range" style="width:100%" value="0" min="0" max="2000" step="1" /></p>' +
   '<p>' +
    '<button id="play">play animation</button>' +
    '<button id="reverse">reverse animation</button>' +
    '<button id="pause">pause animation</button>' +
   '</p>').appendTo($('body'));

// create a 600x300 stage
var stage = new Pixis.Stage(600, 300, document.getElementById("stage"));

// create a path
var path = new Pixis.Path({
    x: 50,
    y: 10,
    data: "m0,0c-0.89409,0 -1.68937,0.36728 -2.3606,1.03307c-0.67053,0.66483 -1.22538,1.61824 -1.68684,2.80876c-0.92279,2.38016 -1.49057,5.7238 -1.80112,9.7282c-0.31001,3.9969 -0.36216,8.65141 -0.23352,13.63333c-11.04321,4.53062 -33.44133,13.88429 -35.24052,15.97334c-2.39552,2.78093 -1.62151,5.96745 -0.65628,8.08263l36.82164,-7.4939c0.77837,9.7666 1.88514,19.43954 2.8494,27.0188c-3.60086,1.05394 -10.32269,3.13512 -11.71001,4.4254c-1.91144,1.77754 -1.91144,7.51866 -1.91144,7.51866l15.07045,-1.22581c0.35498,2.47459 0.57686,3.91798 0.57686,3.91798l0.02209,0.13051l0.11881,0l0.2775,0l0.11902,0l0.02184,-0.13051c0,0 0.22176,-1.44339 0.57692,-3.91798l15.07478,1.22581c0,0 0.00024,-5.74112 -1.91119,-7.51866c-1.388,-1.29114 -8.11476,-3.37677 -11.71461,-4.42964c0.96233,-7.55659 2.06712,-17.19264 2.84505,-26.92802l36.38991,7.40736c0.96535,-2.11517 1.74376,-5.3017 -0.65176,-8.08263c-1.7771,-2.06296 -23.63367,-11.20953 -34.81342,-15.8002c0.13374,-5.04626 0.08443,-9.76311 -0.22887,-13.80647l0,-0.00946c-0.31084,-4.00017 -0.87917,-7.34027 -1.80145,-9.71873c-0.46111,-1.19052 -1.01136,-2.14305 -1.68214,-2.80876c-0.67114,-0.66579 -1.46647,-1.03307 -2.36049,-1.03307l0,0z",
    stroke: 0xF03765,
    strokeWidth: 2,
    fill: 0x000000
});

// add the circle to the stage
stage.add(path);
stage.draw();

function progress(animation) {
    $("#seek").val(animation.elapse * 1000);
}

// create an animation
var tween = path.tween(2, {
    x: 530,
    y: 220,
    stroke: 0x476FB3,
    strokeWidth: 5,
    opacity: 0,
    scaleX: 1.5,
    scaleY: -1,
    rotation: -Math.PI / 2
}, Pixis.Easings.EaseInOut);

$("#play").click(function () {
    // play the animation
    tween.play({ progress: progress });
});

$("#reverse").click(function () {
    // reverse the animation
    tween.reverse({ progress: progress });
});

$("#pause").click(function () {
    // pause the animation
    tween.pause();
});

$("#seek").change(function () {
    tween.seek(parseInt($(this).val()) / 1000);
    stage.draw();
});

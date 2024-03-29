var jsList = [
    './js/util/function.js',
    './js/util/event-hub.js',
    './js/util/saveData.js',
    './js/3partUtil/sjcl.js',
    './js/3partUtil/jszip.min.js',
    './js/module/loading.js',
    './js/module/bookList.js',
    './js/module/bookDetail.js',
    './js/module/encrypt.js',
    './js/module/tool.js'
]

var developModel = false;

var cssList = [
    './css/main.css'
]

var version = developModel ? new Date().getTime() : '1.3';

function loadScript(url) {
    var script = document.createElement('script');
    script.src = `${url}?version=${version}`;
    var body = document.querySelector('body');
    body.append(script);
}
function loadCss(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet'
    link.href = `${url}?version=${version}`;
    var head = document.querySelector('head');
    head.append(link);
}

window.onload = function () {
    // cssList.forEach(css => {
    //     this.loadCss(css)
    // })

    jsList.forEach(js => {
        loadScript(js)
    })

}

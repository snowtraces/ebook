// ==UserScript==
// @name         novel
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const charset = 'gb2312'
    const linkSelector = '.novel_list li a'
    const dataReg = /<div class="novel_content">((`|[^`])*)align=center/

    const dataNormalize = function (text) {
        text = text.replace(/<br ?\/?>/ig, '\r\n')
        text = text.replace(/\n\s+/g, '\n')
        text = text.replace(/<[^>]+>/g, '')
        text = text.replace(/(\r)?\n/g, '\r\n')
        text = text.replace(/\&.{3,6};/g, '')
        text = text.replace('<div ', '')
        text = text.trim()

        return text
    }

    /**
     * get 请求
     * @param {*} url 
     * @param {*} data 
     */
    const get = function (url, data) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            if (data) {
                url = url + '?' + Object.keys(data).map(key => `${key}=${data[key]}`).join('&')
            }
            xhr.open('GET', url, true);
            xhr.overrideMimeType(`text/html;charset=${charset || 'utf-8'}`);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve(xhr.responseText);
                    } else {
                        reject ? reject() : console.error(`请求异常：${url}`)
                    }
                }
            }
            xhr.send(null);
        })
    }

    /**
     * 文本复制
     * @param {*} text 
     */
    const copy = function (text) {
        return new Promise((resolve, reject) => {
            var targetEL = document.createElement("textarea")
            targetEL.style.position = "fixed"
            targetEL.style.left = "-9999px"
            targetEL.style.top = "0"
            document.body.append(targetEL)
            targetEL.textContent = text

            targetEL.focus()
            targetEL.setSelectionRange(0, targetEL.value.length)
            document.execCommand('copy')
            targetEL.blur()
            targetEL.remove()

            resolve()
        })
    }

    let info = document.createElement('textarea');
    info.innerText = ""
    info.classList.add('info-text');

    let runBtn = document.createElement('button');
    runBtn.innerText = '读取链接'
    runBtn.id = 'get-link-btn'

    let filterInput = document.createElement('input');
    filterInput.id = 'filter-inputn'

    let style = document.createElement('style');
    style.innerText = `
.hide {
#display:none !important;
color: red !important;
}

.height-down {
height:50px !important;
}

.info-text {
position:fixed;
bottom:0;
right:0;
background: #000;
color: #fff;
z-index: 99999;
padding:10px;
padding-bottom: 50px;
margin: 16px;
opacity: .8;
border: 1px;
border-radius: 3px;
width:500px;
height:150px;
font-size: 11px !important;
line-height:1.5 !important;
overflow: auto;
white-space: nowrap;
}

#get-link-btn {
position:fixed;
bottom:3px;
right:0;
background: #000;
color: #fff;
z-index: 999999;
padding:10px;
margin: 16px;
opacity: .8;
border: 1px solid #fff;
border-radius: 3px;
cursor: pointer;
font-size: 14px !important;
line-height:18px !important;
}

#filter-inputn {
position:fixed;
bottom:3px;
right:150px;
background: #000;
color: #fff;
z-index: 999999;
padding:10px;
margin: 16px;
opacity: .8;
border: 1px solid #fff;
border-radius: 3px;
font-size: 14px !important;
line-height:18px !important;
height: auto;
}
`;
    document.body.append(info);
    document.body.append(runBtn);
    document.body.append(filterInput);
    document.body.append(style);

    runBtn.addEventListener('click', () => {
        let aNodeList = document.querySelectorAll(linkSelector)
        let total = 0
        let readCount = 0
        let txt = {}
        aNodeList.forEach((aItem, idx) => {
            let linkText = aItem.innerText
            let filter = filterInput.value
            if (new RegExp(filter, 'i').test(linkText)) {
                total++;
                let pageUrl = aItem.href
                get(pageUrl).then(rawHtml => {
                    readCount++
                    let dataText = dataReg.exec(rawHtml)[1]
                    dataText = dataNormalize(dataText)
                    txt[idx] = 'chapter:' + linkText + '\r\n' + dataText
                    if (readCount === total) {
                        info.value = Object.values(txt).join('\r\n')
                    }

                    runBtn.innerText = `已读取：${readCount} / ${total}`
                })
            }
        })
    }, false)

    filterInput.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            copy(info.value)
            return -1;
        }
    }, false)

    info.addEventListener('dblclick', () => {
        if (info.classList.contains('height-down')) {
            info.classList.remove('height-down')
        } else {
            info.classList.add('height-down')
        }

    }, false)

})();
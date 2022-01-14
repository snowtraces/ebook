{
    let view = {
        el: '#tool',
        template: `<div class="toolItem">
        <input type="text" name="title" placeholder="标题">
    </div>
    <div class="toolItem">
        <textarea name="content" cols="30" rows="10" placeholder="正文"></textarea>
    </div>
    <div class="toolItem">
        <input type="password" name="password" value="" placeholder="密码">
    </div>
    <div class="toolItem">
        <button type="button" id="generatePost">点击生成</button>
    </div>`,
        render(data) {
            $.el(this.el).innerHTML = $.evalTemplate(this.template, data)
        },
        hide() {
            $.el(this.el).classList.add('hide')
        },
        show() {
            $.el(this.el).classList.remove('hide')
        },
        toggle() {
            if ($.el(this.el).classList.contains('hide')) {
                this.show()
            } else {
                this.hide()
            }
        }
    }

    let model = {
        page: {
            size: 50,
        },
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents() {
            $.bindEvent('#showToolPageBtn', 'click', () => this.view.toggle())
            $.bindEvent('#generatePost', 'click', () => {
                let title = $.el(this.view.el + ' [name=title]').value
                let content = $.el(this.view.el + ' [name=content]').value
                let password = $.el(this.view.el + ' [name=password]').value

                if (!title || !content || !password) {
                    $.errorMsg('请填写全部字段')
                    return
                }
                content = `title:${title}\n${content}`

                $.get('./data/index.json?version=' + version).then((data) => {
                    let zip = new JSZip()
                    // 1. 生成index
                    let indexStr
                    if (data) {
                        // 旧索引
                        data = sjcl.decrypt(password, JSON.stringify(data))
                        // 新索引
                        data = JSON.parse(data)
                        let index = parseInt(Object.keys(data).pop() || 0) + 1
                        indexStr = String(index).padStart(6, '0')
                    } else {
                        data = {}
                        indexStr = String(1).padStart(6, '0')
                    }

                    data[indexStr] = {}
                    data[indexStr].title = title

                    // 数据分片
                    let rows = content.split('\n').filter(row => row && !(/^\s+$/g.test(row))).map(row => row.trim())
                    let rowLength = rows.length
                    let size = this.model.page.size
                    let number = Math.ceil(rowLength / size)
                    data[indexStr].page = number

                    $.log(data)

                    let encryptedIndex = sjcl.encrypt(password, JSON.stringify(data))
                    zip.file('index.json', encryptedIndex);

                    // 2. 生成数据
                    let folder = zip.folder(indexStr)
                    for (let i = 0; i < number; i++) {
                        let start = i * size
                        let end = Math.min(start + size, rowLength)

                        let sliceContent = rows.slice(start, end).join('\n')
                        folder.file(String(i + 1).padStart(4, 0) + '.json', sjcl.encrypt(password, sliceContent));
                    }

                    zip.generateAsync({ type: "blob" })
                        .then(function (content) {
                            saveData.setDataConver({
                                name: `post_${new Date().getTime()}.zip`,
                                data: content
                            })
                        });
                })
            })
        },
        bindEventHub() {

        }
    }

    controller.init(view, model)
}

{
    let view = {
        el: '#bookList',
        template: `\${Object.keys(data).map(key => \`<li data-id=\${key} data-page=\${data[key].page}>\${data[key].title}</li>\`).join('')}`,
        render(data) {
            $.el(this.el).innerHTML = $.evalTemplate(this.template, data)
        },
        hide() {
            $.el('#bookList-wrapper').classList.remove('show')
            $.el('#bookList-wrapper').classList.add('hide')
        },
        show() {
            $.el('#bookList-wrapper').classList.remove('hide')
            $.el('#bookList-wrapper').classList.add('show')
        },
    }

    let model = {
        password: null,
        data: null,
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model

            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents() {
            $.bindEvent(this.view.el + ' > li', 'click', (e) => {
                this.view.hide()
                window.eventHub.emit('loadBook', e.target.dataset)
            })
        },
        bindEventHub() {
            window.eventHub.on('loadIndex', () => {
                this.view.show()
            })
            window.eventHub.on('passwordChecked', (password) => {
                this.model.password = password
                this.render()
            })
        },
        render() {
            $.get('./data/index.json').then((data) => {
                data = sjcl.decrypt(this.model.password, JSON.stringify(data))
                this.view.render(JSON.parse(data))
            })
        }
    }

    controller.init(view, model)
}

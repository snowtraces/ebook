{
    let view = {
        el: '#bookDetail',
        template: `\${data.map(row => {
            if (row.startsWith('title:')) {
                return \`<h2>\${row.substring(6)}</h2>\`
            } else if (row.startsWith('author:')) {
                return \`<p class='author'>\${row.substring(7)}</p>\`
            } else {
                return \`<p>\${row}</p>\`
            }
        }).join('')}`,
        render(data) {
            $.el(this.el).innerHTML = $.evalTemplate(this.template, data)
            window.scrollTo(0, 0)
        },
        hide() {
            $.el('#bookDetail-wrapper').classList.remove('show')
            $.el('#bookDetail-wrapper').classList.add('hide')
        },
        show() {
            $.el('#bookDetail-wrapper').classList.remove('hide')
            $.el('#bookDetail-wrapper').classList.add('show')
        },
    }

    let model = {
        password: null,
        bookIdx: null,
        data: {
            rows: [],
            total: 0,
        },
        page: {
            size: 50,
            total: 0,
            curr: 0
        },
        initWithText(text) {
            let rows = text.split('\n').filter(row => row && !(/^\s+$/g.test(row)))
            this.data.rows = rows
            this.data.total = rows.length
            this.page.total = Math.ceil(rows.length / this.page.size)
        },
        getPageData(pageNo) {
            this.saveBookHistory(pageNo)
            this.page.curr = pageNo
            let rows = this.data.rows.slice((pageNo - 1) * this.page.size, pageNo * this.page.size)
            if (pageNo === this.page.total) {
                rows.push('-- END --')
            }
            return rows
        },
        getNextPageData() {
            let pageNo = Math.min(this.page.curr + 1, this.page.total)
            return this.getPageData(pageNo)
        },
        getPrevPageData() {
            let pageNo = Math.max(this.page.curr - 1, 1)
            return this.getPageData(pageNo)
        },
        getLastPageData() {
            let bookHistory = localStorage.getItem('BOOK_HISTORY')
            let pageNo = !bookHistory ? 1 : (JSON.parse(bookHistory)[this.bookIdx] || 1)
            return this.getPageData(pageNo)
        },
        saveBookHistory(pageNo) {
            let bookHistory = localStorage.getItem('BOOK_HISTORY')
            bookHistory = !bookHistory ? {} : JSON.parse(bookHistory)
            bookHistory[this.bookIdx] = pageNo
            localStorage.setItem('BOOK_HISTORY', JSON.stringify(bookHistory))
        },
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            // this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents() {
            $.bindEvent('#backBtn', 'click', () => {
                this.view.hide()
                window.eventHub.emit('loadIndex')
            })
            $.bindEvent('#pagePrev', 'click', () => {
                this.view.render(this.model.getPrevPageData())
            })
            $.bindEvent('#pageNext', 'click', () => {
                this.view.render(this.model.getNextPageData())
            })
        },
        bindEventHub() {
            window.eventHub.on('loadBook', (bookIdx) => {
                this.view.show()
                this.model.bookIdx = bookIdx
                $.get(`/data/book/${bookIdx}`, { time: new Date().getTime() }).then((book) => {
                    this.model.initWithText(sjcl.decrypt(this.model.password, JSON.stringify(book)))
                    this.view.render(this.model.getLastPageData())
                })
            })
            window.eventHub.on('passwordChecked', (password) => {
                this.model.password = password
            })
        },

    }

    controller.init(view, model)
}

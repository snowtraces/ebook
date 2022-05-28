{
    let view = {
        el: '#bookDetail',
        template: `\${data.map(row => {
            if (row.startsWith('title:')) {
                return \`<h2>\${row.substring(6)}</h2>\`
            } else if (row.startsWith('chapter:')) {
                return \`<h3>\${row.substring(8)}</h3>\`
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
        updatePageNo(pageNo) {
            $.el('#pageTo').value = pageNo
        }
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
        getPageData(pageNo) {
            pageNo = pageNo >= this.page.total ? this.page.total : pageNo
            this.saveBookHistory(pageNo)
            this.page.curr = pageNo

            window.eventHub.emit('loadingOn')

            // 根据页码查询指定的数据
            return $.get(`./data/book/${this.bookIdx}/${String(pageNo).padStart(4, 0)}.json`).then((bookPage) => {
                bookPage = sjcl.decrypt(this.password, JSON.stringify(bookPage))

                let rows = bookPage.split('\n').filter(row => row && !(/^\s+$/g.test(row)))
                if (pageNo === this.page.total) {
                    rows.push('-- END --')
                }

                window.eventHub.emit('loadingOff')
                return rows
            })
        },
        getNextPageData() {
            if (this.page.curr === this.page.total) $.successMsg('加载第一页')
            let pageNo = this.page.curr === this.page.total ? 1 : this.page.curr + 1
            return this.getPageData(pageNo).then((data) => {
                return data
            })
        },
        getPrevPageData() {
            if (this.page.curr === 1) $.successMsg('加载最后一页')
            let pageNo = this.page.curr === 1 ? this.page.total : this.page.curr - 1
            return this.getPageData(pageNo).then((data) => {
                return data
            })
        },
        getLastPageData() {
            let bookHistory = localStorage.getItem('BOOK_HISTORY')
            let pageNo = !bookHistory ? 1 : (JSON.parse(bookHistory)[this.bookIdx] || 1)
            return this.getPageData(pageNo).then((data) => {
                return data
            })
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
                this.model.getPrevPageData().then(rows => {
                    this.view.render(rows)
                    this.view.updatePageNo(this.model.page.curr)
                })
            })
            $.bindEvent('#pageNext', 'click', () => {
                this.model.getNextPageData().then(rows => {
                    this.view.render(rows)
                    this.view.updatePageNo(this.model.page.curr)
                })
            })
            $.bindEvent('#pageTo', 'keyup', (e) => {
                if (e.keyCode === 13) {
                    this.model.getPageData($.el('#pageTo').value * 1).then(rows => {
                        this.view.render(rows)
                        this.view.updatePageNo(this.model.page.curr)
                    })
                }
            })
            $.bindEvent('body', 'keyup', e => {
                let isUnDetail = $.el('#bookDetail-wrapper').classList.contains('hide')
                if (isUnDetail) return

                let key = e.key
                if (key === 'ArrowRight') {
                    this.model.getNextPageData().then(rows => {
                        this.view.render(rows)
                        this.view.updatePageNo(this.model.page.curr)
                    })
                } else if (key === 'ArrowLeft') {
                    this.model.getPrevPageData().then(rows => {
                        this.view.render(rows)
                        this.view.updatePageNo(this.model.page.curr)
                    })
                }
            })

        },
        bindEventHub() {
            window.eventHub.on('loadBook', (bookInfo) => {
                this.view.show()
                this.model.bookIdx = bookInfo.id
                this.model.page.total = parseInt(bookInfo.page)

                this.model.getLastPageData().then((rows) => {
                    this.view.render(rows)
                    this.view.updatePageNo(this.model.page.curr)
                })

            })
            window.eventHub.on('passwordChecked', (password) => {
                this.model.password = password
            })
        },

    }

    controller.init(view, model)
}

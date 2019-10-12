{
    let view = {
        el: '#encrypt',
        template: ``,
        render(data) {
            $.el(this.el).innerHTML = $.evalTemplate(this.template, data)
        },
        hide() {
            $.el(this.el).classList.remove('show')
            $.el(this.el).classList.add('hide')
        },
    }

    let model = {
        baseCode: {
            "iv": "qiTCrqDG56LrgY9r7mftcA==",
            "v": 1,
            "iter": 1000,
            "ks": 128,
            "ts": 64,
            "mode": "ccm",
            "adata": "",
            "cipher": "aes",
            "salt": "7KFnggMdNH4=",
            "ct": "oJfa88cjYt2HyVLkElsCyQ=="
        }
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
            $.bindEvent(`${this.view.el} [name=password]`, 'keyup', (e) => {
                if (e.keyCode === 13) {
                    this.checkPassword($.el(this.view.el + ' [name=password]').value)
                }
            })
        },
        bindEventHub() {

        },
        checkPassword(password) {
            let checked = false
            try {
                let result = sjcl.decrypt(password, JSON.stringify(this.model.baseCode))
                if (result === 'password') {
                    checked = true
                }
            } catch (e) {
                $.errorMsg('密码错误')
                return
            }
            
            if (checked) {
                this.view.hide()
                window.eventHub.emit('passwordChecked', password)
            }
        }
    }

    controller.init(view, model)
}

import React, { Component } from 'react'

class Fuffle {
    static connect(options) {
        if (!this.instance) this.instance = new this(options)
        return new Proxy({}, {
            get: (_, key) => new Fuffle.Operation(this.instance, key)
        })
    }
    constructor(options) {
        this.options = options
    }
    resolve(operation) {

        const method = {
            get: 'GET', set: 'PUT', call: 'POST'
        }[operation.type]

        console.log(operation.parts)

        const url = `/${operation.parts.join('/')}`

        return this.request(method, url, operation.data)

    }
    request(method, url, data) {
        return new Promise((resolve, reject) => {

            const req = new XMLHttpRequest()

            req.responseType = 'json'

            req.addEventListener('load', () => {
                resolve(req.response.data)
            })

            req.open(method, this.options.url + url)

            if (data) {
                req.setRequestHeader('Content-Type', 'application/json')
                req.send(JSON.stringify({ data }))
            } else {
                req.send()
            }
            
        })
    }
}

export class CachedFuffle extends Fuffle {
    constructor(options) {
        super(options)
        this.cache = {}
    }
    resolve(operation) {

        let selected = this.cache
        let found = true

        for (const part of operation.parts) {
            if (!selected.children) {
                found = false
                break
            }
            selected = selected.children[part]
            if (!selected) {
                found = false
                break
            }
        }

        if (found) return selected.value

        super.resolve(operation)
            .then(value => {
                
                selected = this.cache

                for (const part of operation.parts) {
                    if (!selected.children) selected.children = {}
                    selected = selected.children[part] = {}
                }

                selected.value = value

            })
        
        return

    }
}

Fuffle.Operation = class Operation {
    constructor(fuffle, part) {
        this.fuffle = fuffle
        this.parts = [ part ]
        const proxy = new Proxy(() => {}, {
            get: (_, key) => {
                const push = () => {
                    this.parts.push(key)
                    return proxy
                }

                if (key === 'get') return _key => push(key)

                if (key === 'then') {
                    this.type = 'get'
                    return next => next(this.fuffle.resolve(this))
                }

                return push()
            },
            set: (_, key, val) => {

                this.parts.push(key)
                this.data = val
                this.type = 'set'

                this.fuffle.resolve(this)

                return true
            },
            apply: (_, targ, args) => {

                this.data = args
                this.type = 'call'

                return this.fuffle.resolve(this)
            }
        })
        return proxy
    }
}

export default Fuffle

const fuffleConnect = mapDbToProps => ComponentType => {
  return class FuffleConnect extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
        loading: true,
        error: null,
        data: null
      }
      this.fetch()
    }
    refetch = () => {
      this.setState({ loading: true, error: null })
      this.fetch()
    }
    fetch = () => {
      const entries = Object.entries(mapDbToProps(this.props.fuffle))
      const vals = entries.map(([ , val ]) => val.then(_=>_))
      Promise.all(vals)
        .then(values => {
          return values.reduce((data, val, i) => ({
            ...data, [entries[i][0]]: val
          }), {})
        })
        .then(data => this.setState({ data, loading: false }))
    }
    render() {
      return <ComponentType {...this.state} refetch={this.refetch} props={this.props} />
    }
  }
}

export { fuffleConnect }
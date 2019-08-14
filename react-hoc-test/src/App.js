import React, { Component } from 'react'
import Fuffle from './fuffle-client.js'

const fuffle = Fuffle.connect({ url: 'http://localhost:8080' })

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
      const entries = Object.entries(mapDbToProps(fuffle))
      Promise.all(entries.map(([ , val ]) => val))
        .then(values => {
          return values.reduce((data, val, i) => ({
            ...data, [entries[i][0]]: val
          }), {})
        })
        .then(data => this.setState({ data, loading: false }))
    }
    render() {
      return <ComponentType {...this.state} refetch={this.refetch} props={this.props} fuffle={fuffle} />
    }
  }
}

const displayUser = user => <div>
  <textarea cols={40} rows={8}>{JSON.stringify(user, undefined, 2)}</textarea>
</div>

class App extends Component {
  test = () => {
    fuffle.users.slice({})
      .then(result => {
        console.log('deleted', result)
      })
  }
  render() {

    const { loading, error, data } = this.props

    if (loading) return <p>loading...</p>
    if (error) return <p>{error.message || error}</p>

    const { user, users, deleted } = data

    console.log('deleted', deleted)

    return <div>
      <input type='button' value='whackBush' onClick={this.test} />
      {/* {deleted} */}
      {users.map(displayUser)}
    </div>
  }
}

const mapDbToProps = db => ({
  user: db.users['5d53eda155fc2250df039fce'],
  users: db.users.filter(),
  delete: db.users.pop('5d53ecfa55fc2250df039fc6')
})

App = fuffleConnect(mapDbToProps)(App)

export default App
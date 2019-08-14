import React, { Component } from 'react'
import { fuffleConnect } from './fuffle-client.js'

const displayUser = user => <div key={user._id}>
  <textarea cols={40} rows={8} defaultValue={JSON.stringify(user, undefined, 2)} />
</div>

class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = { users: [], user: props.props.fuffle.users['5d54841506f91211e337b630'] }
  }
  test = () => {
    const { user } = this.state
    user.whackBush()
  }
  render() {

    const { loading, error, data } = this.props
    const { users } = this.state

    if (loading) return <p>loading...</p>
    if (error) return <p>{error.message || error}</p>

    const { user } = data

    return <div>
      { displayUser(user) }
      <input type='button' value='push' onClick={this.test} />
      { users.map(displayUser) }
    </div>
  }
}

const mapDbToProps = db => ({
  user: db.users['5d54841506f91211e337b630']
})

App = fuffleConnect(mapDbToProps)(App)

export default App
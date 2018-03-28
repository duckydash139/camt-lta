// import axios from 'axios'
import decode from 'jwt-decode'

export const state = () => ({token: null, id: null, username: null, isAdmin: null})

export const mutations = {
  authUser (state, payload) {
    state.token = payload.token
  },
  storeUser (state, payload) {
    state.username = payload.username
    state.id = payload.id
    state.isAdmin = payload.isAdmin
  },
  clearData (state) {
    state.token = null
    state.id = null
    state.username = null
  }
}

export const actions = {
  async signin ({ commit, dispatch }, token) {
    // decode token
    const decoded = decode(token)
    // check expired time
    if (decoded.username) {
      const { id, username, isAdmin } = decoded
      // save token
      commit('authUser', {token})
      commit('storeUser', {id, username, isAdmin})
      // set localstorage
      localStorage.setItem('token-admin', token)
    }
  },
  tryToSignin ({ commit, dispatch }) {
    const token = localStorage.getItem('token-admin')
    const now = Math.floor(Date.now() / 1000)
    if (token) {
      const decoded = decode(token)

      if (decoded.exp > now) {
        dispatch('signin', token)
      } else {
        commit('clearData')
        localStorage.removeItem('token-admin')
        this.app.router.push('login')
      }
    }
    // console.log('failed: tryToSignin')
  },
  signout ({ commit, dispatch }) {
    commit('clearData')
    localStorage.removeItem('token-admin')
    // console.log('finished: signout')
  }
}

export const getters = {
  user ({ username }) {
    return username
  }
}

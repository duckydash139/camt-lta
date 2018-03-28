import axios from 'axios'
import decode from 'jwt-decode'
import qs from 'querystring'

export const state = () => ({
  token: null,
  user: null
})

export const mutations = {
  authUser (state, payload) {
    state.token = payload.token
  },
  storeUser (state, payload) {
    state.user = payload
  },
  setCourseId (state, payload) {
    state.user.tracking = payload
  },
  clearData (state) {
    state.token = null
    state.studentId = null
    state.user = null
  }
}

export const actions = {
  async signin ({commit, dispatch}, token) {
    // decode token to get student id
    const decoded = decode(token)
    if (decoded.student_id) {
      const studentId = decoded.student_id
      // save token & student id to vuex
      commit('authUser', {token})
      // request student profile
      const profile = await axios.get(`/api/users/${studentId}`, {headers: { token }})
      // save student profile to state.user
      commit('storeUser', profile.data)
      // set localstorage
      localStorage.setItem('token', token)
      // is student enroll the course yet
      if (!profile.data.tracking || profile.data.tracking === 0) {
        this.app.router.push('/courses')
      }
    }
  },
  tryToSignin ({state, commit, dispatch}) {
    const token = localStorage.getItem('token')
    const now = Math.floor(Date.now() / 1000)
    if (token) {
      const decoded = decode(token)

      if (decoded.exp > now) {
        dispatch('signin', token)
        setInterval(() => {
          if (now > decoded.exp) {
            commit('clearData')
            localStorage.removeItem('token')
            this.app.router.push('/')
            location.reload()
          }
        }, 2000)
      } else {
        commit('clearData')
        localStorage.removeItem('token')
        this.app.router.push('/')
        location.reload()
      }
    }
    // console.log('failed: tryToSignin')
  },
  signout ({commit, dispatch}) {
    commit('clearData')
    localStorage.removeItem('token')
    this.app.router.push('/')
    location.reload()
    // console.log('finished: signout')
  },
  async setCourse ({state, commit, dispatch}, payload) {
    const token = state.token
    let { data } = await axios.put(`/api/users/${state.user.studentId}/course/`, qs.stringify({
      course: payload
    }), {headers: { token }})
    const { success } = data

    if (success === true) {
      commit('setCourseId', payload)
      this.app.router.push('/')
      location.reload()
    }
  }
}

export const getters = {
  user ({user}) {
    return user
  },
  token ({token}) {
    return token
  }
}

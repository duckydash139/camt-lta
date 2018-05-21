import axios from 'axios'

export const state = () => ({
  eventId: null,
  reflections: null,
  scores: null,
  image: null
})

export const mutations = {
  setScores (state, payload) {
    state.scores = payload
  },
  setEventId (state, payload) {
    state.eventId = payload
  },
  setReflections (state, payload) {
    state.reflections = payload
  },
  saveImage (state, payload) {
    state.image = payload
  },
  clearData (state) {
    state.eventId = null
    state.scores = null
    state.image = null
    state.reflections = null
  }
}

export const actions = {
  async saveData ({state, rootState, commit, dispatch}, payload) {
    let data = new FormData()
    // save image in vuex
    commit('saveImage', payload)
    // build form data
    data.append('course_id', rootState.user.user.tracking)
    data.append('activity_id', state.eventId)
    data.append('student_id', rootState.user.user.studentId)
    data.append('photo', state.image)
    // loop reflections to fill in form
    for (let i = 0; i < state.reflections.length; i++) {
      const item = state.reflections[i]
      data.append(`reflections[${i}]`, item)
    }
    // loop scores to fill in form
    for (let j = 0; j < state.scores.length; j++) {
      const item = state.scores[j]
      data.append(`scores[${j}][id]`, item.id)
      data.append(`scores[${j}][point]`, item.point || 0)
    }
    // submit data to api
    const result = await axios.post(`/api/event/${state.eventId}/add`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: rootState.user.token
      }
    })

    const { success, id } = result.data
    if (success === true && id) {
      this.app.router.push(`/history/requests/${id}`)
      // clear data
      dispatch('clearForm')
    } else {
      this.app.router.push('/')
    }
  },
  clearForm ({commit, dispatch}) {
    commit('clearData')
  }
}

export const getters = {
  scores ({scores}) {
    return scores
  },
  reflections ({reflections}) {
    return reflections
  }
}

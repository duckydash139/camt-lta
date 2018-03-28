import axios from 'axios'

export const state = () => ({
  eventId: null,
  description: null,
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
  setDescription (state, payload) {
    state.description = payload
  },
  saveImage (state, payload) {
    state.image = payload
  },
  clearData (state) {
    state.eventId = null
    state.scores = null
    state.image = null
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
    data.append('description', state.description)
    data.append('photo', state.image)
    // loop scores to fill in form
    for (let i = 0; i < state.scores.length; i++) {
      const item = state.scores[i]
      data.append(`scores[${i}][id]`, item.id)
      data.append(`scores[${i}][point]`, item.point || 0)
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
      this.app.router.push(`/history/${id}`)
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
  description ({description}) {
    return description
  }
}

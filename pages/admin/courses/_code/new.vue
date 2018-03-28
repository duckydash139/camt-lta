<template>
<div id="">
  <div class="columns content">
    <div class="column is-9">
      <h3 class="has-text-weight-bold">CREATE NEW BATCH</h3>
    </div>
  </div>
  <div class="columns content">
    <CriteriaEditor :data.sync="criteria"></CriteriaEditor>
  </div>
  <br>
  <div class="columns content">
    <div class="column card extend-card">
      <div class="card-content">
        <div class="columns">
          <div class="column has-text-centered">
            <form @submit.prevent="newBatch">
              <span class=" is-size-3">Total student</span><br><br>
              <input v-model="participants" type="number" class="input" placeholder="ex. 200" min="0" required><br>
              <span class="is-pulled-left has-text-danger is-size-6">* Will use to calculate <i>Unity</i> score</span><br>
              <input class="is-pulled-right button is-info" type="submit">
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br><br>
</div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'

import CriteriaEditor from '~/components/CriteriaEditor'

export default {
  layout: 'admin',
  components: {
    CriteriaEditor
  },
  data () {
    return {
      participants: 0,
      criteria: [{"id":0,"title":"Companionship","max":25,"color":"#94e3e5","formula":"5 of each"},{"id":1,"title":"Enthusiastic followers","max":25,"color":"#e1b0b0","formula":"depends on admin"},{"id":2,"title":"Team Working Skills","max":25,"color":"#d6afff","formula":"depends on admin"},{"id":3,"title":"Unity","max":25,"color":"#fdebb4","formula":"(participants/total)*max"},{"id":4,"title":"CAMT Championship","max":100,"color":"#ffcce8","formula":"depends on admin"},{"id":5,"title":"CMU Activities","max":30,"color":"#ffcce8","formula":"5 of each"},{"id":6,"title":"English Activities","max":40,"color":"#ffcce8","formula":"10 of each"},{"id":7,"title":"Etc.","color":"#ffcce8","formula":"multiply by 2"}]
    }
  },
  methods: {
    async newBatch () {
      const loading = this.$loading.open()
      const id = this.$route.params.code
      const token = this.$store.state.admin.token

      const { data } = await axios.post(`/api/admin/course/${id}/create`, {
        unity_setting: this.participants,
        structure: this.compiled
      }, {headers: { token }})

      loading.close()

      if (data.success) {
        this.$router.push(`/admin/courses/${id}`)
      }
    }
  },
  computed: {
    compiled () {
      let buffer = []
      let criteria = this.criteria
      let counter = 0
      criteria.map(item => {
        let formula = null
        let point = item.point || 0
        if (item.formula === 'unity') {
          formula = '(participants/total)*max'
        } else if (item.formula === 'of each') {
          formula = `${point} of each`
        } else if (item.formula === 'multiply by') {
          formula = `multiply by ${point}`
        } else if (item.formula === 'normal') {
          formula = null
        } else {
          formula = item.formula
        }

        buffer.push({
          id: counter,
          title: item.title,
          max: item.max,
          formula,
          color: item.color
        })

        counter++
      })

      return buffer
    }
  }
}
</script>
<style scoped>
.content {
  margin: 0 1vw 0 1vw;
}

.extend-card {
  border-radius: 2px;
}

.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

<template>
<div id="">
  <div class="columns content">
    <div class="column is-9">
      <h3 class="has-text-weight-bold">BATCH SETTING</h3>
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
            <form @submit.prevent="clicked">
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
      criteria: [],
      participants: 0
    }
  },
  methods: {
    async initData () {
      const id = this.$route.params.code
      const token = this.$store.state.admin.token

      const { data } = await axios.get(`/api/admin/course/${id}/check`, {headers: { token }})

      this.participants = data.participants
      this.criteria = data.structure
    },
    async clicked () {
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
  },
  mounted() {
    this.initData()
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

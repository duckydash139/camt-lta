<template>
  <div id="">
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">STUDENT INFO</h3>
        <div v-if="student" class="has-text-grey has-text-weight-semibold">
          StudentID: <b>{{ $route.params.id }}</b><br>
          Name: <b>{{ student.first_name }} {{ student.last_name }}</b><br>
          Tracking: <b v-if="student.tracking === 0"></b><b v-else>{{ student.tracking }}</b><br>
        </div>
      </div>
    </div>
    <div class="columns padding-content">
      <div class="column">
        <b-tabs v-model="activeTab">
            <b-tab-item label="Summary">
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">Course</th>
                      <th class="has-text-centered">Points</th>
                      <th class="has-text-centered">Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="has-text-centered">955100 - LEARNING THROUGH ACTIVITIES 1</td>
                      <td class="has-text-centered">{{ total(true) }}</td>
                      <td class="has-text-centered">{{ student.tracking === 955100? 'Yes': 'No'}}</td>
                    </tr>
                    <tr>
                      <td class="has-text-centered">955101 - LEARNING THROUGH ACTIVITIES 2</td>
                      <td class="has-text-centered">{{ total(false) }}</td>
                      <td class="has-text-centered">{{ student.tracking === 955101? 'Yes': 'No'}}</td>
                    </tr>
                  </tbody>
                </table>
            </b-tab-item>
            <b-tab-item label="955100">
              <div v-if="result100.length > 0" class="is-size-7 has-text-left">
                <div v-for="structure in score100.structure" :key="structure.key" class="score-bar has-text-weight-bold">
                  {{ structure.title }}
                  <div class="is-pulled-right">{{ fetchScore(structure.id, true) }}<span v-if="structure.max"> / {{ structure.max }}</span></div>
                  <ProgressBar :now="fetchScore(structure.id, true)" :max="structure.max" :color="structure.color"></ProgressBar>
                </div>
              </div>
              <div v-else class="has-text-centered">
                No data
              </div>
            </b-tab-item>
            <b-tab-item label="955101">
              <div v-if="result101.length > 0" class="is-size-7 has-text-left">
                <div v-for="structure in score101.structure" :key="structure.key" class="score-bar has-text-weight-bold">
                  {{ structure.title }}
                  <div class="is-pulled-right">{{ fetchScore(structure.id, false) }}<span v-if="structure.max"> / {{ structure.max }}</span></div>
                  <ProgressBar :now="fetchScore(structure.id, false)" :max="structure.max" :color="structure.color"></ProgressBar>
                </div>
              </div>
              <div v-else class="has-text-centered">
                No data
              </div>
            </b-tab-item>
            <b-tab-item label="Requests">
              <table class="table is-fullwidth">
                <thead>
                  <tr>
                    <th class="has-text-centered">Request ID</th>
                    <th class="has-text-centered">Requested at</th>
                    <th class="has-text-centered">Course ID</th>
                    <th class="has-text-centered">Activity</th>
                    <th class="has-text-centered">Approved</th>
                    <th class="has-text-centered">Approved with Condition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in history.docs" :key="event.key">
                    <td class="has-text-centered"><router-link :to="`/admin/activities/${event._id}/view`">{{ event._id.substring(18,24) }}</router-link></td>
                    <td class="has-text-centered">{{ dateFormat(event.createdAt) }}</td>
                    <td class="has-text-centered">{{ event.course_id }}</td>
                    <td class="has-text-centered">{{ event.activity_title }}</td>
                    <td class="has-text-centered">{{ event.approved }}</td>
                    <td class="has-text-centered">{{ event.approvedWithCondition }}</td>
                  </tr>
                </tbody>
              </table>
              <b-pagination v-if="history.pages !== 1" @change="val => page(val)" :total="history.total" :current.sync="current" order="is-centered" :per-page="history.limit">
              </b-pagination>
            </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'

import ProgressBar from '~/components/ProgressBar.vue'

export default {
  layout: 'admin',
  components: {
    ProgressBar
  },
  data () {
    return {
      activeTab: 0,
      current: 1,
      history: {
        docs: null
      },
      student: {
        tracking: 0
      },
      result100: [],
      result101: [],
      score100: {
        structure: []
      },
      score101: {
        structure: []
      }
    }
  },
  methods: {
    async initData () {
      const studentId = this.$route.params.id
      let token = this.$store.state.admin.token

      const studentInfo = await axios.get(`/api/admin/student/${studentId}`, {headers: {token}})
      const historyAll = await axios.get(`/api/admin/student/${studentId}/history/all`, {headers: {token}})
      this.student = studentInfo.data
      this.history = historyAll.data

      if (studentInfo.data.tracking === 955100) {
        // set 955100 score
        const result100 = await axios.get(`/api/admin/student/${studentId}/${studentInfo.data.tracking_id}/score`, {headers: {token}})
        const score100 = await axios.get(`/api/criteria/${studentInfo.data.tracking_id}`)

        this.result100 = result100.data.scores
        this.score100 = score100.data

        // start to find 955101 score
        let history = studentInfo.data.history

        let result = _.find(history, ['course_id', 955101])

        if (result) {
          const result101 = await axios.get(`/api/admin/student/${studentId}/${result.batch_id}/score`, {headers: {token}})
          const score101 = await axios.get(`/api/criteria/${result.batch_id}`)
          this.result101 = result101.data.scores
          this.score101 = score101.data
        }
      } else if (studentInfo.data.tracking === 955101) {
        // set 955101 score
        const result101 = await axios.get(`/api/admin/student/${studentId}/${studentInfo.data.tracking_id}/score`, {headers: {token}})
        const score101 = await axios.get(`/api/criteria/${studentInfo.data.tracking_id}`)

        this.result101 = result101.data.scores
        this.score101 = score101.data

        // start to find 955100 score
        let history = studentInfo.data.history

        let result = _.find(history, ['course_id', 955100])

        if (result) {
          const result100 = await axios.get(`/api/admin/student/${studentId}/${result.batch_id}/score`, {headers: {token}})
          const score100 = await axios.get(`/api/criteria/${result.batch_id}`)
          this.result100 = result100.data.scores
          this.score100 = score100.data
        }
      } else {
        let history = studentInfo.data.history

        let buffer100 = _.find(history, ['course_id', 955100])
        let buffer101 = _.find(history, ['course_id', 955101])

        if (buffer100) {
          const result100 = await axios.get(`/api/admin/student/${studentId}/${result.batch_id}/score`, {headers: {token}})
          const score100 = await axios.get(`/api/criteria/${result.batch_id}`)
          this.result100 = result100.data.scores
          this.score100 = score100.data
        }

        if (buffer101) {
          const result101 = await axios.get(`/api/admin/student/${studentId}/${result.batch_id}/score`, {headers: {token}})
          const score101 = await axios.get(`/api/criteria/${result.batch_id}`)
          this.result101 = result101.data.scores
          this.score101 = score101.data
        }
      }
    },
    fetchScore (index, is100) {
      if (is100) {
        let result = 0
        this.result100.filter(score => {
          if (score.id == index) {
            result = score.point
          }
        })
        return result
      } else {
        let result = 0
        this.result101.filter(score => {
          if (score.id == index) {
            result = score.point
          }
        })
        return result
      }
    },
    total (is100) {
      if (!is100) {
        let points = 0
        this.result101.map(score => {
          points += score.point
        })

        if (points === 0) {
          return 'No data'
        } else {
          return points
        }
      } else {
        let points = 0
        this.result100.map(score => {
          points += score.point
        })

        if (points === 0) {
          return 'No data'
        } else {
          return points
        }
      }
    },
    async page (nextPage) {
      const token = this.$store.state.admin.token
      const studentId = this.$route.params.id
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/admin/student/${studentId}/history/all?page=${nextPage}`, {headers: {token}})
      this.history = data
      loading.close()
    },
    dateFormat (time) {
      return moment(time).format('DD/MMM/YY LT')
    }
  },
  mounted () {
    this.initData()
  }
}
</script>
<style scoped>
.content {
  margin: 0 1vw 0 1vw;
}
.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

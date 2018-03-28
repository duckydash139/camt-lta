<template>
<div>
  <div class="columns content">
    <div class="column is-9">
      <h3 class="has-text-weight-bold">{{ $route.params.code }} - {{ getTitle }}</h3>
      <h5 class="has-text-grey has-text-weight-semi-bold">Start from <b>{{ dateRange(courseDetail.createdAt) }}</b> until <b>{{ dateRange(courseDetail.checkoutAt) }}</b></h5>
<span class="has-text-grey has-text-weight-normal">Number of total participant: <b>{{ courseDetail.participant }}</b></span><br>
      <span class="has-text-grey has-text-weight-normal">Number of total student: <b>{{ courseDetail.unity_setting }}</b></span><br>
      <span class="has-text-grey has-text-weight-normal">Batch ID: <b>{{ courseDetail._id.substring(18,24) }}</b></span>
    </div>
    <div class="column is-3 has-text-right">
      <button @click="exportData" class="button is-success">Download report</button>
    </div>
  </div>
  <div class="columns padding-content">
    <div class="column">
      <b-tabs v-model="activeTab">
              <b-tab-item label="Scoreboard">
                <p class="has-text-right">Last updated at {{ lastUpdate(courseDetail.timestamp) }}</p>
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">StudentID</th>
                      <th class="has-text-centered">Firstname</th>
                      <th class="has-text-centered">Lastname</th>
                      <th class="has-text-centered">Score</th>
                      <th class="has-text-centered">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in scoreboard" :key="item.key">
                      <td><a @click="viewProfile(item.student_id)">{{ item.student_id }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.first_name }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.last_name }}</a></td>
                      <td>{{ item.total }}</td>
                      <td v-if="item.total >= 80">A</td>
                      <td v-else-if="item.total >= 75">B+</td>
                      <td v-else-if="item.total >= 70">B</td>
                      <td v-else-if="item.total >= 65">C+</td>
                      <td v-else-if="item.total >= 60">C</td>
                      <td v-else-if="item.total >= 55">D+</td>
                      <td v-else-if="item.total >= 50">D</td>
                      <td v-else>F</td>
                    </tr>
                  </tbody>
                </table>
              </b-tab-item>

              <b-tab-item label="Participants">
                <p class="has-text-right">Last updated at {{ lastUpdate(courseDetail.timestamp) }}</p>
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">StudentID</th>
                      <th class="has-text-centered">Firstname</th>
                      <th class="has-text-centered">Lastname</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in courseDetail.student_list" :key="item.key">
                      <td><a @click="viewProfile(item.student_id)">{{ item.student_id }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.first_name }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.last_name }}</a></td>
                    </tr>
                  </tbody>
                </table>
              </b-tab-item>

          </b-tabs>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import _ from 'lodash'

export default {
  layout: 'admin',
  data () {
    return {
      title: 'LEARNING THROUGH ACTIVITIES',
      activeTab: 0,
      courseDetail: {
        _id: 'batchid',
        participants: 0,
        student_list: []
      },
      criteria: []
    }
  },
  methods: {
    async fetchData () {
      const code = this.$route.params.code
      const batchId = this.$route.params.id
      let token = this.$store.state.admin.token

      const courseDetail = await axios.get(`/api/admin/course/${code}/history/${batchId}`, {headers: { token }})
      const criteria = await axios.get(`/api/criteria/${batchId}`, {headers: {token}})

      this.courseDetail = courseDetail.data.data
      this.criteria = criteria.data.structure
    },
    async exportData () {
      const code = this.$route.params.code
      const batchId = this.$route.params.id
      let token = this.$store.state.admin.token

      const { data } = await axios.get(`/api/admin/course/${code}/history/${batchId}/export`, {
        headers: { token },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${code}_${batchId}.xlsx`)
      document.body.appendChild(link)
      link.click()
    },
    viewProfile (id) {
      this.$router.push(`/admin/students/${id}`)
    },
    dateRange (date) {
      return moment(date).format('DD MMM YY')
    },
    lastUpdate (date) {
      return moment(date).format('DD/MMM/YY LT')
    }
  },
  computed: {
    getTitle () {
      let number = Number(this.$route.params.code[5]) + 1
      return `${this.title} ${number}`
    },
    scoreboard () {
      let buffer = []
      const list = this.courseDetail.student_list

      for (let student of list) {
        let total = 0
        for (let item of student.scores) {
          total += item.point
        }
        buffer.push({
          ...student,
          total
        })
      }

      return _.sortBy(buffer, ['total']).reverse()
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>
<style scoped>
.check {
  border: solid 1px red;
}
td {
  text-align: center;
}
.margin-bot {
  margin-bottom: 1vh;
}

.content {
  margin: 0 1vw 0 1vw;
  /*border: solid 1px red;*/
}
.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

<template>
<div>
  <div class="columns content">
    <div class="column is-9">
      <h3 class="has-text-weight-bold">{{ $route.params.code }} - {{ getTitle }}</h3>
      <h5 class="has-text-grey has-text-weight-semi-bold">Start from <b>{{ dateRange(courseDetail.createdAt) }}</b> until <b>Today</b></h5>
      <span class="has-text-grey has-text-weight-normal">Number of total student: <b>{{ courseDetail.participants }}</b></span><br>
      <small class="is-size-7 has-text-danger">* Will use to calculate <i>Unity</i> score</small>
    </div>
    <div v-if="activeTab !== 3" class="column is-3 has-text-right">
      <button @click="viewSetting" class="button margin-bot">Setting</button>&nbsp;
      <button @click="closePhase" class="button is-info margin-bot">Checkout</button><br>
      <!-- <button @click="exportData" class="button is-success">Export data</button> -->
    </div>
  </div>
  <div class="columns padding-content">
    <div class="column">
      <b-tabs v-model="activeTab">
              <b-tab-item label="Scoreboard">
                <p v-if="scoreboard" class="has-text-grey has-text-right">Last updated at {{lastUpdate(this.scoreboard.timestamp)}}</p>
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
                  <tbody v-if="scoreboard.data.student_list">
                    <tr v-for="item in scoreboard.data.student_list" :key="item.key">
                      <td><a @click="viewProfile(item.student_id)">{{ item.student_id }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.first_name }}</a></td>
                      <td><a @click="viewProfile(item.student_id)">{{ item.last_name }}</a></td>
                      <td>{{ item.points }}</td>
                      <td v-if="item.points >= 80">A</td>
                      <td v-else-if="item.points >= 75">B+</td>
                      <td v-else-if="item.points >= 70">B</td>
                      <td v-else-if="item.points >= 65">C+</td>
                      <td v-else-if="item.points >= 60">C</td>
                      <td v-else-if="item.points >= 55">D+</td>
                      <td v-else-if="item.points >= 50">D</td>
                      <td v-else>F</td>
                    </tr>
                  </tbody>
                </table>
              </b-tab-item>

              <b-tab-item label="Participants">
                <p v-if="participants" class="has-text-grey has-text-right">Last updated at {{lastUpdate(this.participants.timestamp)}}</p>
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">StudentID</th>
                      <th class="has-text-centered">Firstname</th>
                      <th class="has-text-centered">Lastname</th>
                      <th class="has-text-centered"></th>
                    </tr>
                  </thead>
                  <tbody v-if="participants.data">
                    <tr v-for="item in participants.data" :key="item.key">
                      <td>{{ item.student_id }}</td>
                      <td>{{ item.first_name }}</td>
                      <td>{{ item.last_name }}</td>
                      <td><a @click="viewProfile(item.student_id)">View profile</a></td>
                    </tr>
                  </tbody>
                </table>
              </b-tab-item>

              <b-tab-item label="Unity">
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">ID</th>
                      <th class="has-text-centered">Title</th>
                      <th class="has-text-centered">Date</th>
                      <th class="has-text-centered">Location</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in unity" :key="item.key">
                      <td>{{ item._id.substring(18,24) }}</td>
                      <td>{{ item.title }}</td>
                      <td>{{ lastUpdate(item.date) }}</td>
                      <td>{{ item.location }}</td>
                      <td v-if="checkUnity(item._id)"><b-icon class="has-text-success" pack="fa" icon="check"/></td>
                      <td v-else><a @click="selectUnity(item._id)">Select</a></td>
                    </tr>
                  </tbody>
                </table>
              </b-tab-item>

              <b-tab-item label="History">
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th class="has-text-centered">Batch ID</th>
                      <th class="has-text-centered">Date</th>
                      <th class="has-text-centered">Participants</th>
                      <th class="has-text-centered"></th>
                    </tr>
                  </thead>
                  <tbody v-if="history.data.docs">
                    <tr v-for="item in history.data.docs" :key="item.key">
                      <td><a @click="viewPhase(item._id)">{{ item._id.substring(18,24) }}</a></td>
                      <td>{{ dateRange(item.createdAt) }} - {{ dateRange(item.checkoutAt) }}</td>
                      <td>{{ item.participant }}</td>
                      <td><a @click="viewPhase(item._id)">View</a></td>
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
import qs from 'querystring'
import moment from 'moment'
export default {
  layout: 'admin',
  data () {
    return {
      title: 'LEARNING THROUGH ACTIVITIES',
      activeTab: 0,
      scoreboard: {
        data: {
          student_list: []
        }
      },
      participants: {
        data: []
      },
      history: {
        data: {
          docs: []
        }
      },
      courseDetail: {
        participants: 0
      },
      unity: []
    }
  },
  methods: {
    async fetchData () {
      try {
        const code = this.$route.params.code
        let token = this.$store.state.admin.token

        const scoreboard = await axios.get(`/api/admin/course/${code}/scoreboard`, {headers: {token}})
        const participants = await axios.get(`/api/admin/course/${code}/participants`, {headers: {token}})
        const history = await axios.get(`/api/admin/course/${code}/history`, {headers: {token}})
        const courseDetail = await axios.get(`/api/admin/course/${code}/check`, {headers: { token }})
        const unity = await axios.get(`/api/admin/course/${code}/unity`, {headers: { token }})

        if (scoreboard.data.success && participants.data.success && history.data.success && courseDetail.data.success) {
          this.scoreboard = scoreboard.data
          this.participants = participants.data
          this.history = history.data
          this.courseDetail = courseDetail.data
          this.unity = unity.data
        } else {
          this.$router.push(`/admin/courses/${code}/new`)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closePhase () {
      const code = this.$route.params.code
      let token = this.$store.state.admin.token

      this.$dialog.confirm({
        message: `<strong>Confirm</strong><br />
        Do you want to close this phase?`,
        confirmText: 'Confirm',
        type: 'is-info',
        onConfirm: async () => {
          const { data } = await axios.post(`/api/admin/course/${code}/checkout`, {headers: {token}})

          if (data.success) {
            this.$router.push(`/admin/courses/${code}/history/${data.id}`)
          }
          // this.$toast.open('User confirmed')
        }
      })
    },
    async selectUnity (id) {
      const code = this.$route.params.code
      let token = this.$store.state.admin.token
      let unityList = this.unity

      const { data } = await axios.put(`/api/admin/course/${code}/unity`, qs.stringify({
        activity_id: id
      }), {headers: {token}})

      if (data.success) {
        location.reload()
      }
    },
    async exportData () {
      const code = this.$route.params.code
      const batchId = this.courseDetail.id
      const token = this.$store.state.admin.token

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
    checkUnity (id) {
      if (this.courseDetail.unity_id === id) {
        return true
      }
      return false
    },
    viewProfile (id) {
      this.$router.push(`/admin/students/${id}`)
    },
    viewPhase (id) {
      this.$router.push(`/admin/courses/${this.$route.params.code}/history/${id}`)
    },
    viewSetting () {
      this.$router.push(`/admin/courses/${this.$route.params.code}/setting`)
    },
    lastUpdate (time) {
      return moment(time).format('DD/MMM/YY LT')
    },
    dateRange (date) {
      return moment(date).format('DD MMM YY')
    }
  },
  computed: {
    getTitle () {
      let number = Number(this.$route.params.code[5]) + 1
      return `${this.title} ${number}`
    },
    checkout () {
      return `/admin/courses/${this.$route.params.code}/checkout`
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
}
.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

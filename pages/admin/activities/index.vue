<template>
<div>
  <div class="columns content">
    <div class="column is-10">
      <h3 class="has-text-weight-bold">
        ACTIVITIES
      </h3>
    </div>
    <div class="column is-2 has-text-right">
      <button class="button is-info" @click="link('add')">New activity</button>
    </div>
  </div>
  <div class="columns padding-content">
    <div class="column">
      <b-tabs>
        <b-tab-item label="Pending">
          <p class="has-text-right">Last updated at {{ dateFormat(pending.timestamp) }}</p>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th class="has-text-centered">Requested at</th>
                <th class="has-text-centered">Requested by</th>
                <th class="has-text-centered">Course</th>
                <th class="has-text-centered">Activity</th>
                <th class="has-text-centered"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pending.docs" :key="item.key">
                <td>{{ dateFormat(item.createdAt) }}</td>
                <td><router-link :to="`/admin/students/${item.student_id}`">{{ item.first_name }} {{ item.last_name }}</router-link></td>
                <td>{{ item.course_id }}</td>
                <td>{{ item.activity_title }}</td>
                <td>
                  <router-link :to="`/admin/activities/${item._id}`">View</router-link>&nbsp;
                </td>
              </tr>
            </tbody>
          </table>
          <b-pagination v-if="pending.pages !== 1" @change="val => pendingPage(val)" :total="pending.total" :current.sync="pendingCurrent" order="is-centered" :per-page="pending.limit">
          </b-pagination>
        </b-tab-item>
        <b-tab-item label="Approved">
          <p class="has-text-right">Last updated at {{ dateFormat(approved.timestamp) }}</p>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th class="has-text-centered">Requested at</th>
                <th class="has-text-centered">Requested by</th>
                <th class="has-text-centered">Course</th>
                <th class="has-text-centered">Activity</th>
                <th class="has-text-centered"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in approved.docs" :key="item.key">
                <td>{{ dateFormat(item.createdAt) }}</td>
                <td><router-link :to="`/admin/students/${item.student_id}`">{{ item.first_name }} {{ item.last_name }}</router-link></td>
                <td>{{ item.course_id }}</td>
                <td>{{ item.activity_title }}</td>
                <td>
                  <a @click="link('view',item._id)">View</a>&nbsp;
                </td>
              </tr>
            </tbody>
          </table>
          <b-pagination v-if="approved.pages !== 1" @change="val => approvedPage(val)" :total="approved.total" :current.sync="approvedCurrent" order="is-centered" :per-page="approved.limit">
          </b-pagination>
        </b-tab-item>
        <b-tab-item label="Canceled">
          <p class="has-text-right">Last updated at {{ dateFormat(canceled.timestamp) }}</p>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th class="has-text-centered">Requested at</th>
                <th class="has-text-centered">Requested by</th>
                <th class="has-text-centered">Course</th>
                <th class="has-text-centered">Activity</th>
                <th class="has-text-centered"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in canceled.docs" :key="item.key">
                <td>{{ dateFormat(item.createdAt) }}</td>
                <td><router-link :to="`/admin/students/${item.student_id}`">{{ item.first_name }} {{ item.last_name }}</router-link></td>
                <td>{{ item.course_id }}</td>
                <td>{{ item.activity_title }}</td>
                <td>
                  <a @click="link('view',item._id)">View</a>&nbsp;
                </td>
              </tr>
            </tbody>
          </table>
          <b-pagination v-if="canceled.pages !== 1" @change="val => canceledPage(val)" :total="canceled.total" :current.sync="canceledCurrent" order="is-centered" :per-page="canceled.limit">
          </b-pagination>
        </b-tab-item>
        <!-- <b-tab-item label="History">
          qweq
        </b-tab-item> -->
      </b-tabs>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'

export default {
  layout: 'admin',
  data () {
    return {
      pending: {
        docs: null
      },
      pendingCurrent: 1,
      approved: {
        docs: null
      },
      approvedCurrent: 1,
      canceled: {
        docs: null
      },
      canceledCurrent: 1
    }
  },
  computed: {},
  methods: {
    initData () {
      let token = this.$store.state.admin.token
      this.fetchPendingData(token)
      this.fetchApprovedData(token)
      this.fetchCanceledData(token)
    },
    async fetchPendingData (token) {
      const { data } = await axios.get(`/api/admin/activity/pending`, { headers: {token}})
      this.pending = data
    },
    async fetchApprovedData (token) {
      const { data } = await axios.get(`/api/admin/activity/approved`, { headers: {token}})
      this.approved = data
    },
    async fetchCanceledData (token) {
      const { data } = await axios.get(`/api/admin/activity/canceled`, { headers: {token}})
      this.canceled = data
    },
    async pendingPage (nextPage) {
      let token = this.$store.state.admin.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/admin/activity/pending?page=${nextPage}`, {headers: {token}})
      this.pending = data
      loading.close()
    },
    async approvedPage (nextPage) {
      let token = this.$store.state.admin.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/admin/activity/approved?page=${nextPage}`, {headers: {token}})
      this.approved = data
      loading.close()
    },
    async canceledPage (nextPage) {
      let token = this.$store.state.admin.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/admin/activity/canceled?page=${nextPage}`, {headers: {token}})
      this.canceled = data
      loading.close()
    },
    link (method, requestId) {
      if (method === 'add') {
        this.$router.push(`/admin/activities/add`)
      } else if (method === 'view') {
        this.$router.push(`/admin/activities/${requestId}/view`)
      }
    },
    dateFormat (time) {
      return moment(time).format('DD/MMM/YY LT')
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
  /*border: solid 1px red;*/
}

td {
  text-align: center;
}

.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

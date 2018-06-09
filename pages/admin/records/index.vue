<template>
<div>
  <div class="columns content">
    <div class="column is-10">
      <h3 class="has-text-weight-bold">
        RECORDS
      </h3>
    </div>
  </div>
  <div class="columns padding-content">
    <div class="column">
      <b-tabs>
        <b-tab-item label="Pending">
          <DataTable :headers="headers" :data="pending" :searchable="true" :searchKeys="keys">
            <template slot-scope="props">
              <td>{{ dateFormat(props.item.createdAt) }}</td>
              <td>{{ props.item.student_id }} - {{ props.item.first_name }} {{ props.item.last_name }}</td>
              <td>{{ props.item.course_id }}</td>
              <td>{{ props.item.activity_title }}</td>
              <td>
                <router-link :to="`/admin/records/${props.item._id}`">View</router-link>
              </td>
            </template>
          </DataTable>
          
        </b-tab-item>
        <b-tab-item label="Approved">
          <DataTable :headers="headers" :data="approved" :searchable="true" :searchKeys="keys">
            <template slot-scope="props">
              <td>{{ dateFormat(props.item.createdAt) }}</td>
              <td>{{ props.item.student_id }} - {{ props.item.first_name }} {{ props.item.last_name }}</td>
              <td>{{ props.item.course_id }}</td>
              <td>{{ props.item.activity_title }}</td>
              <td>
                <router-link :to="`/admin/records/${props.item._id}`">View</router-link>
              </td>
            </template>
          </DataTable>
        </b-tab-item>
        <b-tab-item label="Canceled">
          <DataTable :headers="headers" :data="canceled" :searchable="true" :searchKeys="keys">
            <template slot-scope="props">
              <td>{{ dateFormat(props.item.createdAt) }}</td>
              <td>{{ props.item.student_id }} - {{ props.item.first_name }} {{ props.item.last_name }}</td>
              <td>{{ props.item.course_id }}</td>
              <td>{{ props.item.activity_title }}</td>
              <td>
                <router-link :to="`/admin/records/${props.item._id}`">View</router-link>
              </td>
            </template>
          </DataTable>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import DataTable from '~/components/DataTable'

export default {
  layout: 'admin',
  components: {
    DataTable
  },
  data () {
    return {
      headers: [
        'Requested at',
        'Requested by',
        'Course',
        'Activity',
        ''
      ],
      keys: [
        'student_id',
        'first_name',
        'last_name',
        'activity_title'
      ],
      pending: [],
      approved: [],
      canceled: []
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
    link (method, requestId) {
      if (method === 'add') {
        this.$router.push(`/admin/activities/add`)
      } else if (method === 'view') {
        this.$router.push(`/admin/records/${requestId}/view`)
      }
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
  /*border: solid 1px red;*/
}

th, td {
  text-align: center;
}

.padding-content {
  padding: 0 1vw 0 1vw;
}
</style>

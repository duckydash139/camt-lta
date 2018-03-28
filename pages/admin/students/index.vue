<template>
  <div id="">
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">STUDENT LIST</h3>
      </div>
    </div>
    <div class="columns content">
      <div class="column">
        <table class="table">
          <thead>
            <tr>
              <th class="has-text-centered">Student ID</th>
              <th class="has-text-centered">Name</th>
              <th class="has-text-centered">Tracking</th>
              <th class="has-text-centered">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students.docs" :key="student.key">
              <td>{{ student.student_id }}</td>
              <td>{{ student.first_name }} {{ student.last_name }}</td>
              <td><span v-if="student.tracking === 0"></span><span v-else>{{ student.tracking }}</span></td>
              <td><a @click="viewProfile(student.student_id)">View</a></td>
            </tr>
          </tbody>
        </table>
        <b-pagination v-if="students.pages !== 1" @change="val => page(val)" :total="students.total" :current.sync="current" order="is-centered" :per-page="students.limit">
        </b-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  layout: 'admin',
  data () {
    return {
      students: {
        docs: null
      },
      current: 1
    }
  },
  methods: {
    async initData () {
      let token = this.$store.state.admin.token
      const { data } = await axios.get(`/api/admin/student/all`, {headers: {token}})
      this.students = data
    },
    viewProfile (id) {
      return this.$router.push(`/admin/students/${id}`)
    },
    async page (nextPage) {
      let token = this.$store.state.admin.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/admin/student/all?page=${nextPage}`, {headers: {token}})
      this.students = data
      loading.close()
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
td {
  text-align: center;
}
</style>

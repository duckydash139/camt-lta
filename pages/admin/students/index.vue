<template>
  <div id="">
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">STUDENT LIST</h3>
      </div>
    </div>
    <div class="columns">
      <div class="column padding-content">
        <DataTable :headers="headers" :data="students" :searchable="true" :searchKeys="keys">
            <template slot-scope="props">
              <td>{{ props.item.student_id }}</td>
              <td>{{ props.item.first_name }} {{ props.item.last_name }}</td>
              <td><span v-if="props.item.tracking === 0"></span><span v-else>{{ props.item.tracking }}</span></td>
              <td><a @click="viewProfile(props.item.student_id)">View</a></td>
            </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>
<script>
import DataTable from '~/components/DataTable'
import axios from 'axios'
export default {
  layout: 'admin',
  components: {
    DataTable
  },
  data () {
    return {
      headers: [
        'Student ID',
        'Name',
        'Tracking',
        ''
      ],
      keys: [
        'student_id',
        'first_name',
        'last_name'
      ],
      students: []
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
  padding: 0 2vw 0 2vw;
}
</style>

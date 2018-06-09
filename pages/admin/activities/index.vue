<template>
<div>
  <div class="columns content">
    <div class="column is-10">
      <h3 class="has-text-weight-bold">
        ACTIVITIES
      </h3>
    </div>
    <div class="column is-2 has-text-right">
      <button class="button is-info">Add</button>
    </div>
  </div>
  <div class="columns padding-content">
    <div class="column">
      <DataTable :headers="headers" :data="activities" :searchable="true" :searchKeys="keys">
        <template slot-scope="props">
          <td>{{ dateFormat(props.item.startAt) }}</td>
          <td>{{ props.item.title }}</td>
          <td>{{ props.item.description.substring(0, 30) }}</td>
          <td>{{ props.item.location }}</td>
          <td>
            <router-link :to="`/admin/activities/${props.item._id}`">View</router-link>
          </td>
        </template>
      </DataTable>
    </div>
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
  data() {
    return {
      headers: [
        'Date',
        'Title',
        'Description',
        'Location',
        ''
      ],
      keys: [
        'title',
        'description',
        'location'
      ],
      activities: [],
    }
  },
  methods: {
    async fetchData (token) {
      const { data } = await axios.get(`/api/admin/activity/all`)
      this.activities = data
    },
    dateFormat (time) {
      return moment(time).format('DD/MMM/YY LT')
    }
  },
  mounted () {
    this.fetchData()
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

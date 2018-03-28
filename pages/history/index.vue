<template>
<div>
  <ContentGrid>
    <div slot="left">
      <br>
      <RequestCard v-for="data of activities.docs" :detail="data"/>
      <b-pagination v-if="activities.pages !== 1" @change="val => page(val)" :total="activities.total" :current.sync="current" order="is-centered" :per-page="activities.limit"/>
    </div>
  </ContentGrid>
</div>
</template>

<script>
import axios from 'axios'
import ContentGrid from '~/components/ContentGrid.vue'
import RequestCard from '~/components/RequestCard.vue'

export default {
  data () {
    return {
      activities: '',
      current: 1
    }
  },
  components: {
    ContentGrid,
    RequestCard
  },
  methods: {
    fetchData () {
      if(!this.$store.state.user.user) {
        setTimeout(() => {
          let studentId = this.$store.state.user.user.studentId
          let token = this.$store.state.user.token
          axios.get(`/api/users/${studentId}/history/all?page=1`, {headers: { token }})
          .then(({ data }) => this.activities = data)
        }, 10)
      } else {
        let token = this.$store.state.user.token
        let studentId = this.$store.state.user.user.studentId
        axios.get(`/api/users/${studentId}/history/all?page=1`, {headers: { token }})
        .then(({ data }) => this.activities = data)
      }
    },
    async page (nextPage) {
      let studentId = this.$store.state.user.user.studentId
      let token = this.$store.state.user.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/users/${studentId}/history/all?page=${nextPage}`, {headers: { token }})
      this.activities = data
      loading.close()
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<template>
<div>
  <ContentGrid>
    <div slot="left">
      <br>
      <RequestCard v-for="data of activities" :detail="data"/>
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
      activities: ''
    }
  },
  components: {
    ContentGrid,
    RequestCard
  },
  methods: {
    async fetchData () {
      let token = this.$store.state.user.token
      const { data } = await axios.get(`/api/history/${this.$router.currentRoute.params.id}`, {headers: {token}})

      this.activities = data
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

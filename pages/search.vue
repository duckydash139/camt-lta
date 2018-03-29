<template>
  <ContentGrid>
    <div slot="left">
      <h1 class="is-size-4">Result of "{{ $route.query.q }}"</h1><br>
      <ActivityCard v-for="data of activities" :detail="data"></ActivityCard>
    </div>
  </ContentGrid>
</template>

<script>
import axios from 'axios'
import ContentGrid from '~/components/ContentGrid.vue'
import ActivityCard from '~/components/ActivityCard.vue'
export default {
  name: "",
  components: {
    ActivityCard,
    ContentGrid
  },
  data () {
    return {
      activities: [],
      current: 1
    }
  },
  methods: {
    async fetchData () {
      const { data } = await axios.get(`/api/event?keyword=${this.$route.query.q}`)
      console.log(data)
      this.activities = data
    }
  },
  created () {
    this.fetchData()
  },
  updated () {
    this.fetchData()
  }
}
</script>
<style lang="scss" scoped>
</style>

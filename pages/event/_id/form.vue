<template>
  <div id="main">
    <ContentGrid>
      <div slot="left">
        <ActivityForm :detail="event"></ActivityForm>
      </div>
    </ContentGrid>
  </div>
</template>
<script>
import axios from 'axios'
import ContentGrid from '~/components/ContentGrid.vue'
import ActivityForm from '~/components/ActivityForm.vue'

export default {
  data () {
    return {
      event: ''
    }
  },
  components: {
    ActivityForm,
    ContentGrid
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      let { data } = await axios.get(`/api/event/${this.$router.currentRoute.params.id}`)
      this.event = data
    }
  }
}
</script>
<style>
</style>

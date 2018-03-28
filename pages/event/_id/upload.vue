<template>
  <div id="main">
    <ContentGrid>
      <div slot="left">
        <Editor :detail="event" :dropdown="dropdowns"/>
      </div>
    </ContentGrid>
  </div>
</template>
<script>
import axios from 'axios'
import ContentGrid from '~/components/ContentGrid.vue'
import Editor from '~/components/Editor.vue'

export default {
  data () {
    return {
      event: '',
      dropdowns: [],
    }
  },
  components: {
    Editor,
    ContentGrid
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      let { data } = await axios.get(`/api/event/${this.$router.currentRoute.params.id}`)
      this.event = data

      setTimeout(() => {
        const course = this.$store.state.user.user.trackingId
        axios.get(`/api/criteria/${course}`)
        .then(({ data }) => this.dropdowns = data.structure)
      }, 10)
    }
  }
}
</script>
<style>
</style>

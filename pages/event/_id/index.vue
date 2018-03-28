<template>
  <div id="main">
    <ContentGrid>
      <div slot="left">
        <br>
        <ActivityCard :detail="event"></ActivityCard>
      </div>
    </ContentGrid>
  </div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import ContentGrid from '~/components/ContentGrid.vue'
import ActivityCard from '~/components/ActivityCard.vue'

export default {
  data () {
    return {
      event: ''
    }
  },
  components: {
    ActivityCard,
    ContentGrid
  },
  beforeMount () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      let { data } = await axios.get(`/api/event/${this.$router.currentRoute.params.id}`)
      this.event = data
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  }
}
</script>
<style>
</style>

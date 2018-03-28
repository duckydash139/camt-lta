<template>
<div>
  <ContentGrid>
    <div slot="left">
      <div class="columns">
        <div class="column text-right">
          <router-link to="/create" v-if="signedIn" class="button is-info">
            Create new activity
          </router-link>
        </div>
      </div>
      <ActivityCard v-for="data of activities.docs" :detail="data"></ActivityCard>
      <b-pagination v-if="activities.pages !== 1" @change="val => page(val)" :total="activities.total" :current.sync="current" order="is-centered" :per-page="activities.limit">
      </b-pagination>
    </div>
  </ContentGrid>
</div>
</template>

<script>
import axios from 'axios'
import ContentGrid from '~/components/ContentGrid.vue'
import ActivityCard from '~/components/ActivityCard.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    ActivityCard,
    ContentGrid
  },
  data () {
    return {
      activities: '',
      current: 1
    }
  },
  mounted () {
    this.fetchData()

    setTimeout(() => {
      const profile = this.signedIn
      if (!profile.tracking || profile.tracking === 0) {
        this.$router.push('/courses')
      }
    }, 500)
  },
  methods: {
    async fetchData () {
      const { data } = await axios.get('/api/event?page=1')
      this.activities = data
    },
    async page (nextPage) {
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/event?page=${nextPage}`)
      this.activities = data
      loading.close()
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  }
}
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>

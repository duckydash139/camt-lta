<template>
  <div>
    <ContentGrid>
      <div slot="left">
        <div class="header">
        <span class="is-size-3">History</span>
        <div class="tabs is-toggle is-fullwidth">
          <ul>
            <li class="">
              <router-link to="activities">
                <span>Activities</span>
              </router-link>
            </li>
            <li>
              <router-link to="interests">
                <span>Interests</span>
              </router-link>
            </li>
            <li class="is-active">
              <a>
                <span>Records</span>
              </a>
            </li>
          </ul>
        </div>
        </div>
        <br>
        <RequestCard v-for="data of activities.docs" :key="data.key" :detail="data" />
        <b-pagination v-if="activities.pages !== 1" @change="val => page(val)" :total="activities.total" :current.sync="current" order="is-centered" :per-page="activities.limit" />
      </div>
    </ContentGrid>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
      let token = this.$store.state.user.token
      let studentId = this.$store.state.user.user.studentId
      axios.get(`/api/users/${studentId}/history/all?page=1`, { headers: { token } })
        .then(({ data }) => this.activities = data)
    },
    async page (nextPage) {
      let studentId = this.$store.state.user.user.studentId
      let token = this.$store.state.user.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/users/${studentId}/history/all?page=${nextPage}`, { headers: { token } })
      this.activities = data
      loading.close()
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      storedScores: 'event/scores'
    })
  },
  mounted () {
    if (this.signedIn) {
      this.fetchData()
    }
  },
  watch: {
    signedIn (value) {
      if (value) {
        this.fetchData()
      }
    }
  }
}
</script>
<style scoped>
.header {
 margin-left: -2.0vh;
 margin-right: 1.5vh;
}

.tabs {
  background-color: white;
}

.tabs.is-toggle li.is-active a {
    background-color: hsl(204, 86%, 53%);
    border-color: hsl(204, 86%, 53%);
    color: white;
    z-index: 1;
}

@media (max-width: 768px) {
  .header {
    margin: 0;
  }
}
</style>


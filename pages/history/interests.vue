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
            <li class="is-active">
              <a>
                <span>Interests</span>
              </a>
            </li>
            <li>
              <router-link to="records">
                <span>Records</span>
              </router-link>
            </li>
          </ul>
        </div>
        </div>
        <br>
        <table class="table header is-bordered is-fullwidth">
          <thead>
            <tr>
              <th colspan="2">Activity name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(interest, key) of interests.docs" :key="interest.key">
              <td>
                <router-link :to="`/event/${interest.activity_id}`">{{ interest.activity_title }}</router-link>
                <button @click="unpin(interest.activity_id, key)" class="button is-light is-small is-pulled-right">Clear</button>
              </td>
            </tr>
            <tr v-if="interests.docs.length < 1">
              <td class="has-text-centered">No data</td>
            </tr>
          </tbody>
        </table>
        <b-pagination v-if="interests.pages !== 1" @change="val => page(val)" :total="interests.total" :current.sync="current" order="is-centered" :per-page="interests.limit" />
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
      interests: {
        docs: []
      },
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
      axios.get(`/api/users/${studentId}/interest/all?page=1`, { headers: { token } })
        .then(({ data }) => this.interests = data)
    },
    async page (nextPage) {
      let studentId = this.$store.state.user.user.studentId
      let token = this.$store.state.user.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/users/${studentId}/history/all?page=${nextPage}`, { headers: { token } })
      this.activities = data
      loading.close()
    },
    async unpin (id, key) {
      let token = this.$store.state.user.token
      const payload = {
        student_id: this.$store.state.user.user.studentId
      }

      await axios.post(
        `/api/event/${id}/interest`,
        payload,
        { headers: { token } }
      )

      this.interests.docs.splice(key, 1)

      this.$toast.open('Updated!')
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


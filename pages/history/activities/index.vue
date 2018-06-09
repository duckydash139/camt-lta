<template>
  <div>
    <ContentGrid>
      <div slot="left">
        <div class="header">
        <span class="is-size-3">History</span>
        <div class="tabs is-toggle is-fullwidth">
          <ul>
            <li class="is-active">
              <a>
                <span>Activities</span>
              </a>
            </li>
            <li>
              <router-link to="interests">
                <span>Interests</span>
              </router-link>
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
            <tr v-for="(activity, key) of activities.docs" :key="activity.key">
              <td v-if="activity.isAvailable">
                <router-link :to="`/event/${activity._id}`">{{ activity.title }}</router-link>
                <button @click="deleteItem(activity, key)" class="button is-danger is-small is-pulled-right left-space">Delete</button>
                <button @click="editItem(activity)" class="button is-light is-small is-pulled-right">Edit</button>
              </td>
            </tr>
            <tr v-if="activities.docs.length < 1">
              <td class="has-text-centered">No data</td>
            </tr>
          </tbody>
        </table>
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
      activities: {
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
      axios.get(`/api/users/${studentId}/activity/all?page=1`, { headers: { token } })
        .then(({ data }) => this.activities = data)
    },
    async page (nextPage) {
      let studentId = this.$store.state.user.user.studentId
      let token = this.$store.state.user.token
      const loading = this.$loading.open()
      const { data } = await axios.get(`/api/users/${studentId}/activity/all?page=${nextPage}`, { headers: { token } })
      this.activities = data
      loading.close()
    },
    async editItem (item) {
      const { data } = await axios.get(`/api/event/${item._id}/delete/check`)

      if (data.deletable) {
        this.$router.push(`/history/activities/${item._id}/edit`)
      } else {
        this.$dialog.alert('Cannot edit this activity due to someone had submitted the record')
      }
    },
    async deleteItem (item, key) {
      const vm = this
      const { data } = await axios.get(`/api/event/${item._id}/delete/check`)

      if (data.deletable) {
        this.$dialog.confirm({
          message: `<strong>Confirm</strong><br />
          Do you want to delete <strong>${item.title}</strong>?`,
          confirmText: 'Confirm',
          type: 'is-danger',
          onConfirm: () => {
            axios.post(`/api/event/${item._id}/delete`)
            .then(() => {
              vm.activities.docs.splice(key, 1)
              vm.$toast.open('Deleted!')
            })
          }
        })
      } else {
        this.$dialog.alert('Cannot delete this activity due to someone had submitted the record')
      }
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

.left-space {
  margin-left: 5px;
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


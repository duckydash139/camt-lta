<template>
<div>
  <ContentGrid>
    <div slot="left">
      <div class="card extend-card" v-if="event">
        <form @submit.prevent="addActivity">
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <input v-model="event.title" type="text" class="input" placeholder="Title" required>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <datetime input-class="input" placeholder="Start at" v-model="event.startAt" type="datetime" required></datetime>
            </div>
            <div class="column">
              <datetime input-class="input" placeholder="End at" v-model="event.endAt" :min-date="startAt" type="datetime" required></datetime>
            </div>
          </div>
          <div class="columns">
            <div class="column is-5-desktop">
              <input v-model="event.location" type="text" class="input" placeholder="Location">
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <textarea v-model="event.description" class="textarea" name="name" rows="8" cols="80" placeholder="Description" required></textarea>
            </div>
          </div>
          <div class="columns">
            <div class="column is-offset-10-desktop text-right">
              <button class="button is-info full-width-mobile">Edit</button>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  </ContentGrid>
</div>
</template>

<script>
import axios from 'axios'
import qs from 'querystring'
import { mapGetters } from 'vuex'
import ContentGrid from '~/components/ContentGrid.vue'
import ActivityCard from '~/components/ActivityCard.vue'

export default {
  components: {
    ActivityCard,
    ContentGrid
  },
  data () {
    return {
        event: {
            title: '',
            startAt: '',
            endAt: '',
            location: '',
            description: ''
        }
    }
  },
  methods: {
    async fetchData () {
      let { data } = await axios.get(`/api/event/${this.$router.currentRoute.params.id}`)
      this.event = data
    },
    async addActivity () {
      const loading = this.$loading.open()
      try {
        const token = this.token
        const payload = {
          title: this.event.title,
          startAt: this.event.startAt,
          endAt: this.event.endAt,
          location: this.event.location,
          description: this.event.description
        }

        await axios.post(
          `/api/event/${this.$router.currentRoute.params.id}/edit`,
          qs.stringify(payload),
          { headers: { token } }
        )
        loading.close()
        this.$router.push(`/history/activities`)
      } catch (e) {
        loading.close()
        this.$toast.open(e.response.data.message)
      }
    }
  },
  mounted () {
    this.fetchData()
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      token: 'user/token'
    })
  }
}
</script>

<style scoped>
.extend-card {
  border-radius: 2px;
}

.text-right {
  text-align: right;
}

@media (max-width: 768px) {
  .full-width-mobile {
    width: 100%;
  }
}
</style>

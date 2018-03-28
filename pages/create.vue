<template>
<div>
  <ContentGrid>
    <div slot="left">
      <div class="card extend-card">
        <form @submit.prevent="addActivity">
        <p class="card-header-title is-size-3">
          Create new activity
        </p>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <input v-model="title" type="text" class="input" placeholder="Title" required>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <datetime input-class="input" placeholder="Date" v-model="date" type="datetime" required></datetime>
            </div>
          </div>
          <div class="columns">
            <div class="column is-5-desktop">
              <input v-model="location" type="text" class="input" placeholder="Location">
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <textarea v-model="description" class="textarea" name="name" rows="8" cols="80" placeholder="Description" required></textarea>
            </div>
          </div>
          <div class="columns">
            <div class="column is-offset-10-desktop text-right">
              <button class="button is-info full-width-mobile">Create</button>
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
      title: '',
      date: '',
      location: '',
      description: ''
    }
  },
  methods: {
    async addActivity () {
      const loading = this.$loading.open()
      try {
        const token = this.token
        const payload = {
          title: this.title,
          date: this.date,
          location: this.location,
          description: this.description,
          user: this.signedIn.id
        }

        const event = await axios.post(`/api/event/add`,
          qs.stringify(payload),
          {headers: { token }}
        )
        loading.close()
        this.$router.push(`/event/${event.data.id}`)
      } catch (e) {
        loading.close()
        this.$toast.open(e.response.data.message)
      }
    }
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

<template>
<div>
  <div class="columns content">
    <div class="column">
      <h3 class="has-text-weight-bold">
          CREATE NEW ACTIVITY
      </h3>
    </div>
  </div>
  <div class="columns content">
      <div class="column card">
      <form @submit.prevent="addActivity">
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <input v-model="title" type="text" class="input" placeholder="Title" required>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <datetime input-class="input" placeholder="Start at" v-model="startAt" type="datetime" required></datetime>
            </div>
            <div class="column">
              <datetime input-class="input" placeholder="End at" v-model="endAt" :min-date="startAt" type="datetime" required></datetime>
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
            <div class="column is-5-desktop">
              Unity: <b-switch v-model="unity"/>
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
</div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'

export default {
  layout: 'admin',
  data() {
    return {
      title: '',
      startAt: '',
      endAt: '',
      location: '',
      description: '',
      unity: false
    }
  },
  methods: {
    async addActivity() {
      const loading = this.$loading.open()
      const token = this.$store.state.admin.token
      const payload = {
        title: this.title,
        startAt: this.startAt,
        endAt: this.endAt,
        location: this.location,
        description: this.description,
        unity: this.unity,
        admin: this.$store.state.admin.id
      }

      const { data } = await axios.put(
        `/api/admin/activity/add`,
        qs.stringify(payload),
        { headers: { token } }
      )

      if (data.success && data.id) {
        loading.close()
        this.$router.push(`history/${data.id}`)
      }
    }
  }
}
</script>
<style scoped>
.content {
  margin: 0vh 1vw 2vh 1vw;
}

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

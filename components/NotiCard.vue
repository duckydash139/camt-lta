<template>
  <div>
    <div class="card extend-card">
      <div class="header-text is-size-4 has-text-weight-bold">Your Notifications</div>
      <NotiItem v-for="notification in notifications.docs" :key="notification.key" :detail="notification"/>
    </div>
    <b-pagination v-if="notifications.pages !== 1" @change="val => page(val)" :total="notifications.total" :current.sync="current" order="is-centered" :per-page="notifications.limit"/>
  </div>
</template>
<script>
import axios from 'axios'
import NotiItem from '~/components/Notify/Item'

export default {
  data () {
    return {
      notifications: '',
      current: 1
    }
  },
  components: {
    NotiItem
  },
  methods: {
    async getData () {
      let token = this.$store.state.user.token
      const { data } = await axios.get('/api/users/562110139/notification?limit=10', { headers: { token }})
      this.notifications = data
    },
    async page (nextPage) {
      const loading = this.$loading.open()
      let token = this.$store.state.user.token
      const { data } = await axios.get(`/api/users/562110139/notification?page=${nextPage}&limit=10`, { headers: { token }})
      this.notifications = data
      loading.close()
    }
  },
  mounted () {
    this.getData ()
  }
}
</script>
<style scoped>
.check {
  border: solid 1px red;
}
.extend-card {
  border-radius: 2px;
  margin-bottom: 3vh;
  padding: 1vw 2vw 1vw 2vw;
}
.header-text {
  border-bottom: solid 1px #eee;
  padding-bottom: 0.5vh;
}
@media (max-width: 768px) {
  .has-left-border {
    border-top: solid 1px #eee;
    border-left: none;
  }
  .extend-card {
    margin-left: 0.1vw;
    padding: 3vw;
  }
  .responsive-text {
    font-size: 3vw;
  }
  .petit {
    font-size: 0.7rem;
  }
  .full-width-mobile {
    width: 100%;
    margin-bottom: 1vh;
  }
}
</style>

<template>
  <div class="noti">
    <div class="noti-header is-unselectable has-text-weight-bold">
      <div class="columns">
        <div class="column is-6">Notifications</div>
        <!-- <div class="column is-6 has-text-right has-text-weight-normal">
          <span class="petit"><a @click="markAs">Mark All as {{ markAll === true ? 'Read' : 'Unread'}}</a></span>
        </div> -->
      </div>
    </div>
    <div class="noti-content">
      <Item v-for="notification in notifications" :key="notification.key" :detail="notification"/>
    </div>
    <router-link to="/notification" class="noti-footer has-text-centered">
      <span>See All</span>
    </router-link>
  </div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'
import Item from './Item'

export default {
  props: ['badge'],
  data () {
    return {
      notifications: '',
      markAll: true
    }
  },
  components: {
    Item
  },
  methods: {
    async getData () {
      let token = this.$store.state.user.token
      let user = this.$store.state.user.user
      const { data } = await axios.get(`/api/users/${user.studentId}/notification`, {headers: { token }})
      this.notifications = data.docs
    },
    async markAs () {
      let token = this.$store.state.user.token
      let user = this.$store.state.user.user
      const { data } = await axios.put(`/api/users/${user.studentId}/notification`, qs.stringify({
        is_read: this.markAll
      }), {headers: { token }})
      this.markAll = !this.markAll
      this.notifications = data.docs
    }
  },
  mounted () {
    this.getData ()
  }
}
</script>
<style scoped>
.noti {
  display: flex;
  flex-direction: column;
  width: 325px;
  height: 80vh;
  padding: 0 0.5vw 0 0.5vw;
}
.noti-header {
  border-bottom: solid 1px #eee;
  padding-bottom: 1vh;
}
.noti-content {
  flex: 1;
}
.noti-footer {
  bottom: 0;
  border-top: solid 1px #eee;
  padding-top: 0.5vh;
}
.noti-footer:hover {
  text-decoration: underline;
}
.petit {
  font-size: 0.7rem;
}
</style>

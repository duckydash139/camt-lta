<template>
  <div id="">
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">
          ADMIN's ACCOUNT LIST
          <router-link class="button is-info is-pulled-right" to="/admin/account/add">Add</router-link>
        </h3>
      </div>
    </div>
    <div class="columns content">
      <div class="column">
        <table class="table">
          <thead>
            <tr>
              <th class="has-text-centered">Username</th>
              <th class="has-text-centered">Active</th>
              <th class="has-text-centered">Level</th>
              <th class="has-text-centered"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in list" :key="user.key">
              <td class="has-text-centered">{{ user.username }}</td>
              <td class="has-text-centered">{{ user.is_active }}</td>
              <td class="has-text-centered"><span v-if="user.is_admin">Owner</span><span v-else>User</span></td>
              <td class="">
                [<a @click="changeStatus(user.username)"><span v-if="user.is_active">Deactivate</span><span v-else>Activate</span></a>]
                [<a @click="changePermission(user.username)">Change to <span v-if="user.is_admin">User</span><span v-else>Owner</span></a>]
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'
export default {
  layout: 'admin',
  data () {
    return {
      list: []
    }
  },
  methods: {
    async fetchUserList () {
      let token = this.$store.state.admin.token
      const { data } = await axios.get(`/api/admin/account/list`, {headers: {token}})
      this.list = data.data
    },
    async changePermission (username) {
      let token = this.$store.state.admin.token
      const { data } = await axios.post(`/api/admin/account/permission`, qs.stringify({
        username
      }), {headers: {token}})
      for (let user of this.list) {
        if (user.username === data.username) {
          user.is_admin = !user.is_admin
        }
      }
    },
    async changeStatus (username) {
      let token = this.$store.state.admin.token
      const { data } = await axios.post(`/api/admin/account/status`, qs.stringify({
        username
      }), {headers: {token}})

      for (let user of this.list) {
        if (user.username === data.username) {
          user.is_active = !user.is_active
        }
      }
    }
  },
  created () {
    this.fetchUserList()
  }
}
</script>
<style scoped>
.content {
  margin: 0 1vw 0 1vw;
}
</style>

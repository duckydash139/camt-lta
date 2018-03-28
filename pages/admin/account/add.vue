<template>
  <div id="">
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">
          CREATE NEW ACCOUNT
        </h3>
      </div>
    </div>
    <div class="columns content">
      <div class="column card">
        <form @submit.prevent="addUser">
          <div class="card-content">
            <div class="columns">
              <div class="column">
                <input v-model="username" type="text" class="input" placeholder="username" required>
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <input v-model="password" type="password" class="input" placeholder="password" required>
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <button class="button is-info is-pulled-right">Sign up</button>
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
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async addUser () {
      const loading = this.$loading.open()
      try {
        let token = this.$store.state.admin.token

        const { data } = await axios.post(`/api/admin/account/signup`, qs.stringify({
          username: this.username,
          password: this.password
        }), {headers: {token}})

        if (data.success === true) {
          loading.close()
          this.$router.push(`/admin/account`)
        }
      } catch (e) {
        loading.close()
        this.$toast.open('Oops! something went wrong, please try again')
      }
    }
  }
}
</script>
<style scoped>
.content {
  margin: 0 1vw 0 1vw;
}
</style>

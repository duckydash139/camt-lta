<template>
<div>
  <div class="columns">
    <div class="column is-offset-3 is-6 check is-in-middle">
      <div class="card extend-card full-width">
        <div class="columns">
          <div class="column is-offset-1 is-10">
            <form @submit.prevent="login">
              <p class="is-size-3 has-text-centered has-text-weight-semibold">Login</p><br>
              <input v-model="username" type="text" class="input" placeholder="Username" required><br><br>
              <input v-model="password" type="password" class="input" placeholder="Password" required><br><br>
              <button class="button full-width is-info" type="submit">Submit</button><br><br>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'

export default {
  layout: 'oauth',
  data () {
    return {
      username: null,
      password: null
    }
  },
  methods: {
    async login () {
      const loading = this.$loading.open()
      try {
        let { data } = await axios.post(`/api/admin/account/signin`, qs.stringify({
          username: this.username,
          password: this.password
        }))
        const { success, token } = data

        if (success === true && token) {
          loading.close()
          // set localstorage
          this.$store.dispatch('admin/signin', token)
          this.$router.push('/admin')
        }
      } catch (e) {
        loading.close()
        this.$toast.open(e.response.data.message)
      }
    }
  }
}
</script>
<style scoped>
/*input {
  border-radius: 10px;
}*/

.extend-card {
  border-radius: 2px;
  margin-bottom: 2vh;
  padding: 1vw
}

.check {
  display: flex;
  /*border: solid 1px red;*/
  height: 85vh;
}

.is-in-middle {
  align-items: center;
}

.full-width {
  flex-grow: 1;
  width: 100%;
}

@media (max-width: 768px) {
  .extend-card {
    padding: 2vw;
    margin: 0vw 2vw 0vw 2vw;
  }
}
</style>

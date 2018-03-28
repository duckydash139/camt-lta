<template>
<div id="">
  redirecting..
</div>
</template>
<script>
import axios from 'axios'

export default {
  layout: 'oauth',
  data () {
    return {
      res: 'loading..',
      code: this.$route.query.code
    }
  },
  methods: {
    async getToken () {
      let { data } = await axios.get(`/api/oauth?code=${this.code}`)
      return data
    }
  },
  mounted () {
    this.getToken().then((data) => {
      const {success, token} = data

      if (success === true && token) {
        // set localstorage
        this.$store.dispatch('user/signin', token)
        this.$router.push('/')
      }
    })
  }
}
</script>
<style>

</style>

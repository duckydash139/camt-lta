<template>
  <div class="tabbar">
    <TabItem title="Home" to="/" :active="true">
      <b-icon pack="fa" icon="home"></b-icon>
    </TabItem>
    <TabItem v-if="signedIn" title="Notification" to="/notification" :active="true">
      <b-icon pack="fa" icon="bell"></b-icon>
    </TabItem>
    <a v-if="signedIn" @click="signout" class="item is-unselectable">
      <b-icon pack="fa" icon="sign-out"></b-icon>
      <br>
      Logout
    </a>
    <a v-else :href="signInUrl" class="item is-unselectable">
      <b-icon pack="fa" icon="sign-in"></b-icon>
      <br>
      Login
    </a>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import TabItem from '~/components/TabItem.vue'

export default {
  data () {
    return {
      signInUrl: `https://oauth.cmu.ac.th/v1/Authorize.aspx?response_type=code&client_id=${process.env.CMU_CLIENT_ID}&redirect_uri=${process.env.CMU_REDIRECT_URI}&scope=basic`
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  },
  components: {
    TabItem
  },
  methods: {
    signout () {
      this.$store.dispatch('user/signout')
    }
  }
}
</script>
<style>
.tabbar {
  display: none;
}

.item {
  padding-top: 1.5vh;
  height: 100%;
  /*border: solid 1px red;*/
  flex-grow: 1;
  /*align-self: flex-end;*/
  text-align: center;
  font-size: 2vw;
  color: #363636;
}

@media (max-width: 768px) {
  .tabbar {
    bottom: 0;
    position: fixed;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    justify-content: center;
    height: 8vh;
    width: 100vw;
    background-color: white;
    border-top: solid 1px hsl(0, 0%, 88%);
  }
}
</style>

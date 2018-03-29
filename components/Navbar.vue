<template>
<div>
  <nav class="navbar custom-navbar" :class="{ 'is-transparent': !isActive }">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">
        <img src="~assets/logo.svg" width="50">
      </router-link>
      <div class="navbar-item">
        <Search></Search>
      </div>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': isActive }">
      <div class="navbar-end">
        <router-link to="/" class="navbar-item">
          <span>Activities</span>
        </router-link>
        <router-link v-if="signedIn" to="/history" class="navbar-item">
          <span>History</span>
        </router-link>
        <b-dropdown v-if="signedIn" position="is-bottom-left">
          <a class="navbar-item is-unselectable" slot="trigger">
            <span class="">Notifications</span>
            <span v-if="activeBadge" class="badge"></span>
          </a>

          <b-dropdown-item custom paddingless>
            <Notify/>
          </b-dropdown-item>
        </b-dropdown>
        <a v-if="signedIn" @click="signout" class="navbar-item">
          <span>Logout</span>
        </a>
        <a v-else :href="signInUrl" class="navbar-item">
          <span>Login</span>
        </a>
      </div>
    </div>
  </nav>
</div>
</template>
<script>
import axios from 'axios'
import Search from '~/components/Search.vue'
import Notify from '~/components/Notify'
import {
  mapGetters
} from 'vuex'

export default {
  name: 'navbar',
  data () {
    return {
      isActive: false,
      signInUrl: `https://oauth.cmu.ac.th/v1/Authorize.aspx?response_type=code&client_id=${process.env.CMU_CLIENT_ID}&redirect_uri=${process.env.CMU_REDIRECT_URI}&scope=basic`,
      activeBadge: false
    }
  },
  methods: {
    async getData () {
      let token = this.$store.state.user.token
      let user = this.$store.state.user.user
      const { data } = await axios.get(`/api/users/${user.studentId}/notification`, {headers: { token }})
      data.docs.map(item => {
        if (!item.is_read) {
          this.activeBadge = true
        }
      })
    },
    toggleMenu () {
      this.isActive = !this.isActive
    },
    signout () {
      this.$store.dispatch('user/signout')
    },
  },
  components: {
    Search,
    Notify
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  },
  watch: {
    signedIn (value) {
      if (value) {
        this.getData()
      }
    }
  }
}
</script>

<style scoped>
.check {
  border: solid 1px red;
}

.noti {
  display: flex;
  flex-direction: column;
  width: 325px;
  height: 80vh;
  padding: 0 0.5vw 0 0.5vw;
}

.custom-navbar {
  /*border: solid 1px blue;*/
  padding-top: 2vh;
  padding-left: 10vh;
  padding-right: 10vh;
  padding-bottom: 0.5vh;
  border-bottom: solid 1px hsl(0, 0%, 88%);
}

.custom-navbar a:hover {
  background: none;
}

.badge {
  position: absolute;
  border-radius: 50%;
  top: 7px;
  right: 11px;
  background-color: hsl(348, 100%, 61%);
  padding: 5px;
  color: white;
}

.petit {
  font-size: 0.7rem;
}



/* mobile */

@media (max-width: 768px) {
  .custom-navbar {
    margin: 0;
    padding: 0;
  }
}


/* tablet */

@media (min-width: 769px) {}


/* desktop */

@media (min-width: 1008px) {}


/* widescreen */

@media (min-width: 1200px) {}


/* fullhd */

@media (min-width: 1392px) {}
</style>

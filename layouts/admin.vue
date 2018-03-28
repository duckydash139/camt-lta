<template>
  <div v-if="signedIn" class="columns main">
    <div class="column is-3 left-panel">
      <div class="columns">
        <div class="column has-text-centered">
          <router-link to="/admin">
          <img src="~assets/logo.svg" alt="" width="100" height="100">
          </router-link>
        </div>
      </div>
      <div class="columns is-unselectable left-menu-item" :class="{ 'is-active': menu.first.isActive }" @click="toggle(menu.first)">
        <div class="column is-4 has-text-right">
          <b-icon pack="fa" icon="binoculars"></b-icon>
        </div>
        <div class="column has-text-left is-size-5 has-text-centered">
          Activities
        </div>
      </div>
      <div class="columns is-unselectable left-menu-item" :class="{ 'is-active': menu.second.isActive }" @click="toggle(menu.second)">
        <div class="column is-4 has-text-right">
          <b-icon pack="fa" icon="file"></b-icon>
        </div>
        <div class="column has-text-left is-size-5 has-text-centered">
          955100
        </div>
      </div>
      <div class="columns is-unselectable left-menu-item" :class="{ 'is-active': menu.third.isActive }" @click="toggle(menu.third)">
        <div class="column is-4 has-text-right">
          <b-icon pack="fa" icon="file"></b-icon>
        </div>
        <div class="column has-text-left is-size-5 has-text-centered">
          955101
        </div>
      </div>
      <div class="columns is-unselectable left-menu-item" :class="{ 'is-active': menu.fourth.isActive }" @click="toggle(menu.fourth)">
        <div class="column is-4 has-text-right">
          <b-icon pack="fa" icon="address-book"></b-icon>
        </div>
        <div class="column has-text-left is-size-5 has-text-centered">
          Students
        </div>
      </div>
      <div v-if="this.$store.state.admin.isAdmin" class="columns is-unselectable left-menu-item" :class="{ 'is-active': menu.fifth.isActive }" @click="toggle(menu.fifth)">
        <div class="column is-4 has-text-right">
          <b-icon pack="fa" icon="users"></b-icon>
        </div>
        <div class="column has-text-left is-size-5 has-text-centered">
          Account
        </div>
      </div>
    </div>
    <div class="column is-9 right-panel">
      <div class="columns top-bar">
        <div class="column is-7">
        </div>
        <div class="column is-5 right-conner">
          logged in as&nbsp;<b>{{this.$store.state.admin.username}}</b>
          <router-link to="/admin/activities" class="right-conner-item has-text-weight-bold">
            <b-icon pack="fa" icon="home"></b-icon>
          </router-link>
          <a @click="signout" class="right-conner-item has-text-weight-bold">
            <b-icon pack="fa" icon="sign-out"></b-icon>
          </a>
        </div>
      </div>
      <div class="columns">
        <div class="column view">
          <nuxt/>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      menu: {
        first: {
          isActive: false,
          to: '/admin/activities'
        },
        second: {
          isActive: false,
          to: '/admin/courses/955100'
        },
        third: {
          isActive: false,
          to: '/admin/courses/955101'
        },
        fourth: {
          isActive: false,
          to: '/admin/students'
        },
        fifth: {
          isActive: false,
          to: '/admin/account'
        }
      }
    }
  },
  methods: {
    toggle (position) {
      for (let item of Object.values(this.menu)) {
        item.isActive = false
      }
      position.isActive = !position.isActive
      this.$router.push(position.to)
    },
    signout () {
      this.$store.dispatch('admin/signout')
      this.$router.push('/admin/login')
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'admin/user'
    })
  },
  mounted () {
    this.$store.dispatch('admin/tryToSignin')
    if (!this.signedIn) {
      this.$router.push('/admin/login')
    }
  }
}
</script>
<style scoped>
.main {
  /*display: flex;*/
}
.left-panel, .right-panel {
  height: 100vh;
}
.left-panel {
  background-color: hsl(240, 19%, 98%);
  border-right: solid 1px hsl(0, 0%, 86%);
  flex-grow: 1;
}
.right-panel {
}

.left-menu-item {
  padding-bottom: -2vh;
}

.view {
  height: 90vh;
  overflow: auto;
  padding: 0;
  margin: 0;
}

.is-active {
  background-color: white;
}

.sub-item {
  text-indent: 20px;
}

.main {
  margin: 0;
  padding: 0;
}

.check {
  border: solid 1px red;
}

.right-conner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /*text-align: right;*/
}

.right-conner-item {
  padding: 0 10px 0 10px;
  color: hsl(0, 0%, 21%);
  position: relative;
}

.top-bar {
  height: 10vh;
}

.badge {
  position: absolute;
  top: -1px;
  right: 11px;
  background-color: hsl(348, 100%, 61%);
  padding: 2px;
  border: solid 3px hsl(348, 100%, 61%);
  border-radius: 100%;
  color: white;
}
</style>

<template>
  <div class="card extend-card">
    <div class="columns is-mobile">
      <div class="column is-10-desktop is-9-mobile is-size-3 word-wrap">
        <router-link :to="eventRoute" class="has-text-black">
        {{ detail.title }}
        </router-link>
      </div>
      <div v-if="detail.unity" class="column is-2-desktop word-wrap has-text-centered">
        <span class="tag is-light is-medium has-text-info">Unity</span>
      </div>
    </div>
    <div class="petit">
      <div class="columns is-mobile">
        <div class="column">
          <p class="has-text-grey">Date</p>
          <p class="normal-text">{{ eventDate }}</p>
        </div>
        <div class="column">
          <p class="has-text-grey">Time</p>
          <p class="normal-text">{{ eventTime }}</p>
        </div>
        <div class="column">
          <p class="has-text-grey">Location</p>
          <p class="normal-text">{{ detail.location }}</p>
        </div>
      </div>
    </div>
    <div class="columns is-mobile">
      <div class="column">
        <p class="petit has-text-grey">Description</p>
        <p class="normal-text full-width-mobile">{{ detail.description }}</p>
      </div>
    </div>
    <div class="columns is-mobile">
      <div v-if="signedIn" class="column is-offset-7-desktop is-5-desktop text-right">
        <button @click="pin" class="button is-default full-width-mobile">{{ interestedButton }}</button>
        <button @click="enroll" class="button is-info full-width-mobile">Earn points</button>
      </div>
    </div>

  </div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  props: {
    detail: {
      required: true
    }
  },
  data () {
    return {
      interestedButton: 'Interested'
    }
  },
  methods: {
    enroll () {
      this.$router.push(`${this.eventRoute}/form`)
    },
    async pin () {
      const text1 = 'Interested'
      const text2 = 'Not interested'
      const token = this.token
      const payload = {
        student_id: this.signedIn.studentId
      }
      let { data } = await axios.post(`/api/event/${this.detail._id}/interest`, payload, {headers: {token}})
      const { success } = data
      if (success === true) {
        this.interestedButton = text1
      } else {
        this.interestedButton = text2
      }
    },
    async fetchState () {
      const text1 = 'Interested'
      const text2 = 'Not interested'
      const token = this.token
      const payload = {
        student_id: this.signedIn.studentId
      }
      let { data } = await axios.post(`/api/event/${this.detail._id}/check`, payload, {headers: {token}})
      const { success } = data
      if (success === false) {
        this.interestedButton = text1
      } else {
        this.interestedButton = text2
      }
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      token: 'user/token'
    }),
    eventDate () {
      const date = new Date(this.detail.date)
      return moment(date).format('DD MMM YY')
    },
    eventTime () {
      const date = new Date(this.detail.date)
      return moment(date).format('LT')
    },
    eventRoute () {
      return `/event/${this.detail._id}`
    }
  },
  mounted () {
    if (this.signedIn) {
      this.fetchState()
    }
  },
  watch: {
    signedIn (value) {
      if (value) {
        this.fetchState()
      }
    }
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

.word-wrap {
  word-wrap: break-word;
}

.normal-text {
  font-size: initial;
}

.petit {
  font-size: 0.7rem;
}

.text-right {
  text-align: right;
}

.full-width-mobile {
  margin-right: 1vh;
}

@media (max-width: 768px) {
  .extend-card {
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

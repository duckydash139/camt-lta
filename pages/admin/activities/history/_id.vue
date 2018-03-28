<template>
  <div class="columns padding-content">
    <div class="column">
      <br>
      <div class="card extend-card">
        <div class="columns is-mobile">
          <div class="column is-10-desktop is-9-mobile is-size-3 word-wrap">
            {{ event.title }}
          </div>
          <div v-if="event.unity" class="column is-2-desktop word-wrap has-text-centered">
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
              <p class="normal-text">{{ event.location }}</p>
            </div>
          </div>
        </div>
        <div class="columns is-mobile">
          <div class="column">
            <p class="petit has-text-grey">Description</p>
            <p class="normal-text full-width-mobile">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'

import ActivityCard from '~/components/ActivityCard.vue'

export default {
  layout: 'admin',
  components: {
    ActivityCard
  },
  data () {
    return {
      event: ''
    }
  },
  methods: {
    async initData () {
      const activityId = this.$route.params.id

      let { data } = await axios.get(`/api/event/${activityId}`)

      this.event = data
    }
  },
  computed: {
    eventDate () {
      const date = new Date(this.event.date)
      return moment(date).format('DD MMM YY')
    },
    eventTime () {
      const date = new Date(this.event.date)
      return moment(date).format('LT')
    }
  },
  mounted() {
    //do something after mounting vue instance
    this.initData()
  }
}
</script>
<style scoped>
.padding-content {
  padding: 0 1vw 0 1vw;
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

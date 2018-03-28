<template>
  <div>
    <b-collapse class="card extend-card" :open.sync="isOpen">
      <div slot="trigger" class="card-header is-unselectable">
        <p class="card-header-title">
          {{ activities.title }}
        </p>
        <p class="card-header-icon">
          {{ totalPoint }} points
          <b-icon v-if="data.status === 1" class="has-text-success" pack="fa" icon="check-circle"></b-icon>
          <b-icon v-else-if="data.status === 2" class="has-text-danger" pack="fa" icon="times-circle"></b-icon>
          <b-icon v-else class="has-text-info" pack="fa" icon="question-circle"></b-icon>
        </p>
      </div>
      <div class="card-content">
        <div class="content">
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
                <p class="normal-text">{{ activities.location }}</p>
              </div>
            </div>
          </div>
          <div class="columns is-mobile">
            <div class="column">
              <p class="petit has-text-grey">Description</p>
              <p class="normal-text full-width-mobile">{{ activities.description }}</p>
            </div>
          </div>
          <div v-if="!data.status">
            <p class="petit">
              <b-icon class="has-text-info" pack="fa" icon="question"></b-icon>
              In process (requested on {{ requestDate }})
            </p>
          </div>
          <!-- <div v-if="data.status === 1">
            <p class="petit">
              <b-icon class="has-text-success" pack="fa" icon="check"></b-icon>
              Approved on <strong>date</strong>
            </p>
          </div>
          <div v-if="data.status === 2">
            <p class="petit">
              <b-icon class="has-text-danger" pack="fa" icon="times"></b-icon>
              Denied on <strong>date</strong>&nbsp;-&nbsp;
              <strong><i class="has-text-danger">date</i></strong>
            </p>
          </div> -->
        </div>
      </div>
    </b-collapse>
  </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      activities: {
        title: 'loading',
        date: null,
      },
      isOpen: false
    }
  },
  methods: {
    async fetchEventData () {
      const { data } = await axios.get(`/api/event/${this.data.activity_id}`)
      this.activities = data
    }
  },
  computed: {
    eventDate () {
      const date = new Date(this.activities.date)
      return moment(date).format('DD MMM YY')
    },
    eventTime () {
      const date = new Date(this.activities.date)
      return moment(date).format('LT')
    },
    totalPoint () {
      let total = 0
      for (let index = 0; index < this.data.scores.length; index++) {
        total += Number(this.data.scores[index].point)
      }
      return total
    },
    requestDate () {
      return moment(this.data.createdAt).format('DD MMM YY LT')
    }
  },
  mounted () {
    this.fetchEventData()
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
  margin-bottom: 3vh;
  /*padding: 1vw 0vw 1vw 1vw;*/
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

@media (max-width: 768px) {
  .responsive-text {
    font-size: 3vw;
  }
  .petit {
    font-size: 0.7rem;
  }
}
</style>

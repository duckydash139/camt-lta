<template>
<div>
  <div class="card columns extend-card">
    <div class="column is-8">
      <div class="columns is-mobile">
        <div class="column is-11-desktop is-size-3 word-wrap">
          <router-link :to="eventRoute" class="has-text-black">
            {{ eventDetail.title }}
          </router-link>
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
            <p class="normal-text">{{ eventDetail.location }}</p>
          </div>
        </div>
      </div>
      <div class="columns is-mobile">
        <div class="column">
          <p class="petit has-text-grey">Description</p>
          <p class="normal-text full-width-mobile">{{ eventDetail.description }}</p>
        </div>
      </div>
      <div class="columns is-mobile">
        <div class="column">
          <img :src="`/uploads/${detail.picture}`">
        </div>
      </div>
    </div>
    <div class="column is-paddingless has-left-border is-4">
      <div class="padding">
        <div class="is-size-4 word-wrap">
          Scores
        </div>
        <div v-for="(item, index) in detail.scores">
          <div class="columns is-mobile no-padding-bottom">
            <div class="column is-8 no-padding-right has-text-grey">
              <div v-for="(list, index) in dropdown" class="is-small full-width">
                <span class="is-size-7" v-if="list.id == item.id">
                  {{ list.title }}
                </span>
              </div>
            </div>
            <div class="column is-2 custom-padding has-text-grey">
              {{ item.point }}
            </div>
            <div class="column is-1 custom-padding has-text-grey">
              <span class="is-size-7">&nbsp;pts</span>
            </div>
          </div>
        </div>
        <div>
          <br>
          <div class="is-size-7">
            <b>Note:</b> {{ detail.description }}
          </div>
          <br>
          <div v-if="detail.status.approved === true">
            <p class="petit">
              <b-icon class="has-text-success" pack="fa" icon="check"></b-icon>
              Approved at <b>{{ formatDate(detail.updatedAt) }}</b>
            </p>
          </div>
          <div v-else-if="detail.status.approved === false">
            <p class="petit">
              <b-icon class="has-text-danger" pack="fa" icon="times"></b-icon>
              Denied at <b>{{ formatDate(detail.updatedAt) }}</b><br>
              Comment: <i class="has-text-danger">{{ detail.status.comment }}</i>
            </p>
          </div>
          <div v-else>
            <p class="petit">
              <b-icon class="has-text-info" pack="fa" icon="question"></b-icon>
              In process [<a @click="cancelRequest" class="has-text-danger">Cancel this request</a>]<br>
              Requested at <b>{{ formatDate(detail.createdAt) }}</b><br>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import {
  mapGetters
} from 'vuex'
import _ from 'lodash'
import moment from 'moment'
import axios from 'axios'

export default {
  components: {
  },
  props: {
    detail: {
      required: true
    }
  },
  mounted () {
    this.fetchEventDetail()
  },
  data () {
    return {
      dropdown: [],
    eventDetail: {
      status: {
        approved: null
      }
    }
    }
  },
  methods: {
    async fetchEventDetail () {
      let { data } = await axios.get(`/api/event/${this.detail.activity_id}`)
      this.eventDetail = data

      axios.get(`/api/criteria/${this.detail.batch_id}`)
      .then(({ data }) => this.dropdown = data.structure)
    },
    formatDate (date) {
      return moment(date).format('DD MMM YY LT')
    },
    async cancelRequest () {
      let token = this.$store.state.user.token
      this.$dialog.confirm({
        message: 'Do you want to cancel this request?',
        onConfirm: async () => {
          let { data } = await axios.post(`/api/event/${this.detail._id}/cancel`, '', {headers: {token}})
          this.detail.status = data.message
          this.$toast.open('Updated!', 2000)
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      storedScores: 'event/scores'
    }),
    eventDate () {
      const date = new Date(this.eventDetail.date)
      return moment(date).format('DD MMM YY')
    },
    eventTime () {
      const date = new Date(this.eventDetail.date)
      return moment(date).format('LT')
    },
    eventRoute () {
      return `/history/${this.detail._id}`
    }
  }
}
</script>
<style scoped>

.check {
  border: solid 1px red;
}

.custom-padding {
  padding-left: 0;
  padding-right: 0;
}

.has-left-border {
  border-left: solid 1px #eee;
}

.margin-left {
  margin-left: 1vw;
}

.extend-card {
  border-radius: 2px;
  margin-bottom: 5vh;
  padding: 1vw 2vw 1vw 2vw;
}

.padding {
  padding-left: 1vw;
  padding-right: 1vw;
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

.full-width {
  width: 100%;
}

.full-width-mobile {
  margin-right: 1vh;
}

@media (max-width: 768px) {
  .has-left-border {
    border-top: solid 1px #eee;
    border-left: none;
  }
  .extend-card {
    margin-left: 0.1vw;
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

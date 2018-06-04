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
            <div class="column is-8">
              <p class="has-text-grey">Date</p>
              <p class="normal-text">{{ dateFormat(eventDetail.startAt) }} - {{ dateFormat(eventDetail.endAt) }}</p>
            </div>
            <div class="column">
              <p class="has-text-grey">Location</p>
              <p class="normal-text">{{ eventDetail.location }}</p>
            </div>
          </div>
        </div>
        <div v-if="detail.file" class="columns is-mobile">
          <div class="column">
            <span class="is-size-5">
              Participants
            </span>
            <div class="tags">
                <span v-for="attendee of list" :key="attendee.key" class="tag is-unselectable">{{ attendee.student_id }} - {{ attendee.first_name }} {{ attendee.last_name }}</span>
              </div>
            </div>
          </div>
          <div v-if="detail.file" class="columns is-mobile">
            <div class="column is-size-7">
              <b-icon pack="fa" icon="file-pdf-o"></b-icon>
              <a :href="`/pdf/${detail.file}`" class="has-text-info">Report.pdf</a>
            </div>
          </div>
          <div v-if="detail.picture" class="columns is-mobile">
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
            <div v-for="(item, index) in detail.scores" :key="index">
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
              <div v-if="detail.picture" class="is-size-7 mini-space">
                <b>What was your role in the activity event?</b><br> {{ detail.reflections[0] }}
              </div>
              <div v-if="detail.picture" class="is-size-7 mini-space">
                <b>Is there any benefit to community?</b><br> {{ detail.reflections[1] }}
              </div>
              <div v-if="detail.picture" class="is-size-7">
                <b>Is there any benefit to yourself?</b><br> {{ detail.reflections[2] }}
              </div>
              <br>
              <div v-if="detail.status.approved === true">
                <p class="petit">
                  <b-icon class="has-text-success" pack="fa" icon="check"></b-icon>
                  Approved at
                  <b>{{ formatDate(detail.updatedAt) }}</b>
                </p>
              </div>
              <div v-else-if="detail.status.approved === false">
                <p class="petit">
                  <b-icon class="has-text-danger" pack="fa" icon="times"></b-icon>
                  Denied at
                  <b>{{ formatDate(detail.updatedAt) }}</b><br> Comment:
                  <i class="has-text-danger">{{ detail.status.comment }}</i>
                </p>
              </div>
              <div v-else>
                <p class="petit">
                  <b-icon class="has-text-info" pack="fa" icon="question"></b-icon>
                  In process
                  <span v-if="isOwner">[<a @click="cancelRequest" class="has-text-danger">Cancel this request</a>]</span>
                  <br> Requested at
                  <b>{{ formatDate(detail.createdAt) }}</b><br>
                </p>
                <br>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import moment from 'moment'
import axios from 'axios'

export default {
  data () {
    return {
      list: [],
      isOwner: false
    }
  },
  props: {
    detail: {
      required: true
    }
  },
  mounted () {
    this.fetchEventDetail()

    if (this.detail.participants) {
      let list = []
      let storedStudentId = this.$store.state.user.user.studentId
      let studentId = this.detail.student_id

      if (storedStudentId === studentId) {
        this.isOwner = true
      }
      // fetch user detail
      for (const id of this.detail.participants) {
        axios.get(`/api/users/mini/${id}`).then(({ data }) => {
         list.push(data)
        })
      }
      
      this.list = list
    }
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

      axios
        .get(`/api/criteria/${this.detail.batch_id}`)
        .then(({ data }) => (this.dropdown = data.structure))
    },
    dateFormat (date) {
      return moment(date).format('DD/MMM/YY LT')
    },
    formatDate (date) {
      return moment(date).format('DD MMM YY LT')
    },
    async cancelRequest () {
      let token = this.$store.state.user.token
      this.$dialog.confirm({
        message: 'Do you want to cancel this request?',
        onConfirm: async () => {
          let { data } = await axios.post(
            `/api/event/${this.detail._id}/cancel`,
            '',
            { headers: { token } }
          )
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
      return `/history/records/${this.detail._id}`
    }
  }
}
</script>
<style scoped>
.check {
  border: solid 1px red;
}

.mini-space {
  margin-bottom: 5px;
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

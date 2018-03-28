<template>
  <div>
    <div class="columns content">
      <div class="column">
        <h3 class="has-text-weight-bold">
          Request ID: {{ $route.params.request.substring(18,24) }}
          <b-icon v-if="detail.status.approved" class="has-text-success" pack="fa" icon="check"/>
          <b-icon v-else-if="!detail.status.approved" class="has-text-danger" pack="fa" icon="times"/>
        </h3>
        <p>By <router-link :to="link(detail.student_id)">{{ detail.student_id }} - {{ detail.first_name }} {{ detail.last_name }}</router-link></p>
      </div>
    </div>
    <div class="columns content card">
      <!-- <div class="column check"> -->
        <div class="column is-7">
          <div class="columns is-mobile">
            <div class="column is-size-4">
              {{ detail.title }}
            </div>
          </div>
          <div class="petit">
            <div class="columns is-mobile">
              <div class="column">
                <p class="has-text-grey">Date</p>
                <p class="normal-text">{{ eventDate(detail.date) }}</p>
              </div>
              <div class="column">
                <p class="has-text-grey">Time</p>
                <p class="normal-text">{{ eventTime(detail.date) }}</p>
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
            <div class="column">
              <img :src="`/uploads/${detail.picture}`">
            </div>
          </div>
        </div>
        <div class="column is-5 score-detail">
          <div class="columns">
            <div class="column is-size-4">
              Scores
            </div>
          </div>
          <div class="columns" v-for="score in detail.scores" :key="score.key">
            <div class="column">
              <div class="columns" v-for="item in criteria.structure" :key="item.key" v-if="item.id == score.id">
                <div class="column is-8">
                  <small>
                    <b-icon v-if="score.count" class="has-text-success" pack="fa" icon="check"/>
                    <b-icon v-if="!score.count" class="has-text-danger" pack="fa" icon="times"/>
                    &nbsp;{{ item.title }}
                  </small>
                </div>
                <div class="column is-2 has-text-centered">
                  <span>{{ score.point }}</span>
                </div>
                <div class="column is-2 has-text-left">
                  <small>pts</small>
                </div>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <textarea class="textarea" v-model="detail.status.comment" rows="5" disabled></textarea>
            </div>
          </div>
        </div>
      <!-- </div> -->
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import qs from 'querystring'
import moment from 'moment'
export default {
  layout: 'admin',
  data () {
    return {
      detail: {
        status: {
          comment: ''
        }
      },
      criteria: {}
    }
  },
  methods: {
    async initData () {
      const token = this.$store.state.admin.token
      const id = this.$route.params.request

      const { data } = await axios.get(`/api/admin/activity/${id}`, {headers: {token}})
      const check = await axios.get(`/api/admin/activity/${id}/check`, {headers: {token}})
      const criteria = await axios.get(`/api/criteria/${data[0].tracking_id}`)
      this.detail = data[0]
      this.criteria = criteria.data
    },
    isInputable (formula) {
      if (formula === 'depends on admin') {
        return true
      }
      return false
    },
    link (id) {
      return `/admin/students/${id}`
    },
    imgPath (path) {
      return `/uploads/${path}`
    },
    eventDate (date) {
      return moment(date).format('DD MMM YY')
    },
    eventTime (date) {
      return moment(date).format('LT')
    }
  },
  mounted() {
    this.initData()
  }
}
</script>
<style scoped>
.check {
  border: solid 1px red;
}
.content {
  margin: 1vh 1vw 3vh 1vw;
  /*border: solid 1px red;*/
}
.padding-content {
  padding: 0 1vw 0 1vw;
}

.petit {
  font-size: 0.7rem;
}

.full-width {
  width: 100%;
}

input[type=number] {
  width: auto;
}

.score-detail {
  border-left: solid 2px hsl(0, 0%, 90%);
}

@media (max-width: 768px) {
  .petit {
    font-size: 0.7rem;
  }
}
</style>

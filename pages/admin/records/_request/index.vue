<template>
<div>
  <div class="columns content">
    <div class="column">
      <h3 class="has-text-weight-bold">
          Request ID: {{ $route.params.request.substring(18,24) }}
        </h3>
      <p>By
        <router-link :to="link(detail.student_id)">{{ detail.student_id }} - {{ detail.first_name }} {{ detail.last_name }}</router-link>
      </p>
    </div>
  </div>
  <div class="columns content card">
    <div class="column is-7">
      <div class="columns is-mobile">
        <div class="column is-size-4">
          {{ detail.title }}
        </div>
      </div>
      <div class="columns is-mobile">
        <div class="column is-8">
          <p class="has-text-grey">Date</p>
          <p class="is-size-7">{{ dateFormat(detail.startAt) }} - {{ dateFormat(detail.endAt) }}</p>
        </div>
        <div class="column">
          <p class="has-text-grey">Location</p>
          <p class="is-size-7">{{ detail.location }}</p>
        </div>
      </div>
      <div v-if="detail.picture" class="columns is-mobile">
        <div class="column">
          <p>
            <b>What was your role in the activity event?</b><br> {{ detail.reflections[0] }}
          </p>
          <p>
            <b>Is there any benefit to community?</b><br> {{ detail.reflections[1] }}
          </p>
          <p>
            <b>Is there any benefit to yourself?</b><br> {{ detail.reflections[2] }}
          </p>
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
          <a :href="`/pdf/${detail.file}`" class="has-text-info">Report.pdf</a><br><br>
        </div>
      </div>
      <div v-if="detail.picture" class="columns is-mobile">
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
              <b-checkbox v-model="form.selected" :native-value="score.id">
                <small>{{ item.title }}</small>
              </b-checkbox>
            </div>
            <div class="column is-2 has-text-centered">
              <input v-if="isInputable(item.formula)" @input="scoreInput(item.id, $event.target.value)" class="input is-small" type="number" min="0" value="0">
              <span v-if="!isInputable(item.formula)">{{ score.point }}</span>
            </div>
            <div class="column is-2 has-text-left">
              <small>pts</small>
            </div>
          </div>
        </div>
      </div>
      <div v-if="check.length > 0" class="columns">
        <div class="column">
          <span class="is-size-5">Approved</span>
          <div v-for="score in check" :key="score.key" class="columns has-text-danger">
            <div v-if="item.id == score.id" v-for="item in criteria.structure" :key="item.key" class="column">
              <div class="columns">
                <div class="column is-8"><small>{{ item.title }}</small></div>
                <div class="column is-2">{{ score.point }}</div>
                <div class="column is-2"><small>pts</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <textarea class="textarea" v-model="form.comment" placeholder="remark" rows="5"></textarea>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <button class="button is-info full-width" @click="submitData">Process</button>
        </div>
      </div>
    </div>
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
      form: {
        selected: [],
        comment: ''
      },
      detail: {
        reflections: []
      },
      list: [],
      criteria: {},
      check: {}
    }
  },
  methods: {
    async initData () {
      const token = this.$store.state.admin.token
      const id = this.$route.params.request

      const { data } = await axios.get(`/api/admin/activity/${id}`, {headers: { token }})
      const check = await axios.get(`/api/admin/activity/${id}/check`, {headers: { token }})
      const criteria = await axios.get(`/api/criteria/${data[0].tracking_id}`)
      this.detail = data[ 0 ]
      this.criteria = criteria.data
      this.check = check.data.message || 0

      if (this.detail.participants) {
        let list = []

        // fetch user detail
        for (const id of this.detail.participants) {
          axios.get(`/api/users/mini/${id}`).then(({
            data
          }) => {
            list.push(data)
          })
        }

        this.list = list
      }

      if (this.detail.status.approved !== null) {
        this.$router.push(`/admin/records/${id}/view`)
      }
    },
    submitData () {
      let buffer = []
      let payload = {
        approved: false,
        approvedWithCondition: this.form.selected.length === this.detail.scores.length ? false : true,
        approvedBy: this.$store.state.admin.username,
        comment: this.form.comment
      }
      const token = this.$store.state.admin.token
      const id = this.$route.params.request

      if (this.form.selected.length !== 0) {
        this.$dialog.confirm({
          message: 'Do you want to process this request?',
          onConfirm: async () => {
            for (let item of this.detail.scores) {
              let matched = false
              for (let score of this.form.selected) {
                if (item.id === score) {
                  matched = true
                }
              }

              if (matched) {
                buffer.push({ ...item,
                  count: true
                })
              } else {
                buffer.push({ ...item,
                  count: false
                })
              }
            }

            payload.scores = buffer
            payload.approved = true

            const { data } = await axios.post(`/api/admin/activity/${id}`, payload, {
              headers: { token }
            })

            if (data.success) {
              this.$router.push('/admin/records')
            }
          }
        })
      } else {
        this.$dialog.confirm({
          message: 'Do you want to <b class="has-text-danger">reject</b> this request?',
          onConfirm: async () => {
            payload.scores = buffer

            const { data } = await axios.post(`/api/admin/activity/${id}`, payload, {
              headers: { token }
            })

            if (data.success) {
              this.$router.push('/admin/records')
            }
          }
        })
      }
    },
    isInputable (formula) {
      if (formula === 'depends on admin') {
        return true
      }
      return false
    },
    scoreInput (id, value) {
      for (let item of this.detail.scores) {
        if (parseInt(item.id) === parseInt(id)) {
          item.point = parseInt(value)
        }
      }
    },
    link (id) {
      return `/admin/students/${id}`
    },
    dateFormat (date) {
      return moment(date).format('DD/MMM/YY LT')
    },
    formatDate (date) {
      return moment(date).format('DD MMM YY LT')
    }
  },
  mounted () {
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

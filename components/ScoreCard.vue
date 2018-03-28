<template>
<div v-if="signedIn" class="card extend-card">
  <div class="has-text-centered">
    <p class="has-text-weight-bold">
      Your score
    </p>
    <div class="is-size-2">
      <p>{{ total }}<i class="small-text has-text-grey-light">/</i></p>
      <p class="has-text-grey-light">100</p>
    </div>
    <div class="is-size-7 has-text-left">
      <div class="score-bar has-text-weight-bold">
        <div v-for="structure in criteria.structure" :key="structure.key" class="score-bar has-text-weight-bold">
          {{ structure.title }}
          <div class="is-pulled-right">{{ fetchScore(structure.id) }}<span v-if="structure.max"> / {{ structure.max }}</span></div>
          <ProgressBar :now="fetchScore(structure.id)" :max="structure.max" :color="structure.color"></ProgressBar>
        </div>
      </div>
      <br> You're tracking score in <i class="has-text-info">{{ signedIn.tracking }} - LEARNING THROUGH ACTIVITIES {{ courseTitle }}</i>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import ProgressBar from '~/components/ProgressBar.vue'

export default {
  props: ['score'],
  components: {
    ProgressBar
  },
  data () {
    return {
      criteria: {
        structure: []
      },
      currentScore: []
    }
  },
  methods: {
    async initData () {
      let studentId = null
      let token = null
      let course = null

      if(!this.$store.state.user.user) {
        setTimeout(() => {
          token = this.$store.state.user.token
          studentId = this.$store.state.user.user.studentId
          course = this.$store.state.user.user.trackingId

          // fetch criteria
          axios.get(`/api/criteria/${course}`)
          .then(({ data }) => this.criteria = data)

          // fetch student's score
          axios.get(`/api/users/${studentId}/${course}/score`, {headers: {token}})
          .then(({ data }) => this.currentScore = data)
        }, 500)
      } else {
        token = this.$store.state.user.token
        studentId = this.$store.state.user.user.studentId
        course = this.$store.state.user.user.trackingId

        // fetch criteria
        axios.get(`/api/criteria/${course}`)
        .then(({ data }) => this.criteria = data)

        // fetch student's score
        axios.get(`/api/users/${studentId}/${course}/score`, {headers: {token}})
        .then(({ data }) => this.currentScore = data)
      }
    },
    fetchScore (index) {
      let result = 0
      this.currentScore.filter(score => {
        if (score.id == index) {
          result = score.point
        }
      })
      return result
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    }),
    courseTitle () {
      const course = this.signedIn.tracking
      if (course === 955101) {
        return 2
      } else {
        return 1
      }
    },
    total () {
      let points = 0
      this.currentScore.map(score => {
        points += score.point
      })

      return points
    }
  },
  mounted () {
    this.initData()
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
  margin-bottom: 2vh;
  padding: 1vw
}

.small-text {
  font-size: 1rem;
}

.score-bar {
  margin: 1vh 0 1vh 0;
}

@media (max-width: 768px) {
  .extend-card {
    padding: 1vw 2vw 1vw 2vw;
  }
}
</style>

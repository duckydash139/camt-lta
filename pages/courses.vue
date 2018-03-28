<template>
  <div>
    <div class="columns grid">
      <div class="column is-offset-1 is-10">
        <div v-for="course in course" :key="course.key">
          <CourseCard :detail="course"></CourseCard>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import ContentGrid from '~/components/ContentGrid.vue'
import ScoreCard from '~/components/ScoreCard.vue'
import CourseCard from '~/components/CourseCard.vue'

export default {
  data () {
    return {
      course: []
    }
  },
  components: {
    ContentGrid,
    ScoreCard,
    CourseCard
  },
  methods: {
    async initData () {
      let index = []
      const courses = [
        {
          code: 955100,
          title: 'LEARNING THROUGH ACTIVITIES 1',
          condition: 'none',
          img: 'https://www.tremblant.ca/-/media/tremblant/things-to-do/activities/activity-climbing-tour-escalade-m.ashx?h=432&w=768&hash=436046795AD01631924870F3BC3A7E8D3C19DFD5'
        },
        {
          code: 955101,
          title: 'LEARNING THROUGH ACTIVITIES 2',
          condition: 'none',
          img: 'http://www.skylineenterprises.co.nz/assets/Uploads/_resampled/SetHeight300-skyline-luge-mont-tremblant-fun-activity-YouTube-Channel-Art.jpg'
        }
      ]
      let history = this.signedIn.history
      if (history !== null) {
        history.map(item => {
          index.push(_.findIndex(courses, ['code', item.course_id]))
        })
      }

      const filtered = _.uniq(index)

      filtered.map(idx => courses.splice(idx, 1))

      this.course = courses
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  },
  mounted () {
    if (this.signedIn) {
      this.initData()
    }
  },
  watch: {
    signedIn (value) {
      if (value) {
        this.initData()
      }
    }
  }
}
</script>
<style>
.grid {
  margin-left: 10vh;
  margin-right: 10vh;
}

@media (max-width: 768px) {
  .grid {
    margin: 0;
    padding: 0;
  }
}
</style>

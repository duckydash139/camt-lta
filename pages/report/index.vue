<template>
  <div>
    <ContentGrid>
      <div slot="left">
        <div class="card extend-card">
          <div class="header-text is-size-4 has-text-weight-bold">Report</div><br>
          <div v-if="course1" class="columns">
            <div class="column is-9">
              955100 - LEARNING THROUGH ACTIVITIES 1
            </div>
            <div class="column"><a @click="downloadPdf(955100)">Download</a></div>
          </div>
          <div v-if="course2" class="columns">
            <div class="column is-9">
              955101 - LEARNING THROUGH ACTIVITIES 2
            </div>
            <div class="column"><a @click="downloadPdf(955101)">Download</a></div>
          </div>
        </div>
      </div>
    </ContentGrid>
  </div>
</template>
<script>
import ContentGrid from '~/components/ContentGrid.vue'
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  components: {
    ContentGrid
  },
  data () {
    return {
      course1: false,
      course2: false
    }
  },
  methods: {
    async fetchData () {
      const token = this.$store.state.admin.token
      const { data } = await axios(`api/users/${this.signedIn.studentId}/history/check`, {
        headers: { token }
      })

      data.map(item => {
        if (item.course === 955100) {
          if (item.length > 0) {
            this.course1 = true
          }
        } else if (item.course === 955101) {
          if (item.length > 0) {
            this.course2 = true
          }
        }
      })
    },
    async downloadPdf (courseId) {
      const token = this.$store.state.admin.token

      const { data } = await axios(`api/users/${this.signedIn.studentId}/${courseId}/export`, {
        headers: { token },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${courseId}.pdf`)
      document.body.appendChild(link)
      link.click()
    }
  },
  mounted () {
    if (this.signedIn) {
      this.fetchData()
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  },
  watch: {
    signedIn (value) {
      this.fetchData()
    }
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
  margin-bottom: 3vh;
  padding: 1vw 2vw 1vw 2vw;
}
.header-text {
  border-bottom: solid 1px #eee;
  padding-bottom: 0.5vh;
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

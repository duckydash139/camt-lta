<template>
  <div>
    <div class="card columns extend-card">
      <div class="column is-8">
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
              <p class="normal-text">{{ dateFormat(detail.startAt) }} - {{ dateFormat(detail.endAt) }}</p>
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
      </div>
      <div class="column is-paddingless has-left-border is-4">
        <ScoreEditor v-model="inputList" :dropdown="dropdowns" :unity="detail.unity"></ScoreEditor>
        <br>
        <textarea v-model="reflection1" class="padding margin-left full-width textarea" placeholder="What was your role in the activity event?" rows="2"></textarea><br>
        <textarea v-model="reflection2" class="padding margin-left full-width textarea" placeholder="Is there any benefit to community? If yes, How?" rows="2"></textarea><br>
        <textarea v-model="reflection3" class="padding margin-left full-width textarea" placeholder="Is there any benefit to yourself?" rows="2"></textarea><br>
        <div @click="checkInput" class="padding button is-info margin-left full-width">
          Next
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import ScoreEditor from '~/components/ScoreEditor.vue'

export default {
  components: {
    ScoreEditor
  },
  props: {
    detail: {
      required: true
    }
  },
  data () {
    return {
      dropdowns: [],
      inputList: [],
      reflection1: '',
      reflection2: '',
      reflection3: '',
      addButton: false,
      nextButton: false
    }
  },
  methods: {
    checkInput () {
      if (!_.isEmpty(this.inputList)) {
        let reportRequired = false
        // is it require report?
        for (const score of this.inputList) {
          if (score.report = true) {
            reportRequired = true
          }
        }
        this.$store.commit('event/setScores', this.inputList)
        this.$store.commit('event/setEventId', this.detail._id)
        this.$store.commit('event/setReflections', [
          this.reflection1,
          this.reflection2,
          this.reflection3
        ])
        // redirect to difference form
        if (reportRequired) {
          this.$router.push('submitReport')
        } else {
          this.$router.push('upload')
        }
      } else {
        this.$toast.open('Form is empty!, please click "ADD" to fill the form')
      }
    },
    dateFormat (date) {
      return moment(date).format('DD/MMM/YY LT')
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      storedScores: 'event/scores'
    }),
    eventRoute () {
      return `/event/${this.detail._id}`
    }
  },
  mounted () {
    if (this.signedIn) {
      axios
        .get(`/api/criteria/${this.signedIn.trackingId}`)
        .then(({ data }) => (this.dropdowns = data.structure))
    }
  },
  watch: {
    signedIn (value) {
      if (value.trackingId !== null) {
        axios
          .get(`/api/criteria/${value.trackingId}`)
          .then(({ data }) => (this.dropdowns = data.structure))
      }
    }
  }
}
</script>
<style scoped>
.add-button {
  border: dashed 1px hsl(217, 71%, 53%);
  border-radius: 2px;
}

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
  margin-bottom: 3vh;
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

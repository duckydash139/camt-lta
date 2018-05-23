<template>
<div id="imageEditor">
  <div class="card columns extend-card">
    <div class="column is-8">
      <div class="columns is-mobile">
        <div class="column is-11-desktop is-size-3 word-wrap">
          <router-link :to="eventRoute" class="has-text-black">
            {{ detail.title }}
          </router-link>
        </div>
      </div>
      <div class="column">
        <div class="is-size-4">
            Participants
        </div>
        <input v-model="search" class="input" placeholder="Student ID" type="number">
        <div v-if="result" class="searchResult">
            <ul v-for="item of result" :key="item.key">
                <li v-if="item.placeholder">{{ item.title }}</li>
                <li class="clickable is-unselectable" v-else @click="addPariticipant(item)">{{ item.student_id }} - {{ item.first_name }} {{ item.last_name }}</li>
            </ul>
        </div><br><br>
        <div class="field is-grouped is-grouped-multiline">
            <div v-for="(item, index) of selected" :key="item.key" class="control">
                <div class="tags has-addons">
                    <span class="tag is-unselectable">{{ item.student_id }} - {{ item.first_name }} {{ item.last_name }}</span>
                    <a @click="deleteParticipant(index)" class="tag is-delete"></a>
                </div>
            </div>
        </div>
        <br>
        <b-field class="file">
        <b-upload v-model="files">
            <a class="button is-success">
                <span>Choose a file...</span>
            </a>
        </b-upload>
        <span class="file-name" v-if="files && files.length">
            {{ files[0].name }}
        </span>
        </b-field>
        <div class="has-text-danger is-size-7">
           Ps. The file size limit is 10 MB. And only PDF is supported.
        </div>
      </div>
    </div>
    <div class="column is-paddingless has-left-border is-4">
      <div class="padding">
        <div class="is-size-4 word-wrap">
          Scores
        </div>
        <div v-for="(item, index) in storedScores">
          <div class="columns is-mobile no-padding-bottom">
            <div class="column is-8 no-padding-right has-text-grey">
              <div v-for="(list, index) in dropdown" class="is-small full-width">
                <span class="is-size-7" v-if="list.id === item.id">
                  {{ list.title }}
                </span>
              </div>
            </div>
            <div class="column is-2 custom-padding has-text-grey has-text-centered">
              <span v-if="item.point">{{ item.point }}</span>
              <span v-else>TBD</span>
            </div>
            <div class="column is-1 custom-padding has-text-grey">
              <span class="is-size-7">&nbsp;pts</span>
            </div>
          </div>
        </div>
        <br>
        <div v-for="reflex of storedDes">
          {{ reflex }}
        </div>
        <br>
        <button @click="goBack" class="padding button margin-left full-width">Back</button>
        <button @click="submitData" class="padding button is-info margin-left full-width" :class="{'is-loading': loading}" :disabled="isReady">Earn points</button>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  props: ['detail', 'scores', 'dropdown'],
  data() {
    return {
      search: null,
      result: null,
      selected: [],
      files: [],
      loading: false
    }
  },
  created() {
    this.debouncedGetResult = _.debounce(this.getResult, 500)
  },
  methods: {
    async getResult() {
      if (!this.search) {
        this.result = null
      } else {
        this.result = [
          {
            placeholder: true,
            title: 'Searching...'
          }
        ]
        try {
          const { data } = await axios.get(`/api/users/find/${this.search}`)
          this.result = data
        } catch (error) {
          this.result = [
            {
              placeholder: true,
              title: 'Not found'
            }
          ]
        }
      }
    },
    addPariticipant(item) {
        if (!_.some(this.selected, item)) {
            this.selected.push(item)
            this.search = null
        } else {
            this.search = null
        }
    },
    deleteParticipant(index) {
        this.selected.splice(index, 1)
    },
    submitData() {
      this.loading = true
      let participants = []
      for (const student of this.selected) {
          participants.push(student._id)
      }
      this.$store.dispatch('event/saveReport', {
          participants,
          file: this.files[0]
      })
    },
    goBack() {
      this.$router.go(-1)
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      storedScores: 'event/scores',
      storedDes: 'event/reflections'
    }),
    eventRoute() {
      return `/event/${this.detail._id}`
    },
    isReady() {
        if (this.selected.length > 0 && this.files.length >0) {
            return false
        } else {
            return true
        }
    }
  },
  watch: {
    search(value) {
      if (value) {
        this.result = [
          {
            placeholder: true,
            title: 'searching...'
          }
        ]
        this.debouncedGetResult()
      } else {
        this.result = null
      }
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

.searchResult {
  margin-top: 2px;
  border: solid 1px rgb(163, 163, 163);
  box-shadow: 1px 20px 15px #eee;
}

.clickable {
    cursor: pointer;
}

.word-wrap {
  word-wrap: break-word;
}

.normal-text {
  font-size: initial;
}

.has-left-border {
  border-left: solid 1px #eee;
}

.padding {
  padding-left: 1vw;
  padding-right: 1vw;
}

.petit {
  font-size: 0.7rem;
}

.full-width {
  width: 100%;
}

.full-width-mobile {
  margin-right: 1vh;
}

.custom-padding {
  padding-left: 0;
  padding-right: 0;
}
.no-padding-right {
  padding-right: 0;
}
.no-padding-bottom {
  padding-bottom: 0;
  margin-bottom: 0;
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

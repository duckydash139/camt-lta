<template>
<div class="search-wrapper">
  <!-- <label>{{selectedEvent}}</label> -->
  <vue-instant :suggestion-attribute="suggestionAttribute" v-model="value" :disabled="false" @input="changed1" @click-input="clickInput" @click-button="clickButton" @selected="selected" @enter="enter" @key-up="keyUp" @key-down="keyDown" @key-right="keyRight"
      @clear="clear" @escape="escape" :show-autocomplete="true" :autofocus="false" :suggestions="suggestions" name="customName" placeholder="Search..." :custom-result="suggestions" type="custom"></vue-instant>
</div>
</template>

<script>
import axios from 'axios'
import Fuse from 'fuse.js'
import VueInstant from '~/components/VueInstant.vue'

export default {
  components: {
    VueInstant
  },
  data () {
    return {
      value: '',
      suggestionAttribute: 'title',
      suggestions: [],
      selectedEvent: '',
      options: {
        keys: ['title', 'location', 'description']
      }
    }
  },
  methods: {
    clickInput () {
      this.selectedEvent = 'click input'
    },
    clickButton () {
      this.selectedEvent = 'click button'
    },
    selected () {
      this.selectedEvent = 'selection changed'
    },
    enter () {
      this.selectedEvent = 'enter'
    },
    keyUp () {
      this.selectedEvent = 'keyup pressed'
    },
    keyDown () {
      this.selectedEvent = 'keyDown pressed'
    },
    keyRight () {
      this.selectedEvent = 'keyRight pressed'
    },
    clear () {
      this.selectedEvent = 'clear input'
    },
    escape () {
      this.selectedEvent = 'escape'
    },
    changed () {
      var that = this
      this.suggestions = []
      axios.get('https://api.themoviedb.org/3/search/movie?api_key=342d3061b70d2747a1e159ae9a7e9a36&query=' + this.value)
        .then(function (response) {
          // console.log(response)
          response.data.results.forEach(function (a) {
            that.suggestions.push(a)
            console.log(that.suggestions)
          })
        })
    },
    async changed1 () {
      // let that = this
      this.suggestions = []
      const response = await axios.get(`/api/event?keyword=${this.value}`)
      // console.log(response.data)
      // const res = await this.$search(this.value, response.data, this.options)
      // console.log(res)
      const fuse = new Fuse(response.data, this.options)
      this.suggestions = fuse.search(this.value)
      // response.data.forEach((a) => that.suggestions.push(a))
      // console.log(this.suggestions)
    }
  }
}
</script>
<style>

</style>

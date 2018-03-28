<template>
<div>
  <div class="main">
    <form novalidate="novalidate" onsubmit="return false;" :class="getFormClass">
      <div role="search" :class="getClassWrapper">
        <input type="search" name="search" :placeholder="getPlaceholder" autocomplete="off" required="required" :class="getClassInputPlaceholder" tabindex="-1">
        <input :disabled="disabled" @click="emitClickInput" @keyup='changeText' v-model='textVal' type="search" :name="name" placeholder="" autocomplete="off" required="required" :class="getClassInput" :autofocus="autofocus">
        <button @click="emitClickButton" type="submit" :class="getClassSubmit" tabindex="-1">
            <svg role="img" aria-label="Search">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="getSVGSearch"></use>
            </svg>
          </button>
        <button @click="reset" type="reset" :class="getClassReset" tabindex="-1">
            <svg role="img" aria-label="Reset">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="getSVGClear"></use>
            </svg>
          </button>
        <div v-if="modeIsFull" class='el-input-group__append'>
          <ul v-on-clickaway="away" v-if="suggestionsIsVisible && showSuggestions" class="vue-instant__suggestions">
            <!-- <li @click="selectedAction(index)" v-for="(item, index) in customResult" :class="getClassHighlighted(index)">{{item[suggestionAttribute]}}</li> -->
            <li @click="selectedAction(index)" v-for="(item, index) in similiarData" :class="getClassHighlighted(index)">{{item[suggestionAttribute]}}</li>
          </ul>
        </div>
      </div>
    </form>
  </div>

  <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
      <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-search-8" viewBox="0 0 40 40">
        <path d="M16 32c8.835 0 16-7.165 16-16 0-8.837-7.165-16-16-16C7.162 0 0 7.163 0 16c0 8.835 7.163 16 16 16zm0-5.76c5.654 0 10.24-4.586 10.24-10.24 0-5.656-4.586-10.24-10.24-10.24-5.656 0-10.24 4.584-10.24 10.24 0 5.654 4.584 10.24 10.24 10.24zM28.156 32.8c-1.282-1.282-1.278-3.363.002-4.643 1.282-1.284 3.365-1.28 4.642-.003l6.238 6.238c1.282 1.282 1.278 3.363-.002 4.643-1.283 1.283-3.366 1.28-4.643.002l-6.238-6.238z"
        fill-rule="evenodd" />
      </symbol>
      <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-clear-4" viewBox="0 0 20 20">
        <path d="M11.664 9.877l4.485 4.485-1.542 1.54-4.485-4.485-4.485 4.485-1.54-1.54 4.485-4.485-4.485-4.485 1.54-1.54 4.485 4.484 4.485-4.485 1.54 1.542-4.484 4.485zM10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10z" fill-rule="evenodd"
        />
      </symbol>
    </svg>
</div>
</template>
<script>
import { mixin as clickaway } from 'vue-clickaway'
export default {
  name: 'vueInstant',
  mixins: [clickaway],
  props: {
    'value': {
      type: String,
      required: true
    },
    'suggestions': {
      type: Array
      // required: true
    },
    'suggestionAttribute': {
      type: String,
      required: true
    },
    'placeholder': {
      type: String,
      default: 'write something...'
    },
    'minMatch': {
      type: Number,
      default: 2
    },
    'name': {
      type: String,
      default: 'vueInstant'
    },
    'autofocus': {
      type: Boolean,
      default: true
    },
    'disabled': {
      type: Boolean
    },
    'type': {
      type: String,
      default: 'facebook'
    },
    'showAutocomplete': {
      type: Boolean,
      default: true
    },
    'customResult': {
      type: Array
    },
    'suggestOnAllWords': {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectedEvent: null,
      selectedSuggest: null,
      inputChanged: false,
      suggestionsIsVisible: true,
      highlightedIndex: 0,
      highlightedIndexMax: 7,
      similiarData: [],
      placeholderVal: this.placeholder,
      types: [
        {
          name: 'custom',
          formClass: 'searchbox sbx-custom',
          classWrapper: 'sbx-custom__wrapper',
          classInput: 'sbx-custom__input',
          classInputPlaceholder: 'sbx-custom__input-placeholder',
          classSubmit: 'sbx-custom__submit',
          svgSearch: '#sbx-icon-search-8',
          classReset: 'sbx-custom__reset',
          svgClear: '#sbx-icon-clear-4',
          highlighClass: 'highlighted__custom'
        }
      ]
    }
  },
  watch: {
    placeholder: function (val) {
      if (this.textValIsEmpty()) {
        this.placeholderVal = val
      }
    }
  },
  computed: {
    getPlaceholder () {
      if (this.inputChanged || this.textValIsEmpty()) {
        return this.placeholderVal
      }
    },
    modeIsFull () {
      return this.showAutocomplete
    },
    showSuggestions () {
      return this.customResult.length > 0
      // return this.similiarData.length >= this.minMatch
    },
    getPropertiesClass () {
      var type = this.getType()
      return type.properties
    },
    getFormClass () {
      var type = this.getType()
      return type.formClass
    },
    getClassWrapper () {
      var type = this.getType()
      return type.classWrapper
    },
    getClassInput () {
      var type = this.getType()
      return type.classInput
    },
    getClassInputPlaceholder () {
      var type = this.getType()
      return type.classInputPlaceholder
    },
    getClassSubmit () {
      var type = this.getType()
      return type.classSubmit
    },
    getSVGSearch () {
      var type = this.getType()
      return type.svgSearch
    },
    getClassReset () {
      var type = this.getType()
      return type.classReset
    },
    getSVGClear () {
      var type = this.getType()
      return type.svgClear
    },

    textVal: {
      get () {
        return this.value
      },
      set (v) {
        this.$emit('input', v)
      }
    }
  },
  methods: {
    decrementHighlightedIndex () {
      this.highlightedIndex -= 1
    },
    incrementHighlightedIndex () {
      this.highlightedIndex += 1
    },
    escapeAction () {
      this.clearHighlightedIndex()
      this.clearSimilarData()
      this.clearSelected()
      this.setBlur()
      this.emitEscape()
    },
    arrowRightAction () {
      this.setPlaceholderAndTextVal()
      this.emitKeyRight()
    },
    arrowDownAction () {
      if (this.arrowDownValidation()) {
        this.incrementHighlightedIndex()
        this.setPlaceholderAndTextVal()
        this.emitKeyDown()
      } else {
        this.clearHighlightedIndex()
      }
    },
    arrowUpAction () {
      if (this.highlightedIndex > 0) {
        this.decrementHighlightedIndex()
        this.setPlaceholderAndTextVal()
        this.emitKeyUp()
      } else {
        this.clearHighlightedIndex()
      }
    },
    enterAction () {
      this.setFinalTextValue()
      this.clearHighlightedIndex()
      this.clearSimilarData()
      this.emitEnter()
    },
    selectedAction (index) {
      this.highlightedIndex = index
      this.setFinalTextValue()
      this.clearPlaceholder()
      this.clearSimilarData()
      this.emitSelected()
    },
    addRegister (o) {
      if (this.textValIsNotEmpty()) {
        this.addSuggestion(o)
      }
      // if (this.isSimilar(o) && this.textValIsNotEmpty()) {
      //   this.addSuggestion(o)
      // }
    },
    addSuggestion (o) {
      this.addToSimilarData(o)
      // if (!this.findSuggestionTextIsRepited(o)) {
      //   this.addToSimilarData(o)
      // }
    },
    addToSimilarData (o) {
      if (this.canAddToSimilarData()) {
        this.placeholderVal = this.letterProcess(o)
        this.selectedSuggest = o
        this.emitSelected()
        this.similiarData.unshift(o)
      }
    },
    setTextValue (e) {
      if (e.target.value.trim()) {
        this.textVal = e.target.value
        this.emitChange()
      }
    },
    setSelectedAsTextValue () {
      this.textVal = this.selected
    },
    setInitialTextValue () {
      this.textVal = this.value
    },
    setFinalTextValue () {
      if (this.finalTextValueValidation()) {
        this.setPlaceholderAndTextVal()
        this.emitChange()
      } else {
        this.clearAll()
      }
    },
    setPlaceholderAndTextVal () {
      if (typeof this.similiarData[this.highlightedIndex] !== 'undefined') {
        var suggest = this.similiarData[this.highlightedIndex]
        this.placeholderVal = suggest[this.suggestionAttribute]
        this.textVal = suggest[this.suggestionAttribute]
        this.selectedSuggest = suggest
        this.emitSelected()
      }
    },
    setInitialPlaceholder () {
      this.placeholderVal = this.placeholder
    },
    setBlur () {
      this.$el.blur()
    },
    getType () {
      return this.types.find(this.isSameType)
    },
    getClassHighlighted (index) {
      if (this.highlightedIndex === index) {
        var type = this.getType()
        return type.highlighClass
      }
    },
    letterProcess (o) {
      var remoteText = o[this.suggestionAttribute].split('')
      var inputText = this.textVal.split('')
      inputText.forEach(function (letter, key) {
        if (letter !== remoteText[key]) {
          remoteText[key] = letter
        }
      })
      return remoteText.join('')
    },
    findSuggests () {
      if (this.suggestionsPropIsDefined()) {
        this.suggestions.forEach(this.addRegister)
      }
    },
    arrowDownValidation () {
      return this.highlightedIndex < this.highlightedIndexMax &&
        this.highlightedIndex < (this.similiarData.length - 1)
    },
    lowerFirst (string) {
      return string.charAt(0).toLowerCase() + string.slice(1)
    },
    controlEvents () {
      var uncaptz = this.lowerFirst(this.selectedEvent + 'Action')
      var fnName = (this[uncaptz])
      if (this.fnExists(fnName)) {
        fnName()
      }
    },
    findRepited (similarItem, o) {
      return (similarItem[this.suggestionAttribute] ===
        o[this.suggestionAttribute])
    },
    findSuggestionTextIsRepited (o) {
      return this.similiarData.find(this.findRepited.bind(this, o))
    },
    finalTextValueValidation () {
      return typeof this.similiarData[this.highlightedIndex] !== 'undefined' ||
        (this.placeholderVal === '' && this.highlightedIndex !== 0)
    },
    isSimilar (o) {
      if (o) {
        if (this.suggestOnAllWords) {
          var isMatch = false
          var words = o[this.suggestionAttribute].split(' ')
          var textValWords = this.textVal.split(' ')
          if (words.length > 0) {
            words.forEach(function (word) {
              if (textValWords.length > 0) {
                textValWords.forEach(function (textValWord) {
                  if (word.toLowerCase().startsWith(textValWord.toLowerCase())) {
                    isMatch = true
                  }
                })
              } else if (word.toLowerCase().startsWith(this.textVal.toLowerCase())) {
                isMatch = true
              }
            })
            return isMatch
          }
        }

        return o[this.suggestionAttribute]
          .toLowerCase()
          .startsWith(this.textVal.toLowerCase())
      }
    },
    isSameType (o) {
      return o.name === this.type
    },
    fnExists (fnName) {
      return typeof fnName === 'function'
    },
    canAddToSimilarData () {
      return this.similiarData.length < this.highlightedIndexMax
    },
    suggestionsPropIsDefined () {
      return typeof this.suggestions !== 'undefined'
    },
    notArrowKeysEvent () {
      return this.selectedEvent !== 'ArrowUp' &&
        this.selectedEvent !== 'ArrowDown' && this.selectedEvent !== 'ArrowRight'
    },
    notEnterKeyEvent () {
      return this.selectedEvent !== 'Enter'
    },
    textValIsEmpty () {
      return this.textVal === ''
    },
    textValIsNotEmpty () {
      return this.textVal !== ''
    },
    reset () {
      this.clearValue()
      this.clearSelected()
      this.clearPlaceholder()
      this.clearSimilarData()
      this.clearSelectedSuggest()
      this.emitClear()
      this.emitSelected()
    },
    clearAll () {
      this.clearSelected()
      this.clearPlaceholder()
      this.clearSimilarData()
      this.clearSelectedSuggest()
    },
    clearValue () {
      this.textVal = ''
    },
    clearSelected () {
      this.selected = null
    },
    clearSelectedSuggest () {
      this.selectedSuggest = null
    },
    clearSimilarData () {
      this.similiarData = []
    },
    clearPlaceholder () {
      if (this.textValIsEmpty()) {
        this.clearSimilarData()
        this.setInitialPlaceholder()
      } else {
        this.placeholderVal = ''
      }
    },
    clearHighlightedIndex () {
      this.highlightedIndex = 0
    },
    changeText (e) {
      this.selectedEvent = e.code
      this.setTextValue(e)
      this.processChangeText()
      this.controlEvents(e)
    },
    processChangeText (e) {
      if (this.notEnterKeyEvent()) {
        // this.inputChanged = true
        this.suggestionsIsVisible = true
        this.clearAllAndFindSuggest()
      }
    },
    clearAllAndFindSuggest () {
      if (this.notArrowKeysEvent()) {
        this.clearAll()
        this.findSuggests()
      }
    },
    away () {
      this.suggestionsIsVisible = false
      this.emitSelected()
    },
    emitChange () {
      // this.$emit('input', this.textVal)
    },
    emitClickInput (event) {
      this.$emit('click-input', event)
    },
    emitClickButton (event) {
      this.$emit('click-button', this.textVal)
    },
    emitEnter () {
      this.$emit('enter')
    },
    emitKeyUp () {
      this.$emit('key-up')
    },
    emitKeyDown () {
      this.$emit('key-down', this.selectedSuggest)
    },
    emitKeyRight () {
      this.$emit('key-right')
    },
    emitClear () {
      this.$emit('clear')
    },
    emitEscape () {
      this.$emit('escape')
    },
    emitSelected () {
      this.$emit('selected', this.selectedSuggest)
    }
  }
}
</script>

<style>
.vue-instant__suggestions {
  position: absolute;
  left: 0;
  top: 110%;
  margin: 0;
  background-color: #fff;
  border: 1px solid #D3DCE6;
  width: 100%;
  padding: 6px 0;
  z-index: 10;
  border-radius: 2px;
  max-height: 280px;
  box-sizing: border-box;
  overflow: auto;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, .04), 0 2px 4px 0 rgba(0, 0, 0, .12);
  margin-top: 3px;
}

.vue-instant__suggestions li {
  list-style: none;
  line-height: 36px;
  padding: 0 10px;
  margin: 0;
  cursor: pointer;
  color: #475669;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.el-input-group__append {
  border: 0px !important;
}

.sbx-custom__input {
  position: absolute;
  left: 0 !important;
  background: rgba(255, 255, 255, 0) !important;
}

.vue-instant__suggestions li.highlighted__custom {
  background-color: whitesmoke;
  color: black;
}

.sbx-custom {
  display: inline-block;
  position: relative;
  width: 30vw;
  height: 37px;
  white-space: nowrap;
  box-sizing: border-box;
  margin-left: 12vw;
  /*font-size: 13px;*/
}

.sbx-custom__wrapper {
  width: 100%;
  height: 100%;
}

.sbx-custom__input, .sbx-custom__input-placeholder {
  display: inline-block;
  transition: box-shadow .4s ease, background .4s ease;
  border: 0;
  border-radius: 11px;
  box-shadow: inset 0 0 0 0px #EDEDED;
  background: #EDEDED;
  padding: 0;
  padding-right: 30px;
  padding-left: 37px;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  white-space: normal;
  font-size: inherit;
  appearance: none;
}

.sbx-custom__input::-webkit-search-decoration, .sbx-custom__input::-webkit-search-cancel-button, .sbx-custom__input::-webkit-search-results-button, .sbx-custom__input::-webkit-search-results-decoration {
  display: none;
}

.sbx-custom__input:hover {
  box-shadow: inset 0 0 0 0px lightgray;
}

.sbx-custom__input:focus, .sbx-custom__input:active {
  outline: 0;
  box-shadow: inset 0 0 0 0px #EDEDED;
  background: #EDEDED;
}

.sbx-custom__input::placeholder {
  color: #363636;
}

.sbx-custom__submit {
  position: absolute;
  top: 0;
  right: inherit;
  left: 0;
  margin: 0;
  border: 0;
  border-radius: 10px 0 0 10px;
  background-color: rgba(255, 255, 255, 0);
  padding: 0;
  width: 37px;
  height: 100%;
  vertical-align: middle;
  text-align: center;
  font-size: inherit;
  user-select: none;
}

.sbx-custom__submit::before {
  display: inline-block;
  margin-right: -4px;
  height: 100%;
  vertical-align: middle;
  content: '';
}

.sbx-custom__submit:hover, .sbx-custom__submit:active {
  cursor: pointer;
}

.sbx-custom__submit:focus {
  outline: 0;
}

.sbx-custom__submit svg {
  width: 17px;
  height: 17px;
  vertical-align: middle;
  fill: #ABABAB;
}

.sbx-custom__reset {
  display: none;
  position: absolute;
  top: 8px;
  right: 8px;
  margin: 0;
  border: 0;
  background: none;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  user-select: none;
  fill: rgba(0, 0, 0, 0.5);
}

.sbx-custom__reset:focus {
  outline: 0;
}

.sbx-custom__reset svg {
  display: block;
  margin: 4px;
  width: 13px;
  height: 13px;
}

.sbx-custom__input:valid ~ .sbx-custom__reset {
  display: block;
  animation-name: sbx-reset-in;
  animation-duration: .15s;
}

@keyframes sbx-reset-in {
  0% {
    transform: translate3d(-20%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: none;
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .sbx-custom {
    padding: 0;
    margin: 0;
    width: 65vw;
  }
}
</style>

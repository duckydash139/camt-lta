<template>
<div>
  <div class="padding">
    <div class="is-size-4 word-wrap">
      Scores
    </div>
    <div v-for="(item, index) in list" :key="item.key">
      <div class="columns is-mobile no-padding-bottom">
        <div class="column is-8 no-padding-right has-text-grey">
          <div class="select is-small full-width">
            <select v-model="item.id" class="full-width" name="">
              <option v-for="selector in renderDropdown(item.id, dropdown)" :key="selector.key" :value="selector.id">{{ selector.title }}</option>
            </select>
          </div>
        </div>
        <div class="column is-2 custom-padding has-text-grey">
          <input v-model="item.point" :disabled="isAllow(item.id, dropdown)" class="input is-small" placeholder="0" type="number" min="0" value="0">
        </div>
        <div class="column is-1 custom-padding has-text-grey">
          <span class="is-size-7">&nbsp;pts</span>
        </div>
        <div @click="deleteScore(index)" class="column is-1 custom-padding has-text-grey">
          <b-icon class="has-text-danger" pack="fa" icon="times"></b-icon>
        </div>
      </div>
    </div>
  </div>
  <div @click="addScore" :disabled="isDisabled" class="button is-small margin-left has-text-info full-width add-button">
    ADD
  </div>
</div>
</template>
<script>
import _ from 'lodash'
export default {
  props: ['value', 'dropdown'],
  data () {
    return {
      list: []
    }
  },
  created () {
    this.list = this.value
  },
  updated () {
    this.$emit('input', this.list)
  },
  methods: {
    addScore () {
      if (this.list.length < this.dropdown.length) {
        this.list.push({})
      }
    },
    deleteScore (index) {
      this.list.splice(index, 1)
    },
    isAllow (id, dropdown) {
      let result = false
      dropdown.map(item => {
        if (id === item.id) {
          if (
            item.formula !== null ||
            item.formula === 'depends on admin'
          ) {
            result = true
            if (
              item.formula.search('each') > 0 ||
              item.formula.search('max') > 0
            ) {
              result = true
            }
          }
        }
      })

      return result
    },
    renderDropdown (id, dropdown) {
      let buffer = [...this.localDropdown]

      dropdown.map(item => {
        if (item.id === id) {
          buffer.push(item)
        }
      })

      return _.sortBy(buffer, 'id')
    }
  },
  computed: {
    isDisabled () {
      if (this.list.length >= this.dropdown.length) {
        return true
      }
      return false
    },
    localDropdown () {
      return _.differenceBy(this.dropdown, this.list, 'id')
    }
  }
}
</script>
<style scoped>
.word-wrap {
  word-wrap: break-word;
}
.padding {
  padding-left: 1vw;
  padding-right: 1vw;
}
.margin-left {
  margin-left: 1vw;
}
.add-button {
  border: dashed 1px hsl(217, 71%, 53%);
  border-radius: 2px;
}
.full-width {
  width: 100%;
}
.check {
  border: solid 1px red;
}
input[type=number] {
  width: auto;
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
</style>

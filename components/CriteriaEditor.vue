<template>
  <div class="column card extend-card">
    <div class="card-content">
      <div class="columns">
        <div class="column has-text-centered">
          <span class=" is-size-3">Criteria</span><br>
          <button class="is-pulled-right button is-small has-text-info add-button" type="button" @click="addBtn">Add</button>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <b>Title</b>
        </div>
        <div class="column">
          <b>Max score</b>
        </div>
        <div class="column">
          <b>Formula</b>
        </div>
        <div class="column">
          <b>Value</b>
        </div>
        <div class="column">
          <b>Color</b>
        </div>
        <div class="column is-1"></div>
      </div>
      <div class="columns" v-for="(item, index) in list" :key="item.key">
        <div class="column">
          <input v-model="item.title" placeholder="title" type="text" class="input">
        </div>
        <div class="column">
          <input v-model="item.max" placeholder="max" type="number" min="0" class="input">
        </div>
        <div class="column">
          <select v-model="item.formula" class="input" name="">
            <option value="unity">Count participants</option>
            <option value="depends on admin">Depends on admin</option>
            <option value="of each">Each of them has</option>
            <option value="multiply by">Multiply by</option>
            <option value="normal">Normal</option>
          </select>
        </div>
        <div class="column">
          <input v-model="item.point" :disabled="(item.formula === 'normal') || (item.formula === 'unity') || (item.formula === 'depends on admin') ? true : false" placeholder="0" type="number" min="0" class="input">
        </div>
        <div class="column">
          <input v-model="item.color" type="color" class="input">
        </div>
        <div @click="deleteBtn(index)" class="column is-1 has-text-centered">
          <b-icon class="has-text-danger" pack="fa" icon="times"></b-icon>
        </div>
      </div>
      <div class="columns" v-if="!data">
        <div class="column">loading</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['data'],
  data () {
    return {
      localeData: this.data,
      list: [],
      initData: true
    }
  },
  methods: {
    addBtn () {
      this.list.push({
        formula: 'normal'
      })
    },
    deleteBtn (index) {
      this.list.splice(index, 1)
    }
  },
  computed: {
    compile () {
      let buffer = []
      let criteria = this.list
      criteria.map(item => {
        let formula = null
        let point = item.point || 0
        if (item.formula === 'unity') {
          formula = '(participants/total)*max'
        } else if (item.formula === 'of each') {
          formula = `${point} of each`
        } else if (item.formula === 'multiply by') {
          formula = `multiply by ${point}`
        } else if (item.formula === 'normal') {
          formula = null
        } else {
          formula = item.formula
        }

        buffer.push({
          title: item.title,
          max: item.max,
          formula,
          color: item.color
        })
      })

      this.$emit('update:data', buffer)
      this.$emit('data', buffer)
      this.localeData = buffer
      return buffer
    },
    decompile () {
      let buffer = []
      this.localeData.map(item => {
        let formula = null
        let point = null
        if (item.formula === null) {
          formula = 'normal'
        } else if (item.formula === 'depends on admin') {
          formula = item.formula
        } else if (item.formula.search('each') > 0) {
          formula = 'of each'
          point = parseInt(item.formula.slice(0, 2))
        } else if (item.formula.search('multiply') === 0) {
          formula = 'multiply by'
          point = parseInt(item.formula.slice(-2))
        } else if (item.formula.search('max') > 0) {
          formula = 'unity'
        }

        buffer.push({
          title: item.title,
          max: item.max,
          formula,
          point,
          color: item.color
        })
      })

      return buffer
    }
  },
  created () {
    this.localeData = this.data
    this.list = this.decompile
  },
  updated () {
    if (this.initData) {
      this.localeData = this.data
      this.list = this.decompile
      this.initData = false
      // console.log(this.decompile)
    } else {
      this.$emit('update:data', this.list)
      this.$emit('data', this.list)
    }
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
}
.add-button {
  border: dashed 1px hsl(217, 71%, 53%);
  border-radius: 2px;
}
</style>

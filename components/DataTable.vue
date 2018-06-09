<template>
<div id="">
  <div v-if="searchable" class="is-pulled-right">
    <input v-model="search" class="searchBox input" type="text" value="" placeholder="Search..">
  </div>
  <table class="table is-fullwidth">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header.key">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="data.length === 0">
        <td :colspan="headers.length">No data</td>
      </tr>
      <tr v-for="item in dividedData" :key="item.key">
        <slot :item="item"></slot>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td class="footer" :colspan="headers.length">
          <div class="wrapper">
            <span class="is-unselectable">Row per page:&nbsp;</span>
            <select v-model="limit" class="select">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="100">100</option>
            </select>
            <span class="row-status is-unselectable">{{ currentPage }} of {{ totalPage }}</span>
            <div class="paginate ">
              <svg @click="prevPage" class="chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg><span class="is-unselectable">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <svg @click="nextPage" class="chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</div>
</template>
<script>
import Fuse from 'fuse.js'

export default {
  props: ['headers', 'data', 'searchable', 'searchKeys'],
  data () {
    return {
      localData: [],
      limit: 10,
      currentPage: 1,
      search: ''
    }
  },
  methods: {
    prevPage () {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage () {
      if (this.currentPage < this.totalPage) {
        this.currentPage++
      }
    },
    paginate (array, limit, page) {
      --page
      return array.slice(page * limit, (page + 1) * limit)
    },
    escapeRegex (text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
  },
  computed: {
    dividedData () {
      return this.paginate(this.localData, this.limit, this.currentPage)
    },
    totalPage () {
      return Math.ceil(this.localData.length / this.limit)
    }
  },
  watch: {
    search: function (query) {
      if (query.trim() === '') {
        this.localData = this.data
      } else {
        // search logic 
        let options = {
          shouldSort: true,
          tokenize: true,
          matchAllTokens: true,
          findAllMatches: true,
          threshold: 0,
          location: 0,
          distance: 0,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: [...this.searchKeys]
        }
        
        let fuse = new Fuse([...this.data], options)
        
        this.localData = fuse.search(query)
      }
    },
    data: function (value) {
      if (value) {
        this.localData = value
      }
    }
  }
}
</script>
<style scoped>
th, td {
  text-align: center;
}
.footer {
  font-size: 0.75rem;
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.row-status {
  margin-left: 1vw;
  margin-right: 2vw;
}
.select {
  background: white;
}
.paginate {
  display: flex;
  align-items: center;
}
.chevron {
  border-radius: 50%;
  cursor: pointer;
}
.chevron:hover {
  background-color: white;
}
.searchBox {
  width: 20vw;
  /* padding: 5px; */
}
</style>

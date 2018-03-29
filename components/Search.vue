<template>
<div id="">
  <form @submit.prevent="search">
    <div class="field has-addons">
      <div class="control">
        <input ref="query" v-model="query" class="input" type="text" placeholder="Search...">
      </div>
      <div class="control">
        <button class="button">
          Go
        </button>
      </div>
    </div>
  </form>
</div>
</template>

<script>
export default {
  data() {
    return {
      query: ''
    }
  },
  methods: {
    search () {
      this.$router.push(`/search?q=${this.query}`)
      this.query = ''
      this.$refs.query.blur()
    }
  }
}
</script>
<style scoped>
.field {
  padding-left: 10vw;
}
input, input:focus {
  width: 25vw;
  background: #EDEDED;
  box-shadow: inset 0 0 0 0px #EDEDED;
  border: 0;
  border-radius: 11px;
}
button {
  width: 5vw;
  border-radius: 11px;
  border: solid 1px #EDEDED;
}
.button:hover, .button:active, .button:focus {
  outline: 0;
  box-shadow: none;
  border: solid 1px #EDEDED;
}
@media (max-width: 768px) {
  .field {
    padding-left: 0vw;
  }
  input {
    width: 50vw;
    background: #EDEDED;
    box-shadow: inset 0 0 0 0px #EDEDED;
    border: 0;
    border-radius: 11px;
  }
  button {
    width: 15vw;
    border-radius: 11px;
  }
}
</style>

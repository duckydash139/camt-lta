<template>
  <router-link :to="to" class="item is-unselectable">
    <slot></slot>
    <br>
    {{ title }}
  </router-link>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      require: true
    },
    to: {
      type: String,
      require: true
    },
    active: {
      type: Boolean
    }
  },
  data () {
    return {

    }
  }
}
</script>
<style scoped>
.item {
  padding-top: 1.5vh;
  height: 100%;
  /*border: solid 1px red;*/
  flex-grow: 1;
  /*align-self: flex-end;*/
  text-align: center;
  font-size: 2vw;
  color: #363636;
}

.active {
  color: red;
}
</style>

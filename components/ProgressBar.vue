<template>
  <div class="progress-bar is-unselectable">
    <div class="now" :style="{'background-color': this.color, 'width': `${calculateWidth}%`}">&nbsp;</div>
  </div>
</template>
<script>
export default {
  props: ['max', 'now', 'color'],
  computed: {
    calculateWidth () {
      let max = this.max
      if (typeof this.max === 'undefined') {
        max = this.now
      }

      if ((this.now / max) * 100 > 0) {
        return (this.now / max) * 100
      } else {
        return 0
      }
    }
  }
}
</script>
<style scoped>
.progress-bar {
  width: 100%;
  height: 1.5vh;
  background-color: hsl(0, 0%, 96%);
  border-radius: 5px;
}
.now {
  height: 1.5vh;
  border-radius: 5px;
}
</style>

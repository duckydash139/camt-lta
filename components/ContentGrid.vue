<template>
  <div class="columns grid">
    <div class="column is-three-quarters">
      <slot name="left"></slot>
    </div>
    <div class="column">
      <ScoreCard/>
    </div>
  </div>
</template>
<script>
import ScoreCard from './ScoreCard'

export default {
  components: {
    ScoreCard
  }
}
</script>
<style scoped>
.check {
  border:solid 1px red;
}
.grid {
  margin-left: 10vh;
  margin-right: 10vh;
}

@media (max-width: 768px) {
  .grid {
    margin: 0;
    padding: 0;
  }
}
</style>

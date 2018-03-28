<template>
  <div>
    <ContentGrid>
      <div slot="left">
        <NotiCard/>
      </div>
    </ContentGrid>
  </div>
</template>

<script>
import ContentGrid from '~/components/ContentGrid.vue'
import NotiCard from '~/components/NotiCard.vue'

export default {
  components: {
    ContentGrid,
    NotiCard
  },
  data () {
    return {

    }
  }
}
</script>
<style>
</style>

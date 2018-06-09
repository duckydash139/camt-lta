<template>
  <div>
dashboard
  </div>
</template>
<script>
export default {
  layout: 'admin',
  created() {
    //do something after creating vue instance
    this.$router.push('/admin/records')
  }
}
</script>

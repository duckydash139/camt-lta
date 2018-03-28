<template>
  <div class="tabbar">
    <!-- <slot></slot> -->
    <TabItem title="Home" to="/" :active="true">
      <b-icon pack="fa" icon="home"></b-icon>
    </TabItem>
    <TabItem title="Notification" to="/notification" :active="true">
      <b-icon pack="fa" icon="bell"></b-icon>
    </TabItem>
    <TabItem title="Logout" to="login" :active="false">
      <b-icon pack="fa" icon="sign-out"></b-icon>
    </TabItem>
  </div>
</template>
<script>
import TabItem from '~/components/TabItem.vue'

export default {
  data () {
    return {

    }
  },
  components: {
    TabItem
  }
}
</script>
<style>
.tabbar {
  display: none;
}

@media (max-width: 768px) {
  .tabbar {
    bottom: 0;
    position: fixed;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    justify-content: center;
    height: 8vh;
    width: 100vw;
    background-color: white;
    border-top: solid 1px hsl(0, 0%, 88%);
  }
}
</style>

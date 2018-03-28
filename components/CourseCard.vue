<template>
  <div>
    <div class="card extend-card">
      <div class="columns">
        <div class="column is-8 pic" :style="{ 'background-image': `url('${detail.img}')` }"></div>
        <div class="column is-4 float-bottom">
          <p class="is-size-4 has-text-weight-bold">{{ detail.code }}</p>
          <p class="is-size-5">{{ detail.title }}</p>
          <div class="space">
          <p class="is-size-7 has-text-danger">Condition: {{ detail.condition }}</p>
          <button class="button is-info full-width" @click="enroll">Enroll</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    detail: {
      type: Object,
      required: true
    }
  },
  methods: {
    enroll () {
      // check if this user pass the condition then show dialog
      this.$dialog.confirm({
        message: `<strong>Confirm</strong><br />
        Enrollment in <strong>${this.detail.title}</strong>?`,
        confirmText: 'Confirm',
        type: 'is-info',
        onConfirm: () => {
          this.$store.dispatch('user/setCourse', this.detail.code)
        }
      })
    }
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
  margin-bottom: 2vh;
  padding: 1vw;
}
.check {
  border: solid 1px red;
}
.pic {
  background-color: whitesmoke;
  height: 300px;
}
.full-width {
  width: 100%;
}
.float-bottom {
  display: flex;
  flex-direction: column;
}
.space {
  margin-top: auto;
}

@media (max-width: 768px) {
  .extend-card {
    padding: 0vw 2vw 2vw 2vw;
    margin-bottom: 3vh;
  }
  .pic {
    margin: 0vw 1vw 0vw 1vw;
  }
}
</style>

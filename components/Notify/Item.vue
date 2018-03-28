<template>
  <div class="noti-item" :class="{'active': !isRead}">
    <div class="icon">
      <b-icon v-if="detail.is_approve" class="has-text-success" pack="fa" icon="check" size="is-medium"/>
      <b-icon v-else="!detail.is_approve" class="has-text-danger" pack="fa" icon="times" size="is-medium"/>
    </div>
    <div>
      Request for <router-link :to="activityLink" >{{ detail.activity_title }}</router-link> has been {{ approveStatus }}.
      <br>
      <span class="petit">{{ formatDate(detail.createdAt) }}</span>
    </div>
    <div class="action" @click="isPressed">
      <b-tooltip size="is-small" type="is-black" :animated="true" :square="true" :label="tooltipLabel">
        <b-icon class="v-small" pack="fa" :icon="changeStateIcon"/>
      </b-tooltip>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'

export default {
  props: ['detail'],
  data () {
    return {
      isRead: true
    }
  },
  methods: {
    async isPressed () {
      let token = this.$store.state.user.token
      const { data } = await axios.put(`/api/users/562110139/notification/${this.detail._id}`, '',{headers: { token }})
      if (data.success) {
        this.isRead = !this.isRead
      }
    },
    formatDate (date) {
      return moment(date).format('DD MMM YY LT')
    }
  },
  computed: {
    tooltipLabel () {
      if (!this.isRead) {
        return 'Mark as Read'
      } else {
        return 'Mark as Unread'
      }
    },
    changeStateIcon () {
      if (!this.isRead) {
        return 'circle'
      } else {
        return 'circle-o'
      }
    },
    approveStatus () {
      if (this.detail.is_approve) {
        return 'approved'
      } else {
        return 'denied'
      }
    },
    activityLink () {
      return `/history/${this.detail.record_id}`
    }
  },
  mounted () {
    this.isRead = this.detail.is_read
  }
}
</script>
<style scoped>
.noti-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  height: 70px;
  font-size: 0.8rem;
  border-bottom: solid 1px #eee;
}
.active {
  background-color: hsl(0, 0%, 96%);
}
.action {
  margin-left: auto;
}
.action:hover {
  cursor: pointer;
}
.icon {
  width: 50px;
}
.petit {
  font-size: 0.7rem;
}
.v-small {
  font-size: 0.4rem;
}
</style>

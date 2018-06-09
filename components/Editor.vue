<template>
<div id="imageEditor">
  <div class="card columns extend-card">
    <div class="column is-8">
      <div class="columns is-mobile">
        <div class="column is-11-desktop is-size-3 word-wrap">
          <router-link :to="eventRoute" class="has-text-black">
            {{ detail.title }}
          </router-link>
        </div>
      </div>
      <div class="column">
        <a v-show="hasImage" class="button is-small" :class="{'is-active': drawing}" @click="drawingMode">Draw</a>
        <a v-show="hasImage" class="button is-small" @click="clearBtn">Clear</a>
        <div class="file is-success is-small is-pulled-right">
          <label class="file-label">
            <input class="file-input" type="file" @change="previewInCanvas">
            <span class="file-cta">
              <span class="file-label">
                Choose a file…
              </span>
            </span>
          </label>
        </div>
        <div v-if="!hasImage" class="has-text-centered" style="height: 50px;">
          Waiting for image..
        </div>
        <div id="editor" style="height: 400px;">
        </div>
        <div class="has-text-danger is-size-7">
           Ps. The image size limit is 10 MB. And only JPEG/PNG are supported.
        </div>
      </div>
    </div>
    <div class="column is-paddingless has-left-border is-4">
      <div class="padding">
        <div class="is-size-4 word-wrap">
          Scores
        </div>
        <div v-for="(item, index) in storedScores">
          <div class="columns is-mobile no-padding-bottom">
            <div class="column is-8 no-padding-right has-text-grey">
              <div v-for="(list, index) in dropdown" class="is-small full-width">
                <span class="is-size-7" v-if="list.id === item.id">
                  {{ list.title }}
                </span>
              </div>
            </div>
            <div class="column is-2 custom-padding has-text-grey has-text-centered">
              <span v-if="item.point">{{ item.point }}</span>
              <span v-else>TBD</span>
            </div>
            <div class="column is-1 custom-padding has-text-grey">
              <span class="is-size-7">&nbsp;pts</span>
            </div>
          </div>
        </div>
        <br>
        <div v-for="reflex of storedDes">
          {{ reflex }}
        </div>
        <br>
        <button @click="goBack" class="padding button margin-left full-width">Back</button>
        <button @click="submitData" class="padding button is-info margin-left full-width" :class="{'is-loading': loading}" :disabled="!hasImage">Earn points</button>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import {mapGetters} from 'vuex'

if (process.browser) {
  var ImageEditor = require('tui-image-editor')
}

export default {
  name: 'imageEditor',
  props: ['detail', 'scores', 'dropdown'],
  data () {
    return {
      instance: null,
      hasImage: false,
      drawing: false,
      loading: false
    }
  },
  mounted () {
    // start Editor
    const instance = new ImageEditor('#editor', {
      cssMaxWidth: 500,
      cssMaxHeight: 500,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
      }
    })

    instance.setDrawingShape('circle', {
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 10
    })

    this.instance = instance
  },
  methods: {
    previewInCanvas (e) {
      const files = e.target.files || e.dataTransfer.files

      if (!files.length) {
        return
      }

      const file = files[0]
      this.instance.loadImageFromFile(file)
      this.hasImage = true
      this.$toast.open({
        duration: 5000,
        message: 'Please draw circle on your face by clicking on "Draw" and start to draw'
      })
    },
    drawingMode () {
      this.drawing = !this.drawing
      if (this.drawing === true) {
        this.instance.startDrawingMode('SHAPE')
      } else {
        this.instance.stopDrawingMode()
      }
    },
    clearBtn () {
      this.instance.clearObjects()
    },
    saveBtn () {
      this.instance.stopDrawingMode()
    },
    submitData () {
      this.loading = true
      let imageName = this.instance.getImageName()
      let dataURL = this.instance.toDataURL()

      const blob = this.base64ToBlob(dataURL)

      this.$store.dispatch('event/saveData', blob)
    },
    base64ToBlob (data) {
      let mimeString = ''
      const rImageType = /data:(image\/.+);base64,/
      let raw, uInt8Array, i, rawLength

      raw = data.replace(rImageType, function(header, imageType) {
        mimeString = imageType
        return ''
      })

      raw = atob(raw)
      rawLength = raw.length
      uInt8Array = new Uint8Array(rawLength)

      for (i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i)
      }
      return new Blob([uInt8Array], {type: mimeString})
    },
    goBack () {
      this.$router.go(-1)
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user',
      storedScores: 'event/scores',
      storedDes: 'event/reflections'
    }),
    eventRoute () {
      return `/event/${this.detail._id}`
    }
  }
}
</script>
<style scoped>
.extend-card {
  border-radius: 2px;
  margin-bottom: 3vh;
  padding: 1vw 2vw 1vw 2vw;
}

.word-wrap {
  word-wrap: break-word;
}

.normal-text {
  font-size: initial;
}

.has-left-border {
  border-left: solid 1px #eee;
}

.padding {
  padding-left: 1vw;
  padding-right: 1vw;
}

.petit {
  font-size: 0.7rem;
}

.full-width {
  width: 100%;
}

.full-width-mobile {
  margin-right: 1vh;
}

.custom-padding {
  padding-left: 0;
  padding-right: 0;
}
.no-padding-right {
  padding-right: 0;
}
.no-padding-bottom {
  padding-bottom: 0;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .has-left-border {
    border-top: solid 1px #eee;
    border-left: none;
  }
  .extend-card {
    margin-left: 0.1vw;
    padding: 3vw;
  }
  .responsive-text {
    font-size: 3vw;
  }
  .petit {
    font-size: 0.7rem;
  }
  .full-width-mobile {
    width: 100%;
    margin-bottom: 1vh;
  }
}
</style>

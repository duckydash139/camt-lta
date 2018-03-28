<template>
<div>
  <div class="card columns extend-card">
    <div ref="imageBox" class="column is-8">
      <div class="column">
        <canvas id="canvas" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseout="handleMouseOut" ref="imageEditor"></canvas>
      </div>
    </div>
    <div class="column is-4">
      <div class="file is-centered">
        <label class="file-label full-width">
          <input class="file-input" type="file" @change="previewInCanvas">
          <span class="file-cta full-width">
            <span class="file-icon">
              <i class="fa fa-upload"></i>
            </span>
            <span class="file-label">
              Choose a file…
            </span>
          </span>
        </label>
      </div>
      <button @click="saveImage" class="button full-width">Upload</button>
    </div>
  </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      canvas: null,
      preview: null,
      isDown: false,
      startX: null,
      startY: null,
      renderedImage: {
        img: null,
        width: null,
        height: null
      },
      processedImage: null
    }
  },
  mounted () {
    // console.log(this.$refs.imageBox.clientWidth)
    this.canvas = this.$refs.imageEditor
    this.ctx = this.canvas.getContext('2d')
    // this.ctx.canvas.width = this.$refs.imageBox.width
    this.ctx.font = '15px system-ui'
    this.ctx.textAlign = 'center'
    this.ctx.strokeText('Loading...', this.canvas.width / 2, this.canvas.height / 2)
  },
  methods: {
    previewInCanvas (e) {
      const files = e.target.files || e.dataTransfer.files

      if (!files.length) {
        return
      }

      const file = files[0]

      const reader = new FileReader()

      reader.onload = e => {
        const dataURI = e.target.result

        if (dataURI) {
          this.preview = dataURI
          const img = new Image()
          img.src = dataURI

          img.onload = () => {
            // this.canvas.width = this.$refs.imageBox.clientWidth - 30
            this.canvas.width = 600
            this.canvas.height = this.canvas.width * (img.height / img.width)

            const oc = document.createElement('canvas')
            const octx = oc.getContext('2d')

            let cur = {
              width: Math.floor(img.width * 0.5),
              height: Math.floor(img.height * 0.5)
            }

            oc.width = cur.width
            oc.height = cur.height

            octx.drawImage(img, 0, 0, cur.width, cur.height)

            // resize the image
            while (cur.width * 0.5 > 600) {
              cur = {
                width: Math.floor(cur.width * 0.5),
                height: Math.floor(cur.height * 0.5)
              }
              octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height)
            }

            // save value to repaint image
            this.renderedImage = {
              img: oc,
              width: cur.width,
              height: cur.height
            }
            // Initial render
            this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height)
            // this.ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, this.canvas.width, this.canvas.height)
          }
        }
      }

      reader.readAsDataURL(file)
    },
    handleMouseDown (e) {
      e.preventDefault()
      e.stopPropagation()
      const offsetX = this.canvas.offsetLeft
      const offsetY = this.canvas.offsetTop

      // save the starting x/y of the rectangle
      this.startX = parseInt(e.clientX - offsetX)
      this.startY = parseInt(e.clientY - offsetY)

      // set a flag indicating the drag has begun
      this.isDown = true
    },
    handleMouseUp (e) {
      e.preventDefault()
      e.stopPropagation()

      // the drag is over, clear the dragging flag
      this.isDown = false
    },
    handleMouseOut (e) {
      e.preventDefault()
      e.stopPropagation()

      // the drag is over, clear the dragging flag
      this.isDown = false
    },
    handleMouseMove (e) {
      e.preventDefault()
      e.stopPropagation()
      const offsetX = this.canvas.offsetLeft
      const offsetY = this.canvas.offsetTop

      // if we're not dragging, just return
      if (!this.isDown || !this.preview) {
        return
      }

      // get the current mouse position
      let mouseX = e.clientX - offsetX
      let mouseY = e.clientY - offsetY

      // clear the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.strokeStyle = 'red'
      this.ctx.lineWidth = 3
      // repaint img
      this.ctx.drawImage(this.renderedImage.img, 0, 0, this.renderedImage.width, this.renderedImage.height, 0, 0, this.canvas.width, this.canvas.height)

      // calculate the rectangle width/height based
      // on starting vs current mouse position
      let width = mouseX - this.startX
      let height = mouseY - this.startY

      // draw a new rect from the start position
      // to the current mouse position
      this.ctx.strokeRect(this.startX, this.startY, width, height)
    },
    saveImage () {
      this.canvas.toBlob(blob => {
        console.log(URL.createObjectURL(blob))
        this.processedImage = blob

        console.log(this.processedImage)
      })
    }
  }
}
</script>

<style scoped>
#canvas {
  background-color: white;
  border: solid 1px #d3d3d3;
}

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

.petit {
  font-size: 0.7rem;
}

.full-width {
  width: 100%;
}

.full-width-mobile {
  margin-right: 1vh;
}

@media (max-width: 768px) {
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

<template>
<div id="">
</div>
</template>
<script>
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from '~/assets/vfs_fonts'
import moment from 'moment'
import { mapGetters } from 'vuex'
import axios from 'axios'
var requireContext = require('require-context')

let images = require.context('~/static/uploads/', false, /\.png$/)

export default {
  layout: 'oauth',
  methods: {
    async initData () {
      const { data } = await axios(`/api/users/562110139/955101/export`)

      pdfMake.vfs = pdfFonts.pdfMake.vfs
      pdfMake.fonts = {
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew-Bold.ttf',
          italics: 'THSarabunNew-Italic.ttf',
          bolditalics: 'THSarabunNew-BoldItalic.ttf'
        },
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }

      let doc = {
        defaultStyle: {
          font: 'THSarabunNew'
        },
        header: {
          text: `generated at ${moment().format('DD/MM/YYYY LT')}`,
          alignment: 'right'
        },
        content: [
          {
            text: this.checkCourseId(this.$route.params.id),
            style: {
              fontSize: 20,
              bold: true
            }
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 10,
                x2: 515,
                y2: 10,
                lineWidth: 2
              }
            ]
          },
          {
            // text: `Student ID: ${this.signedIn.student_id}`,
            text: `Student ID: 562110139`,
            margin: [0, 10, 0, 0]
          },
          {
            // text: `Name: ${this.signedIn.firstName} ${this.signedIn.lastName}`,
            text: `Name: Nathanan Nararet`,
            margin: [0, 0, 0, 30]
          }
        ]
      }

      data.map(item => doc.content.push(this.renderEvent(item)))


      pdfMake.createPdf(doc).download()
    },
    checkCourseId (courseId) {
      if (parseInt(courseId) === 955100) {
        return '955100 - LEARNING THROUGH ACTIVITIES 1'
      } else if (parseInt(courseId) === 955101){
        return '955101 - LEARNING THROUGH ACTIVITIES 2'
      }
    },
    renderEvent (item) {
      let buffer = []

      item.scores.map(obj => {
        buffer.push([
          `${obj.title}`,
          {
            text: `${obj.point} pts`,
            alignment: 'right'
          }
        ])
      })
      let schema = [
        {
          text: `${item.event.title}`,
          style: {
            fontSize: 18,
            bold: true
          }
        },
        {
          columns: [
            {
              stack: [

                {
                  text: `Date: ${moment(item.event.date).format('DD/MM/YYYY LT')}`
                }, {
                  text: `Location: ${item.event.location}`
                }, {
                  text: `Description: ${item.event.description}`,
                  margin: [0, 0, 0, 10]
                },
                // {
                //     image: `./uploads/${item.picture}`,
                //     fit: [300, 300],
                // }
              ],
              width: '65%'
            }, {
              stack: [
                {
                  text: 'Scores',
                  style: {
                    fontSize: 14,
                    bold: true
                  }
                },
                [
                  {
                    table: {
                      body: buffer
                    },
                    layout: 'noBorders'
                  }
                ]
              ],
              width: '*'
            }
          ],
          columnGap: 10,
          pageBreak: 'after'
        }
      ]

      return schema
    },
    convertImgToBase64 (img) {
      const imgUrl = images(`./${img}`)
      console.log(imgUrl)
      let file = new Image()
      file.href = imgUrl
      let reader = new FileReader()
      reader.onloadend = () => {
        console.log('RESULT', reader.result)
      }
      reader.readAsDataURL(file)
    }
  },
  computed: {
    ...mapGetters({
      signedIn: 'user/user'
    })
  },
  mounted () {
    this.convertImgToBase64('e8f8ccc6-a10b-4a5f-bcc5-87e831158a13.png')
    // this.initData()
  }
}
</script>
<style lang="scss" scoped>
</style>

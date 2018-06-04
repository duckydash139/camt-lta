import _ from 'lodash'
import moment from 'moment'

import { Criteria, Batches, Records, Users } from './models'

import { Types } from 'mongoose'

const pdfMakePrinter = require('pdfmake/src/printer')

const ObjectId = Types.ObjectId

const query = {
  sanitize (score, criteria) {
    if (criteria.formula === null) {
      return score.point
    } else if (criteria.formula === 'depends on admin') {
      return score.point || 0
    } else if (criteria.formula.search('each') > 0) {
      return parseInt(criteria.formula.slice(0, 2))
    } else if (criteria.formula.search('multiply') === 0) {
      return score.point * parseInt(criteria.formula.slice(-2))
    } else if (criteria.formula.search('max') > 0) {
      return 0
    } else {
      return score.point
    }
  },
  formula (criteria) {
    if (criteria.formula === 'depends on admin' || criteria.formula === null) {
      return `point`
    } else if (criteria.formula.search('each') > 0) {
      return parseInt(criteria.formula.slice(0, 2))
    } else if (criteria.formula.search('multiply') === 0) {
      return `point * ${parseInt(criteria.formula.slice(-2))}`
    } else if (criteria.formula.search('max') > 0) {
      return criteria.formula.replace('max', criteria.max)
    } else {
      return `point`
    }
  }
}
const styles = {
  header: {
    fill: {
      fgColor: {
        rgb: 'D9D9D9'
      }
    },
    alignment: {
      horizontal: 'center'
    }
  },
  center: {
    alignment: {
      horizontal: 'center'
    }
  },
  numberCenter: {
    numFmt: '0',
    alignment: {
      horizontal: 'center'
    }
  },
  floatCenter: {
    numFmt: '0.00',
    alignment: {
      horizontal: 'center'
    }
  },
  total: {
    fill: {
      fgColor: {
        rgb: 'f6f6f6'
      }
    },
    numFmt: '0.00',
    alignment: {
      horizontal: 'center'
    }
  }
}

export const grading = {
  async save (scores, batchId) {
    let result = []
    const ref = await Criteria.findOne({'batch_id': batchId})

    scores.map(score => {
      ref.structure.map(eachItem => {
        if (parseInt(score.id) === eachItem.id) {
          result.push({
            id: eachItem.id,
            count: score.count,
            point: query.sanitize(score, eachItem)
          })
        }
      })
    })

    return result
  },
  async compute (transaction) {
    let data = []
    const ref = await Criteria.findOne({'batch_id': transaction.batch_id})
    const isUnity = await Batches.findOne({'unity_id': transaction.activity_id, 'course_id': transaction.course_id, 'is_open': true})
    const countAll = await Records.find({'activity_id': ObjectId(transaction.activity_id), 'status.approved': true})

    transaction.scores.map(score => {
      if (score.count === true) {
        ref.structure.map(eachItem => {
          let total = 0
          let participants = 0
          const max = eachItem.max
          const point = score.point

          let computed = eval(query.formula(eachItem))

          // is match with current item
          if (parseInt(score.id) === eachItem.id) {
            // is unity?
            if (eachItem.title === 'Unity') {
              // if this score is unity
              if (isUnity) {
                // get participant's value
                total = isUnity.unity_setting
                // count all participants in Records
                participants = countAll.length
              }
              computed = parseFloat(eval(query.formula(eachItem)).toFixed(2)) || 0
            }

            data.push({
              id: parseInt(score.id),
              count: score.count,
              point: computed
            })
          }
        })
      }
    })
    return data
  },
  sum (scores, criteria) {
    let buffer = []

    for (let item of scores) {
      let isNewItem = true
      // each item
      buffer.map(score => {
        if (score.id === item.id) {
          score.point += item.point
          isNewItem = false
        }
      })
      isNewItem ? buffer.push(item) : false
    }

    buffer.map(score => {
      criteria.map(item => {
        if (score.id === item.id) {
          if (score.point >= item.max) {
            score.point = item.max
          }
        }
      })
    })

    return buffer
  },
  async student (studentId, courseId) {
    let result = []
    // const student = await Users.findOne({student_id: studentId})
    const data = await Records.find({'student_id': studentId, 'batch_id': courseId, 'status.approved': true})
    const criteria = await Criteria.findOne({batch_id: courseId})

    for (let item of data) {
      const score = await this.compute(item)
      result.push(...score)
    }

    const total = this.sum(result, criteria.structure)

    return total
  }
}

export const sheets = {
  scoreboard: {
    heading (detail) {
      let title = `${detail.course_id} - LEARNING THROUGH ACTIVITIES ${detail.course_id === 955100 ? 1 : 2}`

      const data = [
        [{value: title, style: styles.center}],
        ['Start at', {value: detail.createdAt, style: styles.center}],
        ['Closed at', {value: detail.checkoutAt || '', style: styles.center}],
        ['Number of total student', {value: parseInt(detail.unity_setting), style: styles.numberCenter}],
        ['Number of total participant', {value: parseInt(detail.participant), style: styles.numberCenter}],
        ['Batch ID', {value: `${detail._id}`.substring(18, 24), style: styles.center}],
        []
      ]

      return data
    },
    merges () {
      return [
        { start: { row: 1, column: 1 }, end: { row: 1, column: 3 } },
        { start: { row: 2, column: 2 }, end: { row: 2, column: 3 } },
        { start: { row: 3, column: 2 }, end: { row: 3, column: 3 } },
        { start: { row: 4, column: 2 }, end: { row: 4, column: 3 } },
        { start: { row: 5, column: 2 }, end: { row: 5, column: 3 } },
        { start: { row: 6, column: 2 }, end: { row: 6, column: 3 } },
        { start: { row: 7, column: 1 }, end: { row: 7, column: 3 } }
      ]
    },
    data (studentList) {
      let buffer = []

      for (let item of studentList) {
        let total = 0

        for (let score of item.scores) {
          total += score.point
        }

        buffer.push({
          student_id: item.student_id,
          name: `${item.first_name} ${item.last_name}`,
          score: total
        })
      }

      const sorted = _.sortBy(buffer, ['score']).reverse()

      return sorted
    },
    spec () {
      const data = {
        student_id: {
          displayName: 'ID',
          headerStyle: styles.header,
          cellStyle: styles.numberCenter,
          width: 170
        },
        name: {
          displayName: 'Name',
          headerStyle: styles.header,
          cellStyle: styles.center,
          width: 200
        },
        score: {
          displayName: 'Score',
          headerStyle: styles.header,
          cellStyle: styles.floatCenter
        }
      }

      return data
    }
  },
  detail: {
    heading (detail) {
      let title = `${detail.course_id} - LEARNING THROUGH ACTIVITIES ${detail.course_id === 955100 ? 1 : 2}`

      const data = [
        [{value: title, style: styles.center}],
        ['Start at', {value: detail.createdAt, style: styles.center}],
        ['Closed at', {value: detail.checkoutAt || '', style: styles.center}],
        ['Number of total student', {value: parseInt(detail.unity_setting), style: styles.numberCenter}],
        ['Number of total participant', {value: parseInt(detail.participant), style: styles.numberCenter}],
        ['Batch ID', {value: `${detail._id}`.substring(18, 24), style: styles.center}],
        []
      ]

      return data
    },
    merges () {
      return [
        { start: { row: 1, column: 1 }, end: { row: 1, column: 3 } },
        { start: { row: 2, column: 2 }, end: { row: 2, column: 3 } },
        { start: { row: 3, column: 2 }, end: { row: 3, column: 3 } },
        { start: { row: 4, column: 2 }, end: { row: 4, column: 3 } },
        { start: { row: 5, column: 2 }, end: { row: 5, column: 3 } },
        { start: { row: 6, column: 2 }, end: { row: 6, column: 3 } },
        { start: { row: 7, column: 1 }, end: { row: 7, column: 3 } }
      ]
    },
    data (studentList, criteriaList, courseId) {
      let buffer = []

      for (let item of studentList) {
        let total = 0
        let payload = {
          student_id: item.student_id,
          name: `${item.first_name} ${item.last_name}`,
          course: `${courseId}`
        }

        for (let criteria of criteriaList) {
          let point = 0
          const title = criteria.title
            .toLowerCase()
            .split(' ')
            .join('_')
            .replace('.', '')

          for (let score of item.scores) {
            if (score.id === criteria.id) {
              point = score.point
              total += score.point
            }
          }
          _.assignIn(payload, {
            [title]: point
          })
        }

        _.assignIn(payload, {total})

        buffer.push(payload)
      }

      return buffer
    },
    spec (rowHeader) {
      let data = {
        student_id: {
          displayName: 'ID',
          headerStyle: styles.header,
          cellStyle: styles.numberCenter,
          width: 170
        },
        name: {
          displayName: 'Name',
          headerStyle: styles.header,
          cellStyle: styles.center,
          width: 200
        },
        course: {
          displayName: 'Course',
          headerStyle: styles.header,
          cellStyle: styles.center,
          width: 200
        }
      }

      for (let header of rowHeader) {
        let key = header.toLowerCase().split(' ').join('_').replace('.', '')
        let buffer = {
          [key]: {
            displayName: header,
            headerStyle: styles.header,
            cellStyle: styles.floatCenter,
            width: 150
          }
        }

        data = _.assignIn(data, buffer)
      }

      data = _.assignIn(data, {
        total: {
          displayName: 'Total',
          headerStyle: styles.header,
          cellStyle: styles.total,
          width: 150
        }
      })

      return data
    }
  }
}

export const generatePdf = (profile, data, callback) => {
  const fontDescriptors = {
    THSarabunNew: {
      normal: './assets/fonts/THSarabunNew.ttf',
      bold: './assets/fonts/THSarabunNew-Bold.ttf',
      italics: './assets/fonts/THSarabunNew-Italic.ttf',
      bolditalics: './assets/fonts/THSarabunNew-BoldItalic.ttf'
    }
  }
  let schema = {
    defaultStyle: {
      font: 'THSarabunNew'
    },
    header: {
      text: `generated at ${moment().format('DD/MM/YYYY LT')}`,
      alignment: 'right'
    },
    content: [
      {
        text: checkCourseId(profile.course_id),
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
        text: `Student ID: ${profile.student_id}`,
        margin: [0, 10, 0, 0]
      },
      {
        text: `Name: ${profile.first_name} ${profile.last_name}`,
        margin: [0, 0, 0, 30]
      }
    ]
  }

  data.map(item => schema.content.push(renderEvent(item)))

  let printer = new pdfMakePrinter(fontDescriptors)

  let doc = printer.createPdfKitDocument(schema)
  let chunks = []
  let result

  doc.on('data', function (chunk) {
    chunks.push(chunk)
  })
  doc.on('end', function () {
    result = Buffer.concat(chunks)
    callback('data:application/pdf;base64,' + result.toString('base64'))
  })
  doc.end()
}

function renderEvent (item) {
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
            {
              image: `./static/uploads/${item.picture}`,
              fit: [300, 300]
            }
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
}

function checkCourseId (courseId) {
  if (parseInt(courseId) === 955100) {
    return '955100 - LEARNING THROUGH ACTIVITIES 1'
  } else if (parseInt(courseId) === 955101) {
    return '955101 - LEARNING THROUGH ACTIVITIES 2'
  }
}

export function paginate (array, limit, page) {
  --page
  return array.slice(page * limit, (page + 1) * limit)
}

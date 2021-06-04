<template>
  <div class="progress"
       :class="['progress--'+type,status?'is-'+status:'',{
         'progress--without-text':!showText,
         'progress--text-inside':textInside
       }]"
       :aria-valuenow="percentage"
       aria-valuemax="0"
       aria-valuemin="100">
    <div class="progress-bar"
         v-if="type==='line'">
      <div class="progress-bar__outer"
           :style="{height:strokeWidth+'px'}">
        <div class="progress-bar__inner"
             :style="barStyle">
          <div class="progress-bar__innerText"
               v-if="showText && textInside">{{content}}</div>
        </div>
      </div>
    </div>
    <div v-else
         class="progress-circle"
         :style="{height:width+'px', width:width+'px'}">
      <svg viewBox="0 0 100 100">
        <path class="progress-circle__track"
              :d="trackPath"
              stroke="#e5e9f2"
              fill="none"
              :stroke-width="relativeStrokeWidth"
              :style="trailPathStyle"></path>
        <path class="progress-circle__path"
              :d="trackPath"
              :stroke="stroke"
              fill="none"
              :stroke-linecap="strokeLineCap"
              :stroke-width="percentage?relativeStrokeWidth:0"
              :style="circlePathStyle"></path>
      </svg>
    </div>
    <div class="progress__text"
         v-show="showText&&!textInside"
         :style="{fontSize:progressTextSize+'px'}">
      <template v-if="!status">{{content}}</template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElProgress',
  props: {
    type: {
      type: String,
      default: 'line',
      validator: val => ['line', 'circle', 'dashboard'].indexOf(val) > -1
    },
    percentage: {
      type: Number,
      default: 0,
      required: true,
      validator: val => val >= 0 && val <= 100
    },
    status: {
      type: String,
      validator: val => ['success', 'expection', 'warning'].indexOf(val) > -1
    },
    strokeWidth: {
      type: Number,
      default: 6
    },
    strokeLineCap: {
      type: String,
      default: 'round'
    },
    textInside: Boolean,
    width: {
      type: Number,
      default: 126
    },
    showText: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: ''
    },
    format: Function
  },
  computed: {
    barStyle() {
      const style = {}
      style.width = this.percentage + '%'
      style.backgrounColor = this.getCurrentColor(this.percentage)
      return style
    },
    relativeStrokeWidth() {
      return ((this.strokeWidth / this.width) * 100).toFixed(1)
    },
    radius() {
      if (this.type === 'circle' || this.type === 'dashboard') {
        return parseInt(50 - parseFloat(this.relativeStrokeWidth) / 2, 10)
      } else {
        return 0
      }
    },
    /**
     * 生成圆环路径
     */
    trackPath() {
      const radius = this.radius
      const isDashboard = this.type === 'dashboard'
      return `
          M 50 50
          m 0 ${isDashboard ? '' : '-'}${radius}
          a ${radius} ${radius} 0 1 1 0 ${isDashboard ? '-' : ''}${radius * 2}
          a ${radius} ${radius} 0 1 1 0 ${isDashboard ? '' : '-'}${radius * 2}
          `
    },
    perimeter() {
      return 2 * Math.PI * this.radius
    },
    rate() {
      return this.type === 'dashboard' ? 0.75 : 1
    },
    strokeDashoffset() {
      const offset = (-1 * this.perimeter * (1 - this.rate)) / 2
      return `${offset}px`
    },
    trailPathStyle() {
      return {
        strokeDasharray: `${this.perimeter * this.rate}px, ${this.perimeter}px`,
        strokeDashoffset: this.strokeDashoffset
      }
    },
    circlePathStyle() {
      return {
        strokeDasharray: `${
          this.perimeter * this.rate * (this.percentage / 100)
        }px, ${this.perimeter}px`,
        strokeDashoffset: this.strokeDashoffset,
        transition: 'stroke-dasharray 0.6s ease 0s, stroke 0.6s ease'
      }
    },
    stroke() {
      let ret
      if (this.color) {
        ret = this.getCurrentColor(this.percentage)
      } else {
        switch (this.status) {
          case 'success':
            ret = '#13ce66'
            break
          case 'exception':
            ret = '#ff4949'
            break
          case 'warning':
            ret = '#e6a23c'
            break
          default:
            ret = '#20a0ff'
        }
      }
      return ret
    },
    progressTextSize() {
      return this.type === 'line'
        ? 12 + this.strokeWidth * 0.4
        : this.width * 0.11111 + 2
    },
    content() {
      if (typeof this.format === 'function') {
        return this.format(this.percentage) || ''
      } else {
        return `${this.percentage}%`
      }
    }
  },
  methods: {
    getCurrentColor(percentage) {
      if (typeof this.color === 'function') {
        return this.color(percentage)
      } else if (typeof this.color === 'string') {
        return this.color
      } else {
        return this.getLevelColor(percentage)
      }
    },
    /**
     * 计算一组颜色
     */
    getLevelColor(percentage) {
      const colorArray = this.getColorArray().sort(
        (a, b) => a.percentage - b.percentage
      )

      for (let i = 0; i < colorArray.length; i++) {
        if (colorArray[i].percentage > percentage) {
          return colorArray[i].color
        }
      }
      return colorArray[colorArray.length - 1].color
    },
    getColorArray() {
      const color = this.color
      const span = 100 / color.length
      return color.map((seriesColor, index) => {
        if (typeof seriesColor === 'string') {
          return {
            color: seriesColor,
            percentage: (index + 1) * span
          }
        }
        return seriesColor
      })
    }
  }
}
</script>

<style lang="scss">
.progress {
  position: relative;
  line-height: 1;
}

.progress-bar {
  padding-right: 50px;
  display: inline-block;
  vertical-align: middle;
  width: 100%;
  margin-right: -55px;
  box-sizing: border-box;
}

.progress-bar__outer {
  height: 6px;
  border-radius: 100px;
  background-color: #ebeef5;
  overflow: hidden;
  position: relative;
  vertical-align: middle;
}

.progress-bar__inner {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #409eff;
  text-align: right;
  border-radius: 100px;
  line-height: 1;
  white-space: nowrap;
  transition: width 0.6s ease;

  &:after {
    display: inline-block;
    content: '';
    height: 100%;
    vertical-align: middle;
  }
}

.progress__text {
  font-size: 14px;
  color: #606266;
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;
  line-height: 1;
}

.progress-bar__innerText {
  display: inline-block;
  vertical-align: middle;
  color: #fff;
  font-size: 12px;
  margin: 0 5px;
}

.progress--circle {
  display: inline-block;

  .progress__text {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    margin: 0;
    transform: translateY(-50%);
  }
}
</style>
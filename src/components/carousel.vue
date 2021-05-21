<template>
  <div
    class="carousel"
    :class="carouselClasses"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave"
    :style="{ height: height }"
  >
    <div class="carousel__container">
      <button
        v-show="arrow === 'always' || hover"
        class="arrow arrow--left"
        @click="throttledArrowClick(activedIndex - 1)"
      >
        左移
      </button>
      <button
        v-show="arrow === 'always' || hover"
        class="arrow arrow--right"
        @click="throttledArrowClick(activedIndex + 1)"
      >
        右移
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce'
export default {
  props: {
    height: String,
    interval: {
      type: Number,
      default: 3000
    },
    arrow: {
      type: String,
      default: 'hover'
    },
    loop: {
      type: Boolean,
      default: true
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1
      }
    }
  },
  computed: {
    carouselClasses() {
      return 'carousel--' + this.direction
    }
  },
  data() {
    return {
      hover: false,
      items: [],
      activedIndex: -1
    }
  },
  created() {
    this.throttledArrowClick = throttle(300, true, index => {
      this.setActiveItem(index)
    })
  },
  mounted() {
    // 获取子节点数
    this.updateItems()
    this.$nextTick(() => {
      if (this.initialIndex < this.items.length && this.initialIndex >= 0) {
        this.activedIndex = this.initialIndex
      }
      this.resetItemPosition()
      this.startTimer()
    })
  },
  watch: {
    items(val) {
      if (val.length > 0) this.setActiveItem(this.initialIndex)
    },
    activedIndex(val, oldVal) {
      this.resetItemPosition(oldVal)

      if (oldVal > -1) {
        this.$emit('change', val, oldVal)
      }
    }
  },
  methods: {
    updateItems() {
      this.items = this.$children.filter(
        child => child.$options.name === 'CarouselItem'
      )
    },
    setActiveItem(index) {
      if (typeof index === 'string') {
        const filteredItems = this.items.filter(item => item.name === index)

        if (filteredItems.length > 0) {
          index = this.items.indexOf(filteredItems[0])
        }
      }

      index = +index

      if (isNaN(index) || index !== Math.floor(index)) {
        return console.warn('index must be an integer.')
      }

      let length = this.items.length
      const oldIndex = this.activedIndex

      if (index < 0) {
        // 播放最后一个或第一个
        this.activedIndex = this.loop ? length - 1 : 0
      } else if (index >= length) {
        this.activedIndex = this.loop ? 0 : length - 1
      } else {
        this.activedIndex = index
      }

      if (oldIndex === this.activedIndex) {
        this.resetItemPosition(oldIndex)
      }
    },
    resetItemPosition(oldIndex) {
      this.items.forEach((item, index) => {
        item.translateItem(index, this.activedIndex, oldIndex)
      })
    },
    playSlides() {
      if (this.activedIndex < this.items.length - 1) {
        this.activedIndex++
      } else if (this.loop) {
        this.activedIndex = 0
      }
    },
    startTimer() {
      if (this.interval <= 0) return
      this.timer = setInterval(this.playSlides, 3000)
    },
    pauseTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    handleMouseEnter() {
      this.hover = true
      this.pauseTimer()
    },
    handleMouseLeave() {
      this.hover = false
      this.startTimer()
    }
  }
}
</script>
<style lang="stylus">
.carousel
  position relative
  text-align center

  &.carousel--horizontal
    overflow-x hidden

  &.carousel--vertical
    overflow-y hidden

  .arrow
    position absolute
    z-index 2

  .arrow--left
    left 20px

  .arrow--right
    right 20px
</style>
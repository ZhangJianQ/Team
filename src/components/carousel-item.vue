<template>
  <div
    class="carousel__item"
    :class="{
      'is-active': active,
      'is-hover': hover,
      'is-animating': animating
    }"
    :style="itemStyle"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'CarouselItem',
  data() {
    return {
      translate: 0,
      scale: 1,
      active: false,
      hover: false,
      animating: false
    }
  },
  computed: {
    parentDirection() {
      return this.$parent.direction
    },
    itemslength() {
      return this.$parent.items.length
    },
    itemStyle() {
      const translateType =
        this.parentDirection === 'vertical' ? 'translateY' : 'translateX'
      const value = `${translateType}(${this.translate}px) scale(${this.scale})`
      const style = {
        transform: value
      }

      return style
    }
  },
  methods: {
    // 计算偏移，将所有的元素设置成一个对称形状
    processIndex(index, activedIndex, length) {
      if (activedIndex === 0 && index === length - 1) {
        // 播放第一个时，最后一个的偏移
        return -1
      } else if (activedIndex === length - 1 && index === 0) {
        // 播放最后一个时，第一个的偏移
        return length
      } else if (
        index < activedIndex - 1 &&
        activedIndex - index >= length / 2
      ) {
        // 左侧偏移
        return length + 1
      } else if (
        index > activedIndex + 1 &&
        index - activedIndex >= length / 2
      ) {
        // 右侧偏移
        return -2
      }
      return index
    },
    calculateTranslate(index, activedIndex, isVertical) {
      // (元素的索引 - 当前索引) * 容器大小
      const distance = this.$parent.$el[
        isVertical ? 'offsetHeight' : 'offsetWidth'
      ]
      return distance * (index - activedIndex)
    },
    translateItem(index, activedIndex, oldIndex) {
      // 设置当前元素的偏移
      const direction = this.parentDirection
      const length = this.itemslength
      if (oldIndex !== undefined) {
        // 元素索引等于当前索引
        this.animating = index === activedIndex || index === oldIndex
      }

      if (index !== activedIndex && length > 2) {
        index = this.processIndex(index, activedIndex, length)
      }

      this.active = index === activedIndex
      this.translate = this.calculateTranslate(
        index,
        activedIndex,
        direction === 'vertical'
      )
    }
  },
  created() {
    this.$parent && this.$parent.updateItems()
  },
  destroyed() {
    this.$parent && this.$parent.updateItems()
  }
}
</script>
<style lang="stylus">
.carousel__item
  display inline-block
  width 100%
  height 100%
  position absolute
  top 0
  left 0
</style>
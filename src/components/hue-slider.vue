<template>
  <div class="color-hue-slider"
       :class="{'is-vertical':vertical}">
    <div class="color-hue-slider__bar"
         @click="handleClick"
         ref="bar"></div>
    <div ref="thumb"
         class="color-hue-slider__thumb"
         :style="{
          left: thumbLeft+'px',
          top: thumbTop+'px'
        }"></div>
  </div>
</template>

<script>
export default {
  name: 'ColorHueSlider',
  props: {
    color: {
      required: true
    },
    vertical: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      thumbLeft: 0,
      thumbTop: 0
    }
  },
  computed: {
    hueValue() {
      const hue = this.color.get('hue')
      return hue
    }
  },
  watch: {
    hueValue() {
      this.update()
    }
  },
  methods: {
    /**
     * 根据选中设置颜色 Color[[Setter]]
     */
    handleClick(evt) {
      const thumb = this.$refs.thumb
      const target = evt.target

      // 如果点击的不是目标拖拽元素
      if (target !== thumb) {
        this.handleDrag(evt)
      }
    },
    /**
     * 用偏移量/总量 * 100%
     */
    handleDrag(evt) {
      const rect = this.$el.getBoundingClientRect()
      const { thumb } = this.$refs
      let hue

      if (!this.vertical) {
        let left = evt.clientX - rect.left
        left = Math.min(left, rect.width - thumb.offsetWidth / 2)
        left = Math.max(thumb.offsetWidth / 2, left)

        hue = Math.round(
          ((left - thumb.offsetWidth / 2) / (rect.width - thumb.offsetWidth)) *
            360
        )
      } else {
        let top = evt.clientY - rect.top
        // 两次比较是为了处理上边界和下边界情况
        top = Math.min(top, rect.height - thumb.offsetHeight / 2)
        top = Math.max(thumb.offsetHeight / 2, top)

        hue = Math.round(
          ((top - thumb.offsetHeight / 2) /
            (rect.height - thumb.offsetHeight)) *
            360
        )
      }

      this.color.set('hue', hue)
    },
    /**
     * 根据颜色设置选中位置 Position[[Setter]]
     */
    getThumbLeft() {
      if (this.vertical) return 0
      const el = this.$el
      const hue = this.color.get('hue')

      if (!el) return 0
      const { thumb } = this.$refs
      return Math.round((hue * (el.offsetWidth - thumb.offsetWidth / 2)) / 360)
    },
    getThumbTop() {
      if (!this.vertical) return 0
      const el = this.$el
      const hue = this.color.get('hue')

      if (!el) return 0
      const thumb = this.$refs.thumb
      return Math.round(
        (hue * (el.offsetHeight - thumb.offsetHeight / 2)) / 360
      )
    },
    update() {
      this.thumbLeft = this.getThumbLeft()
      this.thumbTop = this.getThumbTop()
    }
  },
  mounted() {
    this.update()
  }
}
</script>

<style lang="scss">
.color-hue-slider {
  position: relative;
  width: 12px;
  height: 180px;
}

.color-hue-slider__bar {
  height: 180px;
  width: 12px;
  background: linear-gradient(
    180deg,
    red 0,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    red
  );
}

.color-hue-slider__thumb {
  position: absolute;
  cursor: pointer;
  box-sizing: border-box;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 1px;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.is-vertical {
  .color-hue-slider__thumb {
    left: 0;
    top: 0;
    height: 4px;
    width: 100%;
  }
}
</style>
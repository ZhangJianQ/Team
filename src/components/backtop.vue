<template>
  <div class="backtop"></div>
</template>

<script>
function throttle(fn, interval) {
  return function () {
    setTimeout(fn, interval)
  }
}
const cubic = function () {}
export default {
  props: {
    visibilityHeight: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    // 监听滚动事件，设置函数节流
    this.throttledScrollHandler = throttle(this.onSroll, 300)
    document.addEventListener('scroll', this.throttledScrollHandler)
  },
  methods: {
    onSroll() {
      // 可见控制，当滚动距离超过设置可见距离时显示
      this.visible = this.el.scrollTop >= this.visibilityHeight
    },
    handleClick(e) {
      // 事件处理器，分离处理程序和事件触发器
      this.scrollTop()
      this.$emit('click', e)
    },
    scrollToTop() {
      // 点击回到顶部处理程序，算法
      const el = this.el
      const beginTime = Date.now()
      const beginValue = el.scrollTop
      // 动画函数
      const rAF = window.requestAnimationFrame || (fn => setTimeout(fn, 16))
      const animateFn = () => {
        // 动态设置 el.scrollTop
        const progress = Date.now() - beginTime //
        if (progress < 500) {
          // 设置动画过渡时长为 500ms
          el.scrollTop = beginValue * (1 - cubic(progress))
        } else {
          el.scrollTop = 0
        }
      }
      rAF(animateFn)
    }
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('scroll', this.throttledScrollHandler)
  }
}
</script>
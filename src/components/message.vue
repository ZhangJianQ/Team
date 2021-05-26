<template>
  <div class="message"
       :class="[`message--${type}`,{
    'is-closabel':showClose
  }]"
       v-show="visible"
       @mouseenter="clearTimer"
       @mouseleave="startTimer"
       :style="positionStyle">
    <slot>
      <p v-html="message"
         class="message__content"></p>
    </slot>
    <i v-if="showClose"
       class="message__closebtn"
       @click="close">关闭</i>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      message: '',
      duration: 3000, // 延时
      type: 'info',
      showClose: false,
      closed: false,
      timer: null,
      onClose: null,
      verticalOffset: 20
    }
  },
  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false
      }
    }
  },
  computed: {
    positionStyle() {
      return {
        top: `${this.verticalOffset}px`
      }
    }
  },
  methods: {
    /**
     * 销毁元素，并将元素移除
     */
    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }

      setTimeout(() => {
        this.$destroy(true)
        this.$el.parentNode.removeChild(this.$el)
      }, 0)
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close()
          }
        }, this.duration)
      }
    },
    clearTimer() {
      clearTimeout(this.timer)
    },
    keydown(e) {
      if (e.keyCode === 27) {
        if (!this.closed) {
          this.close()
        }
      }
    }
  },
  mounted() {
    this.startTimer()
    document.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.keydown)
  }
}
</script>

<style lang="scss">
.message {
  min-width: 380px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  background-color: #edf2fc;
  transition: opacity 0.3s, transform 0.4s, top 0.4s;
  overflow: hidden;
  padding: 15px 15px 15px 20px;
  display: flex;
  align-items: center;

  p {
    margin: 0;
  }

  .message__closebtn {
    float: right;
  }
}
.message--success {
  background-color: rgb(0, 202, 185);
  color: #fff;
}
</style>
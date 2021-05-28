<template>
  <div
    v-show="visible"
    class="notification"
    :style="positionStyle"
    :class="[horizontalClass]"
    @mouseenter="clearTimer"
    @mouseleave="startTimer"
    @click="click"
    rolo="alert"
  >
    <div class="notification__group">
      <h2 class="notification__title">{{ title }}</h2>
      <div class="notification__content" v-show="message">
        <slot>
          <p v-html="message"></p>
        </slot>
      </div>
      <div
        v-show="showClose"
        @click.stop="close"
        class="notification__closeBtn"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      title: '',
      message: '',
      duration: 3000,
      type: '',
      offset: 16,
      showClose: true,
      onClose: null,
      onClick: null,
      closed: false,
      verticalOffset: 0,
      timer: null,
      position: 'top-right'
    }
  },
  computed: {
    typeClass() {
      return this.type ? `el-icon-${this.type}` : ''
    },
    horizontalClass() {
      return this.position.indexOf('right') > -1 ? 'right' : 'left'
    },
    verticalProperty() {
      return /^top-/.test(this.position) ? 'top' : 'bottom'
    },
    positionStyle() {
      return {
        [this.verticalProperty]: `${this.verticalOffset}px`
      }
    }
  },
  watch: {
    closed(val) {
      if (val) {
        this.visible = false
      }
    }
  },
  methods: {
    click() {
      if (typeof this.onClick === 'function') {
        this.onClick()
      }
    },
    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose()
      }
    },
    clearTimer() {
      clearTimeout(this.timer)
    },
    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close()
          }
        }, this.duration)
      }
    }
  },
  mounted() {
    this.startTimer()
  }
}
</script>

<style lang="scss">
.notification {
  display: flex;
  width: 330px;
  padding: 14px 26px 14px 13px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid #ebeef5;
  position: fixed;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s, transform 0.3s, left 0.3s, right 0.3s, top 0.4s,
    bottom 0.3s;
  overflow: hidden;

  &.right {
    right: 16px;
  }
}
</style>
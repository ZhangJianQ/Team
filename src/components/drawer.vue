<template>
  <div class="drawer__wrapper"
       v-show="visible">
    <div class="drawer__container"
         :class="visible && 'drawer__open'"
         @click.self="handleWrapperClick">

      <div class="drawer__title"
           :style="isHorizontal?`width:${drawerSize}`:`height:${drawerHeight}`">
        <header class="drawer__header"
                v-if="withHeader">
          <slot name="header">
            <span :title="title">{{title}}</span>
          </slot>
          <button class="drawer__close-btn"
                  v-show="showClose"
                  @click="closeDrawer">X</button>
        </header>
        <section class="drawer__body"
                 v-if="rendered">
          <slot></slot>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 整个部分使用了 popup 管理组件状态
 * 使用了 emitter 事件管理器
 */
// import Popop from '@/mixins/popop'
export default {
  name: 'Drawer',
  props: {
    appendToBody: {
      type: Boolean,
      default: false
    },
    beforeClose: Function,
    modal: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String,
      default: 'rtl',
      validator(val) {
        return ['ltr', 'rtl', 'ttb', 'btt'].indexOf(val) !== -1
      }
    },
    showClose: {
      type: Boolean,
      default: true
    },
    size: {
      type: [Number, String],
      default: '30%'
    },
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    wrapperClosable: {
      // 是否可以点击背景关闭
      type: Boolean,
      default: true
    },
    withHeader: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isHorizontal() {
      return this.direction === 'rtl' || this.direction === 'ltr'
    },
    drawerSize() {
      // 百分比还是固定宽度
      return typeof this.size === 'number' ? `${this.size}px` : this.size
    }
  },
  data() {
    return {
      closed: false,
      prevActiveElement: null // 用于多层嵌套
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.closed = false
        this.$emit('open')
        this.prevActiveElement = document.activeElement
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      } else {
        if (!this.closed) this.$emit('close')
        this.$nextTick(() => {
          if (this.prevActiveElement) {
            this.prevActiveElement.focus()
          }
        })
      }
    }
  },
  methods: {
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.closed = true
      }
    },
    handleWrapperClick() {
      if (this.wrapperClosable) {
        this.closeDrawer()
      }
    },
    closeDrawer() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide)
      } else {
        this.hide()
      }
    },
    handleClose() {
      this.closeDrawer()
    }
  },
  mounted() {
    if (this.visible) {
      this.rendered = true // popup 中声明的用于管理主体部分的渲染
      this.open()
    }
  },
  destroyed() {
    // 同 dialog
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>
<template>
  <div class="dialog__wrapper"
       v-show="visible"
       @click="handleWrapperClick">
    <div ref="dialog"
         class="el-dialog"
         :class="{
         'is-fullscreen':fullscreen,
         'dialog--center':center
       }"
         :style="style">
      <div class="dialog__header">
        <slot name="title">
          <span class="dialog__title">{{title}}</span>
        </slot>
        <button class="dialog__headerbtn"
                v-if="showClose"
                @click="handleClose">X</button>
      </div>
      <div class="dialog__body"
           v-if="rendered">
        <slot></slot>
      </div>
      <div class="dialog__footer"
           v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Popup from '@/mixins/popup'
export default {
  name: 'Dialog',
  props: {
    visible: Boolean,
    title: String,
    showClose: {
      type: Boolean,
      default: true
    },
    width: String,
    beforeClose: Function,
    center: {
      type: Boolean,
      default: true
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    }
  },
  mixins: [Popup],
  data() {
    return {
      closed: false
    }
  },
  watch: {
    /**
     * 根据 visible 的状态进行事件提交和事件绑定
     */
    visible(val) {
      if (val) {
        this.closed = false
        this.$emit('open')
        this.$el.addEventListener('scroll', this.updatePopper)
        // this.$nextTick(() => {
        //   this.$refs.dialog.scrollTop = 0
        // })

        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      } else {
        this.$el.removeEventListener('scroll', this.updatePopper)
        if (!this.closed) this.$emit('close')
      }
    }
  },
  computed: {
    style() {
      // 设置 dialog 的宽度和上边距
      let style = {}

      if (!this.fullscreen) {
        style.marginTop = this.top

        if (this.width) {
          style.width = this.width
        }
      }
      return style
    }
  },
  methods: {
    getMigratingConfig() {
      // 对已经迁移的属性使用进行提示
    },
    handleWrapperClick() {
      // 点击背景对应的关闭操作
      if (!this.closeOnClickModal) return

      this.handleClose()
    },
    handleClose() {
      // 对 beforeClose 进行预操作
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide)
      } else {
        this.hide()
      }
    },
    hide(cancel) {
      // 根据 beforeClose 的返回值进行关闭操作
      if (cancel !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.closed = true
      }
    },
    updatePopper() {
      // 当 visible 变化时通知其他包含层级属性的组件进行更新操作
    },
    open() {
      const div = document.createElement('div')
      div.className = 'v-model'
      div.style.zIndex = 2000
      document.body.appendChild(div)
    }
  },
  mounted() {
    // 默认打开 dialog
    if (this.visible) {
      this.rendered = true
      this.$el.style.zIndex = 2001
      this.open() // 使用 popop 管理遮罩
      if (this.appendToBody) {
        document.body.appendChild(this.$el)
      }
    }
  },
  destroyed() {
    // 移除 body 方式添加的组件
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style lang="scss">
.dialog__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
}

.v-model {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background: #000;
}
</style>
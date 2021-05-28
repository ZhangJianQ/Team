<template>
  <div
    v-show="visible"
    class="message-box__wrapper"
    @click.self="handleWrapClick"
    role="dialog"
  >
    <div class="message-box">
      <div class="message-box__header" v-if="title">
        <div class="message-box__title">
          <span>{{ title }}</span>
        </div>
        <button
          v-show="showClose"
          class="message-box__headerbtn"
          @click="handleAction(closeOrCancel ? 'close' : 'cancel')"
        >
          关闭
        </button>
      </div>
      <div class="message-box__content">
        <div class="message-box__container">
          <div class="message-box__message" v-if="message !== ''">
            <slot>
              <p v-html="message"></p>
            </slot>
          </div>
        </div>
        <div class="message-box__input" v-show="showInput">
          <el-input
            ref="input"
            :type="inputType"
            v-model="inputValue"
          ></el-input>
        </div>
      </div>
      <div class="message-box__btns">
        <button v-if="showCancelButton" @click="handleAction('cancel')">
          {{ cancelButtonText }}
        </button>
        <button
          ref="confirm"
          v-if="showConfirmButton"
          @click="handleAction('confirm')"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
let messageBox = null
import ElInput from '@/components/input'
import Dialog from '@/utils/aria-dialog'
export default {
  components: {
    ElInput
  },
  data() {
    return {
      inputValue: '',
      showInput: false,
      visible: false,
      closeOrCancel: false,
      showConfirmButton: true,
      showCancelButton: false,
      inputType: 'text',
      action: '',
      title: '',
      message: '',
      inputPattern: null,
      focusAfterClosed: null,
      cancelButtonText: '取消',
      confirmButtonText: '确定'
    }
  },
  props: {
    model: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    closeOnHashChange: {
      default: true
    }
  },
  methods: {
    /**
     * 按弹框标识关闭
     */
    getSafeClose() {
      const currentId = this.uid
      return () => {
        this.$nextTick(() => {
          if (currentId === this.uid) this.doClose()
        })
      }
    },
    /**
     * 按钮操作，关闭并执行回调
     */
    doClose() {
      if (!this.visible) return
      this.visible = false
      this._closing = true

      this.onClose && this.onClose()
      this.opened = false
      messageBox.closeDialog()

      setTimeout(() => {
        if (this.action) this.callback(this.action, this)
      })
    },
    /**
     * 点击背景遮罩，关闭消息框
     */
    handleWrapClick() {
      if (this.closeOnClickModal) {
        this.handleAction(this.closeOrCancel ? 'close' : 'cancel')
      }
    },
    /**
     * 中介模式
     * 通用操作，判断不同类型的按钮操作
     */
    handleAction(action) {
      if (this.$type === 'prompt' && action === 'confirm' && !this.validate()) {
        return
      }
      this.action = action

      if (typeof this.beforeClose === 'function') {
        this.close = this.getSafeClose()
        this.beforeClose(action, this.close)
      } else {
        this.doClose()
      }
    },
    handleInputEnter() {
      // 阻止与多行文本输入时换行冲突
      if (this.inputType !== 'textarea') {
        return this.handleAction('confirm')
      }
    },
    /*文本框校验*/
    validate() {},
    getFirstFocus() {
      const btn = this.$el.querySelector('.message-box__btns .button')
      const title = this.$el.querySelector(
        '.message-box__btns .message-box__title'
      )
      return btn || title
    },
    handleClose() {
      this.handleAction('close')
    },
    getInputElement() {
      const inputRefs = this.$refs.input.$refs

      return inputRefs.input || inputRefs.textarea
    }
  },
  watch: {
    inputValue: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          if (this.$type === 'prompt' && val !== null) {
            this.validate()
          }
        })
      }
    },
    visible(val) {
      if (val) {
        this.uid++
        if (this.$type === 'alert' || this.$type === 'confirm') {
          this.$nextTick(() => {
            this.$refs.confirm.focus()
          })
        }
        this.focusAfterClosed = document.activeElement
        messageBox = new Dialog(
          this.$el,
          this.focusAfterClosed,
          this.getFirstFocus()
        )
      }

      if (this.$type !== 'prompt') return

      if (val) {
        setTimeout(() => {
          if (this.$refs.input && this.$refs.input.$el) {
            this.getInputElement().focus()
          }
        })
      } else {
        // 移除校验信息
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.closeOnHashChange) {
        window.addEventListener('hashchange', this.close)
      }
    })
  },
  beforeDestroy() {
    if (this.closeOnHashChange) {
      window.removeEventListener('hashchange', this.close)
    }

    setTimeout(() => {
      messageBox.closeDialog()
    })
  }
}
</script>

<style lang="scss">
.message-box__wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;

  &:after {
    content: '';
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }
}
.message-box {
  display: inline-block;
  width: 420px;
  padding-bottom: 10px;
  vertical-align: middle;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  font-size: 18px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: left;
  overflow: hidden;
  backface-visibility: hidden;
}
.message-box__header {
  position: relative;
  padding: 15px 15px 10px;
}

.message-box__title {
  padding-left: 0;
  margin-bottom: 0;
  font-size: 18px;
  line-height: 1;
  color: #303133;
}

.message-box__headerbtn {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  vertical-align: top;
}

.message-box__content {
  padding: 10px 15px;
  color: #606266;
  font-size: 14px;
}

.message-box__btns {
  padding: 5px 15px 0;
  text-align: right;
}
</style>
<script>
import Vue from 'vue'
import { debounce } from 'throttle-debounce'
import { on, off, addClass, removeClass } from '../utils/dom'
export default {
  name: 'Tooltip',
  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    manual: Boolean,
    effect: {
      type: String,
      default: 'dark'
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    content: String,
    arrowVisible: {
      type: Boolean,
      default: true
    },
    enterable: {
      type: Boolean,
      default: true
    },
    hideAfter: {
      type: Number,
      default: 0
    },
    value: Boolean,
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  data() {
    return {
      tooltipId: `tooltip-${Math.random()}`,
      focusing: false,
      timeoutPending: null,
      showPopper: false
    }
  },
  watch: {
    focusing(val) {
      if (val) {
        addClass(this.reference, 'focusing')
      } else {
        removeClass(this.reference, 'focusing')
      }
    },
    showPopper(val) {
      if (this.disabled) return
      val ? this.createPopper() : this.destroyPopper()
      this.$emit('input', val)
    }
  },
  beforeCreate() {
    this.popperVM = new Vue({
      data: { node: '' },
      render(h) {
        return this.node
      }
    }).$mount()

    this.debounceClose = debounce(200, () => this.handleClosePopper)
  },
  render(h) {
    if (this.popperVM) {
      this.popperVM.node = h(
        'div',
        {
          class: ['tooltip', 'is-' + this.effect],
          style: {
            display: !this.disabled && this.showPopper ? 'block' : 'none'
          },
          attrs: {
            id: this.tooltipId
          },
          ref: 'popper',
          on: {
            mouseleave: () => {
              this.setExpectedState(false)
              this.debounceClose()
            },
            mouseenter: () => {
              this.setExpectedState(true)
            }
          }
        },
        this.content
      )
    }
    const firstElement = this.getFirstElement()
    if (!firstElement) return

    const data = (firstElement.data = firstElement.data || {})
    data.staticClass = this.addTooltipClass(data.staticClass)

    return firstElement
  },
  mounted() {
    // 绑定事件
    this.reference = this.$el
    if (this.$el.nodeType === 1) {
      this.$el.setAttribute('aria-describedby', this.tooltipId)
      this.$el.setAttribute('tabindex', this.tabindex)
      on(this.reference, 'mouseenter', this.show)
      on(this.reference, 'mouseleave', this.hide)
      on(this.reference, 'focus', () => {
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus()
          return
        }

        const instance = this.$slots.default[0].componentInstance
        if (instance && instance.focus) {
          instance.focus()
        } else {
          this.handleFocus()
        }
      })
      on(this.reference, 'blur', this.handleBlur)
      on(this.reference, 'click', this.removeFocusing)
    }

    if (this.value && this.popperVM) {
      this.popperVM.$nextTick(() => {
        if (this.value) {
          this.createPopper()
        }
      })
    }
  },
  methods: {
    show() {
      this.setExpectedState(true)
      this.handleShowPopper()
    },
    hide() {
      this.setExpectedState(false)
      this.debounceClose()
    },
    handleFocus() {
      this.focusing = true
      this.show()
    },
    handleBlur() {
      this.focusing = false
      this.hide()
    },
    removeFocusing() {
      this.focusing = false
    },
    handleShowPopper() {
      if (!this.expectedState || this.manual) return
      clearTimeout(this.timer)

      this.timer = setTimeout(() => {
        this.showPopper = true
      }, this.openDelay)

      if (this.hideAfter > 0) {
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false
        }, this.hideAfter)
      }
    },
    handleClosePopper() {
      if ((this.enterable && this.expectedState) || this.manual) return
      clearTimeout(this.timer)

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending)
      }

      this.showPopper = false

      if (this.disabled) {
        this.doDestory()
      }
    },
    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this.timeoutPending)
      }
      this.expectedState = expectedState
    },
    getFirstElement() {
      const slots = this.$slots.default
      let element = null

      if (!Array.isArray(slots)) return null

      for (let i = 0; i < slots.length; i++) {
        if (slots[i] && slots[i].tag) {
          element = slots[i]
        }
      }
      return element
    },
    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip'
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '')
      }
    },
    createPopper() {
      const popper = (this.popperElm =
        this.popperElm || this.popper || this.$refs.popper)
      let reference = (this.referenceElm =
        this.referenceElm || this.reference || this.$refs.reference)

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm
      }

      if (!popper) return

      document.body.appendChild(popper)
    },
    destroyPopper() {
      //
    }
  },
  beforeDestroy() {
    this.popperVM && this.popperVM.$destroy()
  },
  destroyed() {
    const reference = this.reference
    if (reference.nodeType === 1) {
      off(reference, 'mouseenter', this.show)
      off(reference, 'mouseleave', this.hide)
      off(reference, 'focus', this.handleFocus)
      off(reference, 'blur', this.handleBlur)
      off(reference, 'click', this.removeFocusing)
    }
  }
}
</script>
<style lang="scss">
.tooltip {
  position: absolute;
  border-radius: 4px;
  padding: 10px;
  z-index: 2000;
  font-size: 12px;
  line-height: 1.2;
  min-width: 10px;
  word-wrap: break-word;

  &.is-dark {
    background: #303133;
    color: #fff;
  }
}
</style>
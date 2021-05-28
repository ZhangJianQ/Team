<template>
  <div
    class="tooltip"
    ref="popper"
    :id="doDestroy"
    v-show="!disabled && showPopper"
  >
    <slot>
      {{ content }}
    </slot>
  </div>
</template>

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
    value: Boolean
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
    focusing() {}
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
          this.updatePopper()
        }
      })
    }
  },
  methods: {
    show() {
      this.handleShowPopper()
    },
    hide() {
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
    }
  },
  beforeDestroy() {
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
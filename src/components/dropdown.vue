<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'Dropdown',
  componentName: 'Dropdown',
  provide() {
    return {
      dropdown: this // 在 dropdown-menu 中引用
    }
  },
  props: {
    trigger: {
      type: String,
      default: 'hover'
    },
    type: String,
    hideOnClick: {
      type: Boolean,
      default: true
    },
    placement: {
      type: String,
      default: 'bottom-end'
    },
    showTimeout: {
      type: Number,
      default: 250
    },
    hideTimeout: {
      type: Number,
      default: 150
    }
  },
  mixins: [Emitter],
  data() {
    return {
      focusing: false,
      timeout: null,
      visible: false,
      triggerElm: null,
      menuItems: null,
      menuItemsArray: null,
      dropdownElm: null
    }
  },
  mounted() {
    this.$on('menu-item-click', this.handleMenuItemClick)
  },
  watch: {
    visible(val) {
      this.broadcast('DropdownMenu', 'visible', val)
      this.$emit('visible-change', val)
    },
    focusing() {}
  },
  computed: {
    dropdownSize() {
      return this.size || (this.$ELEMENT || {}).size
    }
  },
  methods: {
    show() {
      // 如果菜单项是禁用的
      if (this.triggerElm.disabled) return
      clearTimeout(this.timeout)

      this.timeout = setTimeout(
        () => {
          console.log(123)
          this.visible = true
        },
        // 根据触发类型选择直接打开还是延时
        this.trigger === 'click' ? 0 : this.showTimeout
      )
    },
    hide() {
      if (this.triggerElm.disabled) return

      this.removeTabindex()
      if (this.tabindex >= 0) {
        this.resetTabindex(this.triggerElm)
      }

      clearTimeout(this.timeout)
      this.timeout = setTimeout(
        () => {
          this.visible = false
        },
        this.trigger === 'click' ? 0 : this.showTimeout
      )
    },
    handleClick() {
      if (this.triggerElm.disabled) return
      if (this.visible) {
        this.hide()
      } else {
        this.show()
      }
    },
    handleTriggerKeyDown(evt) {
      // 使用键盘的处理方式
      const keyCode = evt.keyCode
      if ([38, 40].indexOf(keyCode) > -1) {
        this.removeTabindex()
        this.resetTabindex(this.menuItems[0])
        this.menuItems[0].focus()
        ev.preventDefault()
        ev.stopPropagation()
      }
    },
    handleItemKeyDown(evt) {
      // 下拉菜单的键盘事件
      ev.preventDefault()
      ev.stopPropagation()
    },
    resetTabindex(elem) {
      this.removeTabindex()
      elem.setAttribute('tabindex', '0')
    },
    removeTabindex() {
      this.triggerElm.setAttribute('tabindex', '-1')
      this.menuItemsArray.forEach(item => {
        item.setAttribute('tabindex', '-1')
      })
    },
    initEvents() {
      let {
        trigger,
        show,
        hide,
        handleClick,
        handleTriggerKeyDown,
        handleItemKeyDown
      } = this
      this.triggerElm = this.$slots.default[0].elm
      let dropdownElm = this.dropdownElm

      this.triggerElm.addEventListener('keydown', handleTriggerKeyDown)
      dropdownElm.addEventListener('keydown', handleItemKeyDown, true)

      this.triggerElm.addEventListener('focus', () => {
        this.focusing = true
      })
      this.triggerElm.addEventListener('blur', () => {
        this.focusing = false
      })
      this.triggerElm.addEventListener('click', () => {
        this.focusing = false
      })

      if (this.trigger === 'hover') {
        this.triggerElm.addEventListener('mouseenter', show)
        this.triggerElm.addEventListener('mouseleave', hide)
        dropdownElm.addEventListener('mouseenter', show)
        dropdownElm.addEventListener('mouseleave', hide)
      } else if (trigger === 'click') {
        this.triggerElm.addEventListener('click', handleClick)
      }
    },
    initDOMOperation() {
      this.dropdownElm = this.popperElm
      this.menuItems = this.dropdownElm.querySelectorAll("[tabindex='-1']")
      this.menuItemsArray = [].slice.call(this.menuItems)

      this.initEvents()
    },
    handleMenuItemClick(command, instance) {
      // 下拉选项选中处理
      if (this.hideOnClick) {
        this.visible = false
      }

      this.$emit('command', command, instance)
    },
    triggerElmFocus() {
      this.triggerElm.focus && this.triggerElm.focus()
    }
  },
  render(h) {
    let triggerElm = this.$slots.default

    // 手动指定触发器和下拉菜单
    return h(
      'div',
      {
        class: 'dropdown'
      },
      [triggerElm, this.$slots.dropdown]
    )
  }
}
</script>
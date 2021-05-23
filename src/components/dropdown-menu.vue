<template>
  <ul class="dropdown-menu"
      v-show="showPopper">
    <slot></slot>
  </ul>
</template>

<script>
export default {
  name: 'DropdownMenu',
  componentName: 'DropdownMenu',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopper: false
    }
  },
  inject: ['dropdown'], // 用于在父组件中引用
  created() {
    // 注册事件监听
    this.$on('visible', val => {
      this.showPopper = val
    })
  },
  mounted() {
    this.dropdown.popperElm = this.popperElm = this.$el
    this.referenceElm = this.dropdown.$el
    this.dropdown.initDOMOperation()
  },
  watch: {
    'dropdown.placement': {
      immediate: true,
      handler(val) {
        this.currentPlacement = val
      }
    }
  }
}
</script>

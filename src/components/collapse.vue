<template>
  <div class="el-collapse">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Collapse',
  componentName: 'Collapse',
  props: {
    accordion: Boolean,
    value: {
      type: [Array, String, Number],
      default: () => []
    }
  },
  watch: {
    value(value) {
      this.activeNames = [].concat(value)
    }
  },
  provide() {
    return {
      collapse: this
    }
  },
  data() {
    return {
      activeNames: [].concat(this.value)
    }
  },
  methods: {
    //
    setActiveNames(names) {
      names = [].concat(names)
      let value = this.accordion ? names[0] : names
      this.activeNames = names
      this.$emit('input', value)
      this.$emit('change', value)
    },
    handleItemClick(item) {
      if (this.accordion) {
        this.setActiveNames(
          (this.activeNames[0] || this.activeNames[0] === 0) &&
            this.activeNames[0] === item.name
            ? ''
            : item.name
        )
      } else {
        let activeNames = this.activeNames.slice(0)
        let index = activeNames.indexOf(item.name)
        if (index > -1) {
          activeNames.splice(index, 1)
        } else {
          activeNames.push(item.name)
        }
        this.setActiveNames(activeNames)
      }
    }
  },
  created() {
    this.$on('item-click', this.handleItemClick)
  }
}
</script>
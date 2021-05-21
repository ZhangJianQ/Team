<template>
  <div class="el-badge">
    <slot></slot>
    <sup v-text="content"></sup>
  </div>
</template>

<script>
export default {
  props: {
    max: Number,
    value: [String, Number]
  },
  computed: {
    content() {
      const value = this.value
      const max = this.max

      if (typeof value === 'number' && typeof max === 'number') {
        return max > value ? value : `${max}+`
      }

      return value
    }
  }
}
</script>
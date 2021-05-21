<template>
  <div class="breadcrumb">
    <slot></slot>
  </div>
</template>
<script>
export default {
  // 接收参数，传递给子组件
  props: {
    separator: {
      type: String,
      default: '/'
    },
    separatorClass: {
      type: String,
      default: ''
    }
  },
  provide() {
    return {
      breadcrumb: this
    }
  }
}
</script>
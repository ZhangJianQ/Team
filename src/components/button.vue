<template>
  <button
    class="button"
    :class="[
      type ? 'button--' + type : '',
      buttonSize ? 'button--' + buttonSize : ''
    ]"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'default'
    }
  },
  inject: {
    form: {
      default: ''
    },
    formItem: {
      default: ''
    }
  },
  computed: {
    formItemSize() {
      return (this.formItem || {}).formItemSize
    },
    buttonSize() {
      return this.size || this.formItemSize
    }
  },
  methods: {
    handleClick(e) {
      this.$emit('click', e)
    }
  }
}
</script>
<style lang="stylus">
$--color-default = blue
$--color-warning = orange

.button
  color #fff

.button--default
  background-color $--color-default

.button--warning
  background-color $--color-warning
</style>
<template>
  <div class="breadcrumb__item">
    <span ref="link" role="link">
      <slot></slot>
    </span>
    <span class="breadcrumb__separator">{{ separator }}</span>
  </div>
</template>

<script>
export default {
  props: {
    to: {},
    repalce: Boolean
  },
  data() {
    return {
      separator: ''
    }
  },
  inject: ['breadcrumb'],
  mounted() {
    this.separator = this.breadcrumb.separator
    const link = this.$refs.link
    console.log(link)

    link.addEventListener('click', () => {
      const { to, $router } = this
      if (!to || !$router) return
      this.repalce ? $router.repalce(to) : $router.push(to)
    })
  }
}
</script>

<style lang="stylus">
.breadcrumb__item
  display inline-block

.breadcrumb__item:last-child
  .breadcrumb__separator
    display none
</style>
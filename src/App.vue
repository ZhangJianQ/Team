<template>
  <div id="app">
    <bee-alert type="warn" title="错误提示的方案" :show-icon="true"></bee-alert>
  </div>
</template>

<script>
import BeeAlert from '@/components/alert'
export default {
  components: {
    BeeAlert
  },
  data() {
    return {
      message: '你好'
    }
  }
}
</script>

<style lang="stylus">
#app
  display block
</style>
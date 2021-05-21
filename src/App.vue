<template>
  <div id="app">
    <breadcrumb>
      <breadcrumb-item>首页</breadcrumb-item>
      <breadcrumb-item to="http://www.baidu.com">活动管理</breadcrumb-item>
    </breadcrumb>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import BreadcrumbItem from '@/components/breadcrumb-item'
export default {
  components: {
    Breadcrumb,
    BreadcrumbItem
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
<template>
  <div id="app">
    <el-tabs v-model="activeName"
             type="card">
      <tab-pane label="用户管理"
                name="first">用户管理</tab-pane>
      <tab-pane label="配置管理"
                name="second">配置管理</tab-pane>
      <tab-pane label="角色管理"
                name="third">角色管理</tab-pane>
      <tab-pane label="定时任务补偿"
                name="fourth">定时任务补偿</tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ElTabs from '@/components/tabs'
import TabPane from '@/components/tab-pane'
export default {
  components: {
    ElTabs,
    TabPane
  },
  data() {
    return {
      pwd: '12346',
      activeName: 'first'
    }
  },
  methods: {
    showMessage() {
      Notification({
        title: '提示',
        message: '这是一条不会自动关闭的消息'
      })
    }
  }
}
</script>

<style lang="stylus">
#app
  .scrollbar__wrap
    overflow-x auto
.dark
  background-color orange
  color white
.scrollbar
  position relative
  overflow hidden
  transition padding-top 0.3s
  &:hover>.scrollbar__bar
    opacity 1
.scrollbar__wrap
  height 100%
  overflow scroll
.scrollbar__bar
  position absolute
  right 2px
  bottom 2px
  z-index 1
  border-radius 4px
  opacity 0
  transition opacity 0.12s ease-out
  &.is-vertical
    width 6px
    top 2px
.scrollbar__thumb
  position relative
  display block
  width 100%
  height 0
  cursor pointer
  border-radius inherit
  background-color rgba(144, 147, 153, 0.3)
  transition background-color 0.3s
</style>
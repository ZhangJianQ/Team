<template>
  <div id="app">
    <el-scrollbar wrap-class="el-picker-panel__content"
                  style="height:100px;overflow:scroll">
      <div class="inner"
           style="height:1000px;"></div>
    </el-scrollbar>
  </div>
</template>

<script>
import ElScrollbar from '@/components/scrollbar'
export default {
  components: {
    ElScrollbar
  },
  data() {
    return {
      pwd: '12346'
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
  display block
  overflow auto
  height 400px
.dark
  background-color orange
  color white
</style>
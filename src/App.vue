<template>
  <div id="app">
    <el-tooltip effect="dark" content="Top Left 提示文字" placement="top-start">
      <button>显示</button>
    </el-tooltip>
  </div>
</template>

<script>
import ElTooltip from '@/components/tooltip.vue'
export default {
  components: {
    ElTooltip
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
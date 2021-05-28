<template>
  <div id="app">
    <button @click="showMessage" :duration="5000">显示</button>
  </div>
</template>

<script>
import ElInput from '@/components/input'
import MessageBox from '@/components/message-box.js'
import Message from '@/components/message.js'
export default {
  components: {
    ElInput
  },
  data() {
    return {
      pwd: '12346'
    }
  },
  methods: {
    showMessage() {
      MessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          Message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          Message({
            type: 'info',
            message: '已取消删除'
          })
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
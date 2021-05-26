<template>
  <div id="app">
    <button @click="showMessage">显示</button>
  </div>
</template>

<script>
import ElInput from '@/components/input'
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
      Message.success('不成功，便成仁')
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
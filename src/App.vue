<template>
  <div id="app">
    <color-picker v-model="color"></color-picker>
  </div>
</template>

<script>
import ColorPicker from './components/color-picker.vue'
export default {
  components: {
    ColorPicker
  },
  data() {
    return {
      activeNames: ['1'],
      message: '你好',
      color: 'blue'
    }
  }
}
</script>

<style lang="stylus">
#app
  display block
.dark
  background-color orange
  color white
</style>
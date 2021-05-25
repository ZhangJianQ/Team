<template>
  <div id="app">
    <el-input
      type="text"
      v-model="pwd"
      maxlength="20"
      show-word-limit
      placeholder="Please enter what you want"
    ></el-input>
  </div>
</template>

<script>
import ElInput from '@/components/input'
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
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
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
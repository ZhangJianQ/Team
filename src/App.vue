<template>
  <div id="app">
    <el-dropdown :hide-on-click="false">
      <span class="el-dropdown-link">
        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item disabled>双皮奶</el-dropdown-item>
        <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import ElDropdown from '@/components/dropdown'
import ElDropdownMenu from '@/components/dropdown-menu'
import ElDropdownItem from '@/components/dropdown-item'
export default {
  components: {
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem
  },
  data() {
    return {
      dialogVisible: false,
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
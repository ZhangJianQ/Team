<template>
  <div id="app">
    <el-table :data="tableData"
              stripe
              border
              style="width: 100%">
      <el-table-column prop="date"
                       label="日期"
                       width="180">
      </el-table-column>
      <el-table-column prop="name"
                       label="姓名"
                       width="180">
      </el-table-column>
      <el-table-column prop="address"
                       label="地址">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ElTable from '@/components/table'
import ElTableColumn from '@/components/table-column'
export default {
  components: {
    ElTable,
    ElTableColumn
  },
  data() {
    return {
      pwd: '12346',
      activeName: 'first',
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }
      ]
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
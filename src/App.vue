<template>
  <div id="app">
    <el-tree show-checkbox
             :data="data"
             :props="defaultProps"
             node-key="id"
             @node-click="handleNodeClick"></el-tree>
  </div>
</template>

<script>
import ElTree from '@/components/tree'
export default {
  components: {
    ElTree
  },
  data() {
    return {
      pwd: '12346',
      activeName: 'first',
      data: [
        {
          id: 1,
          label: '一级 1',
          children: [
            {
              id: 2,
              label: '二级 1-1',
              children: [
                {
                  id: 3,
                  label: '三级 1-1-1'
                }
              ]
            }
          ]
        },
        {
          id: 4,
          label: '一级 2',
          children: [
            {
              id: 5,
              label: '二级 2-1',
              children: [
                {
                  id: 6,
                  label: '三级 2-1-1'
                }
              ]
            },
            {
              id: 7,
              label: '二级 2-2',
              children: [
                {
                  id: 8,
                  label: '三级 2-2-1'
                }
              ]
            }
          ]
        },
        {
          id: 9,
          label: '一级 3',
          children: [
            {
              id: 10,
              label: '二级 3-1',
              children: [
                {
                  id: 11,
                  label: '三级 3-1-1'
                }
              ]
            },
            {
              id: 12,
              label: '二级 3-2',
              children: [
                {
                  id: 13,
                  label: '三级 3-2-1'
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    handleNodeClick() {
      //
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
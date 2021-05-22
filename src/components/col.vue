// 格栅
<script>
export default {
  props: {
    span: {
      type: Number,
      default: 24
    },
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    // 设置左右两侧的边距
    gutter() {
      let parent = this.$parent
      while (parent && parent.$options.componentName !== 'ElRow') {
        parent = parent.$parent
      }
      return parent ? parent.gutter : 0
    }
  },
  render(h) {
    // 使用 render 函数返回组件
    let classList = []
    let style = {}
    let props = ['span', 'offset']
    if (this.gutter) {
      style.paddingLeft = this.gutter / 2 + 'px'
      style.paddingRight = style.paddingLeft
    }

    props.forEach(prop => {
      if (this[prop] || this[prop] === 0) {
        classList.push(
          prop !== 'span'
            ? `el-col-${prop}-${this[prop]}`
            : `el-col-${this[prop]}`
        )
      }
    })

    return h(
      this.tag,
      {
        class: ['el-col', classList],
        style
      },
      this.$slots.default
    )
  }
}
</script>

<style lang="scss">
[class*='el-col-'] {
  float: left;
  box-sizing: border-box;
}

@for $i from 1 through 24 {
  .el-col-#{$i} {
    width: (1 / 24 * $i * 100) * 1%;
  }
  .el-col-offset-#{$i} {
    margin-left: (1 / 24 * $i * 100) * 1%;
  }
}
</style>
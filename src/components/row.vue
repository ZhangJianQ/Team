<script>
export default {
  name: 'ElRow',
  componentName: 'ElRow',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    gutter: Number,
    align: {
      type: String,
      default: 'top'
    }
  },
  computed: {
    style() {
      const ret = {}
      if (this.gutter) {
        ret.marginLeft = `-${this.gutter / 2}px`
        ret.marginRight = ret.marginLeft
      }
      return ret
    }
  },
  render(h) {
    return h(
      this.tag,
      {
        class: ['el-row', this.align !== 'top' ? `is-align-${this.align}` : ''],
        style: this.style
      },
      this.$slots.default
    )
  }
}
</script>
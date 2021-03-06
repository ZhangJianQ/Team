import { off, on } from '../utils/dom'
import scrollbarWidth from '../utils/scrollbar-width'
import Bar from './bar'

export default {
  name: 'ElScrollbar',
  components: {
    Bar
  },
  props: {
    wrapStyle: {},
    wrapClass: {},
    viewClass: {},
    viewStyle: {},
    tag: {
      type: String,
      default: 'div'
    }
  },
  data() {
    return {
      sizeWidth: '0',
      sizeHeight: '0',
      moveX: 0,
      moveY: 0
    }
  },
  computed: {
    wrap() {
      return this.$refs.wrap
    }
  },
  render(h) {
    let gutter = scrollbarWidth()
    let style = this.wrapStyle

    if (gutter) {
      const gutterWidth = `-${gutter}px`
      // 设置右、下边距，等于滚动条宽度
      const gutterStyle = `margin-bottom:${gutterWidth};margin-right:${gutterWidth}`

      if (Array.isArray(this.wrapStyle)) {
        this.wrapStyle.forEach(item => {
          style = Object.assign(style, item)
        })
        style.marginRight = style.marginBottom = gutterWidth
      } else if (typeof this.wrapStyle === 'string') {
        style += gutterStyle
      } else {
        style = gutterStyle
      }
    }

    const view = h(
      this.tag,
      {
        class: ['scrollbar__view', this.viewClass],
        style: this.viewStyle,
        ref: 'resize'
      },
      this.$slots.default
    )
    const wrap = h(
      'div',
      {
        ref: 'wrap',
        style,
        class: [this.wrapClass, 'scrollbar__wrap'],
        on: {
          scroll: this.handleScroll
        }
      },
      [view]
    )
    let nodes

    if (!this.native) {
      nodes = [
        wrap,
        <Bar move={this.moveX} size={this.sizeWidth}></Bar>,
        <Bar vertical move={this.moveY} size={this.sizeHeight}></Bar>
      ]
    } else {
      nodes = [
        <div
          ref="wrap"
          class={[this.wrapClass, 'scrollbar__wrap']}
          style={style}
        >
          {[view]}
        </div>
      ]
    }

    return h('div', { class: 'scrollbar' }, nodes)
  },
  methods: {
    /**
     * 动态设置滚动条的位置 translateX/Y
     */
    handleScroll() {
      const wrap = this.wrap
      this.moveY = (wrap.scrollTop / wrap.clientHeight) * 100
      this.moveX = (wrap.scrollLeft / wrap.clientWidth) * 100
    },
    /**
     * 设置滚动条的高度, 可见区域高度/内容高度
     */
    update() {
      let heightPercentage, widthPercentage
      const wrap = this.wrap
      if (!wrap) return

      heightPercentage = (wrap.clientHeight / wrap.scrollHeight) * 100
      widthPercentage = (wrap.clientWidth / wrap.scrollWidth) * 100

      this.sizeHeight = heightPercentage < 100 ? heightPercentage + '%' : ''
      this.sizeWidth = widthPercentage < 100 ? widthPercentage + '%' : ''
    }
  },
  mounted() {
    // 绑定 resize 事件
    if (this.native) return
    this.$nextTick(this.update)
    !this.noresize && on(this.$refs.resize, 'resize', this.update)
  },
  beforeDestory() {
    if (!this.native) return
    !this.noresize && off(this.$refs.resize, 'resize', this.update)
  }
}

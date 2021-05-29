import { on, off } from '@/utils/dom'
const BAR_MAP = {
  vertical: {
    offset: 'offsetHeight',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    size: 'height',
    key: 'vertical',
    axis: 'Y',
    client: 'clientY',
    direction: 'top'
  },
  horizontal: {
    offset: 'offsetWidth',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    size: 'width',
    key: 'horizontal',
    axis: 'X',
    client: 'clientX',
    direction: 'left'
  }
}

function renderThumbStyle({ move, size, bar }) {
  const style = {}
  const translate = `translate${bar.axis}(${move}%)`

  style[bar.size] = size
  style.transform = translate
  style.msTransform = translate
  style.webkitTransform = translate

  return style
}

export default {
  name: 'Bar',
  props: {
    vertical: Boolean,
    size: String,
    move: Number
  },
  computed: {
    bar() {
      return BAR_MAP[this.vertical ? 'vertical' : 'horizontal']
    },
    wrap() {
      return this.$parents.wrap
    }
  },
  render(h) {
    const { size, move, bar } = this
    return (
      <div
        class={['scorll__bar', 'is-' + bar.key]}
        onMousedown={this.clickTrackHandler}
      >
        <div
          ref="thumb"
          class="scrollbar__thumb"
          onMousedown={this.clickThumbHandler}
          style={renderThumbStyle({ size, move, bar })}
        ></div>
      </div>
    )
  },
  methods: {
    clickTrackHandler(e) {
      const offset = Math.abs(
        e.target.getBoundClientRect()[this.bar.direction] - e[this.bar.client]
      )
      const thumbHalf = this.$refs.thumb[this.bar.offset] / 2
      const thumbPositionPercentage =
        ((offset - thumbHalf) * 100) / this.$el[this.bar.offset]

      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage * this.wrap[this.bar.scrollSize]) / 100
    },
    clickThumbHandler(e) {
      if (e.ctrlKey || e.button === 2) {
        return
      }

      // 事件处理器与逻辑分离
      this.startDrag(e)
      this[this.bar.axis] =
        e.currentTarget[this.bar.offset] -
        (e[this.bar.client] -
          e.currentTarget.getBoundClientRect()[this.bar.direction])
    },
    startDrag(e) {
      e.stopImmediatePropagation()
      this.cursorDown = true

      on(document, 'mousemove', this.mouseMoveDocumentHandler)
      on(document, 'mouseup', this.mouseUpDocumentHandler)
      document.onselectstart = () => false
    },
    mouseMoveDocumentHandler(e) {
      if (this.cursorDown === false) return
      const prevPage = this[this.bar.axis]

      if (!prevPage) return
      const offset =
        (this.$el.getBoundClientRect()[this.bar.direction] -
          e[this.bar.client]) *
        -1
      const thumbClickPosition = this.$refs.thumb[this.bar.offset] - prevPage
      const thumbPositionPercentage =
        ((offset - thumbClickPosition) * 100) / this.$el[this.bar.offset]

      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage * this.wrap[this.bar.scrollSize]) / 100
    },
    mouseUpDocumentHandler() {
      this.cursorDown = false
      this[this.bar.axis] = 0
      off(document, 'mousemove', this.mouseMoveDocumentHandler)
      document.onselectstart = null
    }
  }
}

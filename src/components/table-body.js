import { debounce } from 'throttle-debounce'
import { addClass, removeClass } from '../utils/dom'

export default {
  name: 'TableBody',
  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean
  },
  render(h) {
    const data = this.data || []
    return (
      <table class="table__body" cellspacing="0" cellpadding="0" border="0">
        <colgroup>
          {this.columns.map(column => (
            <col name={column.id} key={column.id}></col>
          ))}
        </colgroup>
        <tbody>
          {data.reduce((acc, row) => {
            return acc.concat(this.wrappedRowHeader(row, acc.length))
          }, [])}
        </tbody>
      </table>
    )
  },
  computed: {
    table() {
      return this.$parent
    },
    firstDefaultColumnIndex() {
      return this.columns.findIndex(type => type === 'default')
    }
  },
  watch: {
    'store.states.hoverRow'(newVal, oldVal) {
      if (!this.store.states.isComplex) return
      let raf = window.requestAnimationFrame
      if (!raf) {
        raf = fn => setTimeout(fn, 16)
      }

      raf(() => {
        const rows = this.$el.querySelectorAll('.table-row')
        const oldRow = rows[oldVal]
        const newRow = rows[newVal]

        if (oldRow) {
          removeClass(oldRow, 'hover-row')
        }

        if (newRow) {
          addClass(newRow, 'hover-row')
        }
      })
    }
  },
  data() {
    return {
      tooltipContent: ''
    }
  },
  methods: {
    getKeyOfRow(row, index) {},
    isColumnHidden(index) {},
    getSpan(row, column, rowIndex, columnIndex) {},
    getRowStyle(row, rowIndex) {},
    getRowClass(row, rowIndex) {},
    getCellStyle(rowIndex, columnIndex, row, column) {},
    getCellClass(rowIndex, columnIndex, row, column) {},
    getColspanRealWidth(columns, colspan, index) {},
    handleCellMouseEnter(evt, row) {},
    handleCellMouseLeave(evt) {},
    handleMouseEnter() {
      return debounce(30, index => {
        this.store.commit('setHoverRow', index)
      })
    },
    handleMouseLeave() {
      return debounce(30, () => {
        this.store.commit('setHoverRow', null)
      })
    },
    handleContextMenu(evt, row) {
      this.handleEvent(evt, row, 'contentmenu')
    },
    handleDoubleClick(evt, row) {
      this.handleEvent(evt, row, 'dbclick')
    },
    handleClick(evt, row) {
      this.store.commit('setCurrentRow', row)
      this.handleEvent(evt, row, 'click')
    },
    handleEvent(evt, row, type) {
      const table = this.table
      const cell = getCell(evt)
      let column
      if (cell) {
        column = getColumnByCell(table, cell)
        if (column) {
          table.$emit(`cell=${type}`, row, column, cell, evt)
        }
      }
      table.$emit(`row-${type}`, row, column, evt)
    },
    rowRender(row, $index, treeRowData) {},
    wrappedRowHeader(row, $index) {}
  }
}

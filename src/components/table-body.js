import { debounce } from 'throttle-debounce'
import { getStyle, addClass, hasClass, removeClass } from '../utils/dom'
import { getCell, getColumnByCell, getRowIdentity } from './table-util'
import LayoutObserver from './layout-observer'
import { mapStates } from './store/helper'

export default {
  name: 'TableBody',
  mixins: [LayoutObserver],
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
            return acc.concat(this.wrappedRowRender(row, acc.length))
          }, [])}
        </tbody>
      </table>
    )
  },
  computed: {
    table() {
      return this.$parent
    },
    ...mapStates({
      data: 'data',
      columns: 'columns',
      treeIndent: 'indent',
      leftFixedLeafCount: 'fixedLeafColumnsLength',
      rightFixedLeafCount: 'rightFixedLeafColumnsLength',
      columnsCount: states => states.columns.length,
      leftFixedCount: states => states.fixedColumns.length,
      rightFixedCount: states => states.rightFixedColumns.length,
      hasExpandColumn: states =>
        states.columns.some(({ type }) => type === 'expand'),
      firstDefaultColumnIndex() {
        return arrayFindIndex(this.columns, ({ type }) => type === 'default')
      }
    })
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
    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey
      if (rowKey) {
        return getRowIdentity(row, rowKey)
      }
      return index
    },
    /**
     * 隐藏浮动表格的列
     */
    isColumnHidden(index) {
      const fixed = this.fixed
      if (fixed === true || fixed === 'left') {
        return index >= this.leftFixedLeafCount
      } else if (fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount
      } else {
        return (
          index < this.leftFixedLeafCount ||
          index >= this.columnsCount - this.rightFixedLeafCount
        )
      }
    },
    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1
      let colspan = 1
      const fn = this.table.spanMethod
      if (typeof fn === 'function') {
        const result = fn({ row, column, rowIndex, columnIndex })

        if (Array.isArray(result)) {
          rowspan = result[0]
          colspan = result[0]
        } else if (typeof result === 'object') {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }

      return { rowspan, colspan }
    },
    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        })
      }
      return rowStyle || null
    },
    getRowClass(row, rowIndex) {
      const classes = ['table__row']
      if (this.table.highlightCurrentRow && row === this.store.currentRow) {
        classes.push('current-row')
      }

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('table__row--striped')
      }
      const className = this.table.rowClassName
      if (typeof className === 'string') {
        classes.push(rowClassName)
      } else if (typeof className === 'function') {
        classes.push(className.call(null, row, rowIndex))
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded')
      }

      return classes
    },
    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        })
      }
      return cellStyle
    },
    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className]
      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden')
      }

      const cellClassName = this.table.cellClassName
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName)
      } else if (typeof cellClassName === 'function') {
        classes.push(
          cellClassName.call(null, {
            rowIndex,
            columnIndex,
            row,
            column
          })
        )
      }
      return classes.join(' ')
    },
    /**
     * 合并单元格的宽度
     */
    getColspanRealWidth(columns, colspan, index) {
      if (colspan < 1) {
        return columns[index].realWidth
      }
      const widthArr = columns
        .map(col => col.realWidth)
        .slice(index, index + colspan)
      return widthArr.reduce((acc, width) => acc + width, -1)
    },
    handleCellMouseEnter(evt, row) {
      const table = this.table
      const cell = getCell(evt)

      if (cell) {
        const column = getColumnByCell(table, cell)
        const hoverState = (table.hoverState = { cell, column, row })
        table.$emit(
          'cell-mouse-enter',
          hoverState.row,
          hoverState.column,
          hoverState.cell
        )
      }
    },
    handleCellMouseLeave(evt) {
      const cell = getCell(event)
      if (!cell) return

      const oldHoverState = this.table.hoverState || {}
      this.table.$emit(
        'cell-mouse-leave',
        oldHoverState.row,
        oldHoverState.column,
        oldHoverState.cell,
        event
      )
    },
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
    rowRender(row, $index, treeRowData) {
      const { treeIndent, columns, firstDefaultColumnIndex } = this
      // 隐藏的列
      const columnsHidden = colums.map((column, index) =>
        this.isColumnHidden(index)
      )
      const rowClasses = this.getRowClass(row, $index)
      let display = true
      if (treeRowData) {
        rowClasses.push('table__row--level-' + treeRowData.level)
        display = treeRowData.display
      }

      let displayStyle = display
        ? null
        : {
            display: 'none'
          }
      return (
        <tr
          style={[displayStyle, this.getRowStyle(row, $index)]}
          class={rowClasses}
          key={this.getKeyOfRow(row, $index)}
          on-dbclick={$event => {
            this.handleDoubleClick($event, row)
          }}
          on-click={$event => this.handleClick($event, row)}
          on-mouseenter={_ => this.handleMouseEnter($index)}
          on-mouseleave={this.handleMouseLeave}
          on-contextmunu={$event => this.handleContextMenu($event, row)}
        >
          {columns.map((column, cellIndex) => {
            const { rowspan, colspan } = this.getSpan(
              row,
              column,
              rowIndex,
              columnIndex
            )

            if (!rowspan || !colspan) {
              return null
            }
            const columnData = { ...column }
            columnData.realWidth = this.getColspanRealWidth(
              columns,
              colspan,
              cellIndex
            )
            const data = {
              store: this.store,
              _self: this.context || this.table.$vnode.context,
              column: columnData,
              row,
              $index
            }
            if (cellIndex === firstDefaultColumnIndex && treeRowData) {
              data.treeNode = {
                indent: treeRowData.level * treeIndent,
                level: treeRowData.level
              }

              if (treeRowData.expanded === 'boolean') {
                data.treeNode.expanded = treeRowData.expanded
                if ('loading' in treeRowData) {
                  data.treeNode.loading = treeRowData.loading
                }
                if ('noLazyChildren' in treeRowData) {
                  data.treeNode.noLazyChildren = treeRowData.noLazyChildren
                }
              }
            }

            return (
              <td
                style={this.getCellStyle($index, cellIndex, row, column)}
                class={this.getCellClass($index, cellIndex, row, column)}
                rowspan={rowspan}
                colspan={colspan}
                on-mouseenter={$event => this.handleCellMouseEnter($event, row)}
                on-mouseleave={this.handleCellMouseLeave}
              >
                {column.renderCell.call(
                  this._renderProxy,
                  this.$createElement,
                  data,
                  columnsHidden[cellIndex]
                )}
              </td>
            )
          })}
        </tr>
      )
    },
    wrappedRowRender(row, $index) {
      const store = this.store
      const { isRowExpanded, assertRowKey } = store
      const {
        treeData,
        lazyTreeNodeMap,
        childrenColumnName,
        rowKey
      } = store.states

      // 展开表格渲染方法
      if (this.hasExpandColumn && isRowExpanded(row)) {
        const renderExpanded = this.table.renderExpanded
        const tr = this.rowRender(row, $index)
        if (!renderExpanded) {
          console.log('renderExpanded is required')
          return tr
        }

        return [
          [
            tr,
            <tr key={'expanded-row__' + tr.key}>
              <td colspan={this.columnsCount} class="table__expanded-cell">
                {renderExpanded(this.$createElement, {
                  row,
                  $index,
                  store: this.store
                })}
              </td>
            </tr>
          ]
        ]
      } else if (Object.keys(treeData).length) {
        // 树表格渲染方法
      } else {
        // 普通表格渲染方法
        return this.rowRender(row, $index)
      }
    }
  }
}

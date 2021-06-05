import Vue from 'vue'
import { hasClass, addClass, removeClass } from '@/utils/dom'
import LayoutObserver from './layout-observer'
import { mapStates } from './store/helper'
import { getAllColumns } from './table-util'

const convertToRows = originColumns => {
  let maxLevel = 1
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1
      if (maxLevel < column.level) {
        maxLevel = column.level
      }
    }

    if (column.children) {
      let colSpan = 0
      column.children.forEach(subcolumn => {
        traverse(subcolumn, column)
        colSpan += subcolumn.colSpan
      })
      column.colSpan = colSpan
    } else {
      column.colSpan = 1
    }
  }

  originColumns.forEach(column => {
    column.level = 1
    traverse(column)
  })

  const rows = []
  for (let i = 0; i < maxLevel; i++) {
    rows.push([])
  }

  const allColumns = getAllColumns(originColumns)
  allColumns.forEach(column => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1
    } else {
      column.rowSpan = 1
    }
    rows[column.level - 1].push(column)
  })

  return rows
}

export default {
  name: 'TableHeader',
  mixins: [LayoutObserver],
  props: {
    fixed: String,
    store: {
      required: true
    },
    border: Boolean,
    defaultSort: {
      type: Object,
      default() {
        return {
          prop: '',
          order: ''
        }
      }
    }
  },
  computed: {
    ...mapStates({
      columns: 'columns',
      isAllSelected: 'isAllSelected',
      leftFixedLeafCount: 'fixedLeafColumnsLength',
      rightFixedLeafCount: 'rightFixedLeafColumnsLength',
      columnsCount: states => states.columns.length,
      leftFixedCount: states => states.fixedColumns.length,
      rightFixedCount: states => states.rightFixedColumns.length
    }),
    table() {
      return this.$parent
    },
    hasGutter() {
      return !this.fixed && this.tableLayout.gutterWidth
    }
  },
  created() {
    this.filterPanels = {}
  },
  mounted() {
    this.$nextTick(() => {
      const { prop, order } = this.defaultSort
      const init = true
      this.store.commit('sort', { prop, order, init })
    })
  },
  beforeDestory() {
    const panels = this.filterPanels
    for (let prop in panels) {
      if (panels.hasOwnProperty(prop) && panels[prop]) {
        panels[prop].$destory(true)
      }
    }
  },
  methods: {
    isCellHidden(index, columns) {
      let start = 0
      for (let i = 0; i < index; i++) {
        start += columns[i].colSpan
      }
      const after = start + columns[index].colSpan - 1
      if (this.fixed === true || this.fixed === 'left') {
        return after >= this.leftFixedLeafCount
      } else if (this.fixed === 'right') {
        return start < this.columnsCount - this.rightFixedLeafCount
      } else {
        return (
          after < this.leftFixedLeafCount ||
          start >= this.columnsCount - this.rightFixedLeafCount
        )
      }
    },
    getHeaderRowStyle(rowIndex) {
      const style = this.table.headerRowStyle
      if (typeof style === 'function') {
        return style.call(null, { rowIndex })
      }
      return style
    },
    getHeaderRowClass(rowIndex) {
      const classes = []
      const className = this.table.headerRowClassName
      if (typeof className === 'string') {
        classes.push(className)
      } else if (typeof className === 'function') {
        className.push(className.call(null, { rowIndex }))
      }
      return classes.join(' ')
    },
    getHeaderCellStyle(rowIndex, columnIndex, row, column) {
      const style = this.table.headerCellStyle
      if (typeof style === 'function') {
        return style.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        })
      }
      return style
    },
    getHeaderCellClass(rowIndex, columnIndex, row, column) {
      const classes = [
        column.id,
        column.order,
        column.headerAlign,
        column.className
      ]
      if (rowIndex === 0 && this.isCellHidden(columnIndex, row)) {
        classes.push('is-hidden')
      }

      if (!column.children) {
        classes.push('is-leaf')
      }

      if (column.sortable) {
        classes.push('is-sortable')
      }

      const className = this.table.headerCellClassName
      if (typeof className === 'string') {
        classes.push(className)
      } else if (typeof className === 'function') {
        classes.push(
          className.call(null, {
            rowIndex,
            columnIndex,
            row,
            column
          })
        )
      }

      return classes.join(' ')
    },
    toggleAllSelection(evt) {
      evt.stopPropagation()
      this.store.commit('toggleAllSelection')
    },
    handleFilterClick(evt, column) {},
    handleHeaderClick(evt, column) {
      if (!column.filters && column.sortable) {
        this.handleSortClick(evt, column)
      } else if (column.filterable && !column.sortable) {
        this.handleFilterClick(evt, column)
      }

      this.$parent.$emit('header-click', column, evt)
    },
    handleHeaderContextMenu(evt, column) {
      this.$parent.$emit('header-contentmenu', column, evt)
    },
    /**
     * 拖动显示拖动线和位置，拖放结束修改列宽
     */
    handleMouseDown(evt, column) {
      // 嵌套表头不能改变列宽
      if (column.children && column.length > 0) return
      if (this.dragginColumn && this.border) {
        this.dragging = true
        this.$parent.resizeProxyVisible = true

        const table = this.$parent
        const tableEl = table.$el
        const tableLeft = tableEl.getBoundingClientRect().left
        const columnEl = this.$el.querySelector(`th.${column.id}`)
        const columnRect = columnEl.getBoundingClientRect()
        const minLeft = columnRect.left - tableLeft + 30

        addClass(columnEl, 'noclick')

        this.dragState = {
          startMouseLeft: evt.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        }

        const resizeProxy = table.$refs.resizeProxy
        resizeProxy.style.left = this.dragState.startLeft + 'px'

        document.onselectstart = function() {
          return false
        }
        document.ondragstart = function() {
          return false
        }

        const handleMouseMove = evt => {
          const deltaLeft = evt.clientX - this.dragState.startMouseLeft
          const proxyLeft = this.dragState.startLeft + deltaLeft

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px'
        }

        const handleMouseUp = evt => {
          if (this.dragging) {
            const { startColumnLeft, startLeft } = this.dragState
            const finalLeft = parseInt(resizeProxy.style.left, 10)
            const columnWidth = finalLeft - startColumnLeft
            column.width = column.realWidth = columnWidth

            table.$emit(
              'header-dragend',
              column.width,
              startLeft - startColumnLeft,
              column,
              evt
            )
            this.store.scheduleLayout()
            document.body.style.cursor = ''
            this.dragging = false
            this.dragginColumn = null
            this.dragState = {}
            this.$parent.resizeProxyVisible = false
          }

          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.onselectstart = null
          document.ondragstart = null

          setTimeout(() => {
            removeClass(columnEl, 'noclick')
          }, 0)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    },
    /**
     * 设置被拖动的列和样式
     */
    handleMouseMove(evt, column) {
      if (column.children && column.children.length > 0) return
      let target = evt.target
      while (target && target.tagName !== 'TH') {
        target = target.parentNode
      }

      if (!column || !column.resizable) return

      if (!this.dragging && this.border) {
        let rect = target.getBoundingClientRect()
        const bodyStyle = document.body.style

        if (rect.width > 12 && rect.right - evt.pageX < 8) {
          bodyStyle.cursor = 'col-resize'

          if (hasClass(target, 'is-sortable')) {
            target.style.cursor = 'col-reisze'
          }
          this.dragginColumn = column
        } else if (!this.dragging) {
          bodyStyle.cursor = ''
          if (hasClass(target, 'is-sortable')) {
            target.style.cursor = 'pointer'
          }
          this.dragginColumn = null
        }
      }
    },
    handleMouseOut() {
      document.body.style.cursor = ''
    },
    toggleOrder({ order, sortOrders }) {
      if (order === '') {
        return sortOrders[0]
      }
      const index = sortOrders.index(order || null)
      return sortOrders[index > sortOrders.length - 2 ? 0 : index + 1]
    },
    handleSortClick(evt, column, givenOrder) {}
  },
  render(h) {
    const originColumns = this.store.states.originColumns
    const columnRows = convertToRows(originColumns, this.columns)
    const isGroup = columnRows.length > 1

    if (isGroup) {
      this.$parent.isGroup = true
    }

    return (
      <table class="table__header" cellspacing="0" cellpadding="0" border="0">
        <colgroup>
          {this.columns.map(column => (
            <col name={column.id} key={column.id} />
          ))}
          {this.hasGutter ? <col name="gutter" /> : ''}
        </colgroup>
        <thead class={[{ 'is-group': isGroup, 'has-gutter': this.hasGutter }]}>
          {this._l(columnRows, (columns, rowIndex) => (
            <tr
              style={this.getHeaderRowStyle(rowIndex)}
              class={this.getHeaderRowClass(rowIndex)}
            >
              {columns.map((column, cellIndex) => (
                <th
                  colspan={column.colSpan}
                  rowspan={column.rowSpan}
                  on-mousemove={$event => this.handleMouseMove($event, column)}
                  on-mousedown={$event => this.handleMouseDown($event, column)}
                  on-mouseout={$event => this.handleMouseOut($event, column)}
                  on-click={$event => this.handleHeaderClick($event, column)}
                  on-contentmenu={$event =>
                    this.handleHeaderContextMenu($event, column)
                  }
                  style={this.getHeaderCellStyle(
                    rowIndex,
                    cellIndex,
                    columns,
                    column
                  )}
                  class={this.getHeaderCellClass(
                    rowIndex,
                    cellIndex,
                    columns,
                    column
                  )}
                  key={column.id}
                >
                  <div
                    class={[
                      'cell',
                      column.filteredValue && column.filteredValue.length > 0
                        ? 'highlight'
                        : '',
                      column.labelClassName
                    ]}
                  >
                    {column.renderHeader
                      ? column.renderHeader.call(this._renderProxy, h, {
                          column,
                          $index: cellIndex,
                          store: this.store,
                          _self: this.$parent.$vnode.context
                        })
                      : column.labelClassName}

                    {column.sortable ? (
                      <span
                        class="caret-wrapper"
                        on-click={$event =>
                          this.handleSortClick($event, column)
                        }
                      >
                        <i
                          class="sort-caret ascending"
                          on-click={$event =>
                            this.handleSortClick($event, column, 'ascending')
                          }
                        ></i>
                        <i
                          class="sort-caret descending"
                          on-click={$event =>
                            this.handleSortClick($event, column, 'descending')
                          }
                        ></i>
                      </span>
                    ) : (
                      ''
                    )}

                    {column.filterable ? (
                      <span
                        class="table__column-filter-trigger"
                        on-click={$event =>
                          this.handleSortClick($event, column)
                        }
                      >
                        <i
                          class={[
                            'icon-arrow-down',
                            column.filterOpened
                              ? 'icon-arrow-up'
                              : 'icon-arrow-down'
                          ]}
                        ></i>
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </th>
              ))}
              {this.gutterWidth ? <th class="gutter"></th> : ''}
            </tr>
          ))}
        </thead>
      </table>
    )
  },
  data() {
    return {
      dragginColumn: null,
      dragging: false,
      dragState: {}
    }
  }
}

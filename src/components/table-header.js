import Vue from 'vue'
import { hasClass, addClass, removeClass } from '@/utils/dom'

const getAllColumns = columns => {}
const convertToRows = originColumns => {}

export default {
  name: 'TableHeader',
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
    isCellHidden(index, columns) {},
    getHeaderRowStyle(rowIndex) {},
    getHeaderRowClass() {},
    getHeaderCellStyle(rowIndex, columnIndex, row, column) {},
    getHeaderCellClass(rowIndex, columnIndex, row, column) {},
    toggleAllSelection(evt) {},
    handleFilterClick(evt, column) {},
    handleHeaderClick(evt, column) {},
    handleHeaderContextMenu(evt, column) {},
    handleMouseDown(evt, column) {},
    handleMouseMove(evt, column) {},
    handleMouseOut() {},
    toggleOrder({ order, sortOrders }) {},
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

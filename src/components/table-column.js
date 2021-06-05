import {
  cellStarts,
  cellForced,
  defaultRenderCell,
  treeCellPrefix
} from './table-config'
import { mergeOptions, parseWidth, parseMinWidth, compose } from './table-util'

let seed = 1
export default {
  name: 'TableColumn',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    label: String,
    index: [Number, Function],
    className: String,
    labelClassName: String,
    property: String,
    prop: String,
    width: {},
    minWidth: {},
    renderHeader: Function,
    resizable: {
      type: Boolean,
      default: true
    },
    columnKey: String,
    align: String,
    headerAlign: String,
    showTooltipWhenOverflow: Boolean,
    showOverflowTooltip: Boolean,
    fixed: [Boolean, String],
    formatter: Function,
    // 选中 prop
    selectable: Function,
    reserveSelection: Boolean,
    // 过滤 prop
    filterMethod: Function,
    filteredValue: Array,
    filters: Array,
    filterPlacement: String,
    filterMultiple: {
      type: Boolean,
      default: true
    },
    // 排序 prop
    sortable: {
      type: [Boolean, String],
      default: false
    },
    sortMethod: Function,
    sortBy: [String, Function, Array],
    sortOrders: {
      type: Array,
      default() {
        return ['ascending', 'descending', null]
      },
      validator(val) {
        return val.every(
          order => ['ascending', 'descending', null].indexOf(order) > -1
        )
      }
    }
  },
  data() {
    return {
      isSubColumn: false,
      columns: []
    }
  },
  computed: {
    /**
     * 所属table的引用
     */
    owner() {
      let parent = this.$parent
      while (parent && !parent.tableId) {
        parent = parent.$parent
      }
      return parent
    },

    columnOrTableParent() {
      let parent = this.$parent
      while (parent && !parent.tableId && !parent.columnId) {
        parent = parent.$parent
      }
      return parent
    },
    realWidth() {
      return parseWidth(this.width)
    },
    realMinWidth() {
      return parseMinWidth(this.minWidth)
    },
    realAlign() {
      return this.align ? 'is-' + this.align : null
    },
    renderHeaderAlign() {
      return this.headerAlign ? 'is-' + this.headerAlign : this.realAlign
    }
  },
  methods: {
    /**
     * 复制 props 属性和数据
     */
    getPropsData(...props) {
      return props.reduce((prev, cur) => {
        if (Array.isArray(cur)) {
          cur.forEach(key => {
            prev[key] = this[key]
          })
        }
        return prev
      }, {})
    },
    getColumnElIndex(children, child) {
      return [].indexOf.call(children, child)
    },
    setColumnWidth(column) {
      if (this.realWidth) {
        column.width = this.realWidth
      }
      if (this.realMinWidth) {
        column.minWidth = this.realMinWidth
      }
      if (!column.minWidth) {
        column.minWidth = 80
      }
      column.realWidth =
        column.width === undefined ? column.minWidth : column.width

      return column
    },
    setColumnForcedProps(column) {
      const type = column.type
      const source = cellForced[type] || {}
      Object.keys(source).forEach(prop => {
        let value = source[prop]
        if (value !== undefined) {
          column[prop] =
            prop === 'className' ? `${column[prop]} ${value}` : value
        }
      })

      return column
    },
    /**
     * 包装列的渲染器（方法）renderHeader, renderCell
     */
    setColumnRenders(column) {
      if (this.renderHeader) {
        console.log()
      } else if (column.type !== 'selection') {
        column.renderHeader = (h, scope) => {
          const renderHeader = this.$scopedSlots.header

          return renderHeader ? renderHeader(scope) : column.label
        }
      }

      let originRenderCell = column.renderCell
      if (column.type === 'expand') {
        column.renderCell = (h, data) => (
          <div class="cell">{originRenderCell(h, data)}</div>
        )
        this.owner.renderExpanded = (h, data) => {
          return this.$scopedSlots.default
            ? this.$scopedSlots.default(data)
            : this.$slots.default
        }
      } else {
        originRenderCell = originRenderCell || defaultRenderCell

        column.renderCell = (h, data) => {
          let children = null
          if (this.$scopedSlots.default) {
            children = this.$scopedSlots.default(data)
          } else {
            children = originRenderCell(h, data)
          }

          const prefix = treeCellPrefix(h, data)
          const props = {
            class: 'cell',
            style: {}
          }

          if (column.showOverflowTooltip) {
            prop.class += ' el-tooltip'
            prop.style = {
              width: (data.column.realWidth || data.column.width) - 1 + 'px'
            }
          }
          return (
            <div {...props}>
              {prefix}
              {children}
            </div>
          )
        }
      }
      return column
    },
    registerNormalWatchers() {
      const props = [
        'label',
        'property',
        'filters',
        'filterMultiple',
        'sortable',
        'index',
        'formatter',
        'className',
        'labelClassName'
      ]
      const aliases = {
        prop: 'property',
        realAlign: 'align',
        realHeaderAlign: 'headerAlign',
        realWidth: 'width'
      }

      const allAliases = props.reduce((prev, cur) => {
        prev[cur] = cur
        return prev
      }, aliases)

      Object.keys(allAliases).forEach(key => {
        const columnKey = aliases[key]

        this.$watch(key, newVal => {
          this.columnConfig[columnKey] = newVal
        })
      })
    },
    registerComplexWwatchers() {
      const props = ['fixed']
      const aliases = {
        realWidth: 'width',
        realMinWidth: 'minWidth'
      }
      const allAliases = props.reduce((prev, cur) => {
        prev[cur] = cur
        return prev
      }, aliases)

      Object.keys(allAliases).forEach(key => {
        const columnKey = aliases[key]
        this.$watch(key, newVal => {
          this.columnConfig[columnKey] = newVal
          const updateColumns = columnKey === 'fixed'
          this.owner.store.scheduleLayout(updateColumns)
        })
      })
    }
  },
  beforeCreate() {
    this.row = {}
    this.column = {}
    this.$index = 0
    this.columnId = ''
  },
  created() {
    const parent = this.columnOrTableParent
    this.isSubColumn = this.owner !== parent
    this.columnId = (parent.tableId || parent.columnId) + '_column_' + seed++

    const type = this.type || 'default'
    const sortable = this.sortable === '' ? true : this.sortable
    const defaults = {
      ...cellStarts[type],
      id: this.columnId,
      type: type,
      property: this.prop || this.property,
      align: this.realAlign,
      headerAlign: this.realHeaderAlign,
      showOverflowTooltip:
        this.showOverflowTooltip || this.showTooltipWhenOverflow,
      // filter 相关属性
      filterable: this.filters || this.filterMethod,
      filteredValue: [],
      filterPlacement: '',
      isColumnGroup: false,
      filterOpened: false,
      // sort 相关属性
      sortable: sortable,
      // index 列
      index: this.index
    }
    const basicProps = [
      'columnKey',
      'label',
      'className',
      'labelClassName',
      'type',
      'renderHeader',
      'formatter',
      'fixed',
      'resizable'
    ]
    const sortProps = ['sortMethod', 'sortBy', 'sortOrders']
    const selectProps = ['selectable', 'reserveSelection']
    const filterProps = [
      'filterMethod',
      'filters',
      'filterMultiple',
      'filterOpened',
      'filteredValue',
      'filterPlacement'
    ]

    let column = this.getPropsData(
      basicProps,
      sortProps,
      selectProps,
      filterProps
    )
    column = mergeOptions(defaults, column)

    // 职责链模式
    const chains = compose(
      this.setColumnRenders,
      this.setColumnWidth,
      this.setColumnForcedProps
    )
    column = chains(column)

    this.columnConfig = column
    this.registerNormalWatchers()
    this.registerComplexWwatchers()
  },
  mounted() {
    const owner = this.owner
    const parent = this.columnOrTableParent
    const children = this.isSubColumn
      ? parent.$el.children
      : parent.$refs.hiddenColumns.children
    const columnIndex = this.getColumnElIndex(children, this.$el)

    owner.store.commit(
      'insertColumn',
      this.columnConfig,
      columnIndex,
      this.isSubColumn ? parent.columnConfig : null
    )
  },
  destoryed() {
    if (!this.$parent) return
    const parent = this.$parent
    this.owner.store.commit(
      'removeColumn',
      this.columnConfig,
      this.isSubColumn ? parent.columnConfig : null
    )
  },
  render(h) {
    return h('div', this.$slots.default)
  }
}

import Vue from 'vue'
import {
  getKeysMap,
  getRowIdentity,
  getColumnById,
  getColumnByKey,
  orderBy,
  toggleRowStatus,
  getAllColumns as doFlattenColumns
} from '../table-util'
import expand from './expand'
import current from './current'

const sortData = (data, states) => {
  const sortingColumn = states.sortingColumn
  if (!sortingColumn || typeof sortingColumn.sortable === 'string') {
    return data
  }
  return orderBy(
    data,
    states.sortProp,
    states.sortOrder,
    sortingColumn.sortMethod,
    sortingColumn.sortBy
  )
}

export default Vue.extend({
  data() {
    return {
      states: {
        rowKey: null,
        data: [],
        isComplex: false,
        _columns: [],
        columns: [],
        originColumns: [],
        fixedColumns: [],
        rightFixedColumns: [],
        leafColumns: [],
        fixedLeafColumns: [],
        rightFixedLeafColumns: [],
        leafColumnsLength: 0,
        fixedLeafColumnsLength: 0,
        rightFixedLeafColumnsLength: 0,

        isAllSelected: false,
        selection: [],
        reserveSelection: false,
        selectOnIndeterminate: false,
        selectable: null,

        filters: {},
        filteredData: null,

        sortingColumn: null,
        sortProp: null,
        sortOrder: null,

        hoverRow: null
      }
    }
  },
  mixins: [expand, current],
  methods: {
    assertsRowKey() {
      const rowKey = this.states.rowKey
      if (!rowKey) {
        throw new Error('table prop row-key is required')
      }
    },
    /**
     * 处理所有的叶子列（处理嵌套表头下的列）
     */
    updateColumns() {
      const states = this.states
      const _columns = states._columns || []
      states.fixedColumns = _columns.filter(
        col => col.fixed === true || col.fixed === 'left'
      )
      states.rightFixedColumns = _columns.filter(col => col.fixed === 'right')

      // 过滤复选框
      if (
        states.fixedColumns.length > 0 &&
        _columns[0] &&
        _columns[0].type === 'selection' &&
        !_columns[0].fixed
      ) {
        _columns[0].fixed = true
        states.fixedColumns.unshift(_columns[0])
      }

      const notFixedColumns = _columns.filter(col => !col.fixed)
      states.originColumns = []
        .concat(states.fixedColumns)
        .concat(notFixedColumns)
        .concat(states.rightFixedColumns)
      const leafColumns = doFlattenColumns(notFixedColumns)
      const fixedLeafColumns = doFlattenColumns(states.fixedColumns)
      const rightFixedLeafColumns = doFlattenColumns(states.rightFixedColumns)

      states.leafColumnsLength = leafColumns.length
      states.fixedLeafColumnsLength = fixedLeafColumns.length
      states.rightFixedLeafColumnsLength = rightFixedLeafColumns.length

      states.columns = []
        .concat(fixedLeafColumns)
        .concat(leafColumns)
        .concat(rightFixedLeafColumns)
      states.isComplex =
        states.fixedColumns.length > 0 || states.rightFixedColumns.length > 0
    },
    scheduleLayout(needUpdateColumns) {
      if (needUpdateColumns) {
        this.updateColumns()
      }
      this.table.debouncedUpdateLayout()
    },
    isSelected(row) {
      const { selection = [] } = this.states
      return selection.indexOf(row) > -1
    },
    clearSelection() {
      const states = this.states
      states.isAllSelected = false
      const oldSelection = states.selection

      if (oldSelection.length > 0) {
        states.selection = []
        this.table.$emit('selection-change', [])
      }
    },
    /**
     * 去掉选中项里已经不存在的数据，并返回新的选中项
     */
    cleanSelection() {
      const states = this.states
      const { data, rowKey, selection } = states
      let deleted

      // 将已经不存在的项添加到 deleted
      if (rowKey) {
        deleted = []
        const selectedMap = getKeysMap(selection, rowKey)
        const dataMap = getKeysMap(data, rowKey)
        for (let key in selectedMap) {
          if (selectedMap.hasOwnProperty(key) && !dataMap[key]) {
            deleted.push(selectedMap[key].row)
          }
        }
      } else {
        deleted = selection.filter(item => data.indexOf(item) === -1)
      }

      // 从选中项里删除已经不存在的项
      if (deleted.length) {
        const newSelection = selection.filter(
          item => deleted.indexOf(item) === -1
        )

        // 返回剔除后的选中项
        states.selection = newSelection
        this.table.$emit('selection-change', newSelection.slice())
      }
    },
    toggleRowSelection(row, selected, emitChange = true) {
      const changed = toggleRowStatus(this.states.selection, row, selected)
      if (changed) {
        const newSelection = (this.states.selection || []).slice()
        if (emitChange) {
          this.table.$emit('select', newSelection, row)
        }
        this.table.$emit('selection-change', newSelection)
      }
    },
    _toggleAllSelection() {
      const states = this.states
      const { data = [], selection } = states
      const value = states.selectOnIndeterminate
        ? !states.isAllSelected
        : !(states.isAllSelected || selection.length)
      states.isAllSelected = value
      let selectionChanged = false

      // 判断每行的选中状态是否变化了
      data.forEach((row, index) => {
        if (states.selectable) {
          if (
            states.selectable.call(null, row, index) &&
            toggleRowStatus(selection, row, value)
          ) {
            selectionChanged = true
          }
        } else {
          if (toggleRowStatus(selection, row, value)) {
            selectionChanged = true
          }
        }
      })

      // 如果变化了就触发变化事件
      if (selectionChanged) {
        this.table.$emit('selection-change', selection ? selection.slice() : [])
      }
      this.table.$emit('select-all', selection)
    },
    /**
     * 按 rowkey 更新 selection
     */
    updateSelectionByRowKey() {
      const states = this.states
      const { selection, rowKey, data } = states
      const selectionMap = getKeysMap(selection, rowKey)

      data.forEach(row => {
        const rowId = getRowIdentity(row, rowKey)
        const rowInfo = selectionMap[rowId]

        if (rowInfo) {
          selection[rowInfo.index] = row
        }
      })
    },
    /**
     * 修改 isAllSelected 的值
     */
    updateAllSelected() {
      const states = this.states
      const { selection, rowKey, selectable } = states
      const data = states.data || []
      if (data.length === 0) {
        states.isAllSelected = false
        return
      }

      let selectedMap
      if (rowKey) {
        selectedMap = getKeysMap(selection, rowKey)
      }
      const isSelected = function(row) {
        if (selectedMap) {
          return !!selectedMap[getRowIdentity(row, rowKey)]
        } else {
          return selection.indexOf(row) !== -1
        }
      }
      let isAllSelected = true
      let selectedCount = 0
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        const isRowSelectable = selectable && selectable.call(null, item, i)
        if (!isSelected(item)) {
          if (!selectable || isRowSelectable) {
            isAllSelected = false
            break
          }
        } else {
          selectedCount++
        }
      }

      if (selectedCount === 0) {
        isAllSelected = false
      }
      states.isAllSelected = isAllSelected
    },
    /**
     * 过滤列和值
     */
    updateFilters(columns, values) {
      if (!Array.isArray(columns)) {
        columns = [columns]
      }

      const states = this.states
      const filters = {}

      columns.forEach(col => {
        states.filters[col.id] = values
        filters[col.columnKey || col.id] = values
      })

      return filters
    },
    /**
     * 执行列上的过滤方法
     */
    execFilter() {
      const states = this.states
      const { _data, filters } = states
      let data = _data

      Object.keys(filters).forEach(columnId => {
        const values = states.filters[columnId]
        if (!values || values.length === 0) return

        const column = getColumnById(this.states, columnId)
        if (column && column.filterMethod) {
          data = data.filter(row => {
            return values.some(val => column.filterMethod.call(null, val, row))
          })
        }
      })

      states.filteredData = data
    },
    /**
     * 更新排序条件
     */
    updateSort(column, prop, order) {
      if (this.states.sortingColumn && this.states.sortingColumn !== column) {
        this.states.sortingColumn.order = null
      }

      this.states.sortingColumn = column
      this.states.sortProp = prop
      this.states.order = order
    },
    /**
     * 执行排序
     */
    execSort() {
      const states = this.states
      states.data = sortData(states.filteredData, states)
    },
    /**
     * 执行过滤和排序
     */
    execQuery(ignore) {
      if (!(ignore && ignore.filter)) {
        this.execFilter()
      }
      this.execSort()
    },
    clearFilter(columnKeys) {
      const states = this.states
      const {
        tableHeader,
        fixedTableHeader,
        rightFixedTableHeader
      } = this.table.$refs

      let panels = {}
      if (tableHeader) {
        panels = Object.assign(panels, tableHeader.filterPanels)
      }
      if (fixedTableHeader) {
        panels = Object.assign(panels, fixedTableHeader.filterPanels)
      }
      if (rightFixedTableHeader) {
        panels = Object.assign(panels, rightFixedTableHeader.filterPanels)
      }

      const keys = Object.keys(panels)
      if (!keys.length) return

      if (typeof columnKeys === 'string') {
        columnKeys = [columnKeys]
      }

      if (Array.isArray(columnKeys)) {
        const columns = columnKeys.map(key => getColumnByKey(states, key))
        keys.forEach(key => {
          const column = columns.find(col => col.id === key)
          if (column) {
            panels[key].filteredValue = []
          }
        })
        this.commit('filterChange', {
          column: columns,
          values: [],
          silent: true,
          multi: true
        })
      } else {
        keys.forEach(key => {
          panels[key].filteredValue = []
        })
        states.filters = {}
        this.commit('filterChange', {
          column: {},
          values: [],
          slient: true
        })
      }
    },
    clearSort() {
      const states = this.states
      if (!states.sortingColumn) return

      this.updateSort(null, null, null)
      this.commit('changeSortCondition', {
        silent: true
      })
    },
    setExpandRowKeysAdapter(val) {
      this.setExpandRowKeys(val)
    },
    toggleRowExpansionAdapter(row, expanded) {
      const hasExpandColumn = this.states.columns.some(
        type => type === 'expand'
      )
      if (hasExpandColumn) {
        this.toggleRowExpansion(row, expanded)
      }
    }
  }
})

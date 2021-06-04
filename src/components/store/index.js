import Vue from 'vue'
import Watcher from './watcher'

Watcher.prototype.mutations = {
  setData(states, data) {
    const dataInstanceChanged = states._data !== data
    states._data = data

    this.execQuery()
    this.updateExpandRows()

    this.updateCurrentRowData()

    if (states.reserveSelection) {
      this.assertsRowKey()
      this.updateSelectionByRowKey()
    } else {
      if (dataInstanceChanged) {
        this.clearSelection()
      } else {
        this.cleanSelection()
      }
    }
    this.updateAllSelected()

    this.updateTableScrollY()
  },
  insertColumn(states, column, index, parent) {
    let array = states._columns
    if (parent) {
      array = parent.children
      if (!array) {
        array = parent.children = []
      }
    }

    if (typeof index !== 'undefined') {
      array.splice(index, 0, column)
    } else {
      array.push(column)
    }

    if (column.type === 'selection') {
      states.selectable = column.selectable
      states.reserveSelection = column.reserveSelection
    }

    if (this.table.$ready) {
      this.updateColumns()
      this.scheduleLayout()
    }
  },
  removeColumn(states, column, parent) {
    let array = states._columns
    if (parent) {
      array = parent.children
      if (!array) {
        array = parent.children = []
      }
    }

    if (array) {
      array.splice(array.indexOf(column), 1)
    }

    if (this.table.$ready) {
      this.updateColumns()
      this.scheduleLayout()
    }
  },
  sort(states, options) {
    const { prop, order, init } = options
    if (prop) {
      const column = states.columns.find(col => col.property === prop)
      if (column) {
        column.order = order
        this.updateSort(column, prop, order)
        this.commit('changeSortCondition', { init })
      }
    }
  },
  changeSortCondition(states, options) {
    const { sortingColumn: column, sortProp: prop, sortOrder: order } = states
    if (order === null) {
      states.sortingColumn = null
      states.sortProp = null
    }

    const ignore = { filter: true }
    this.execQuery(ignore)

    if (!options || !(options.silent || options.init)) {
      this.table.$emit('sort-change', {
        column,
        prop,
        order
      })
    }

    this.updateTableScrollY()
  },
  filterChange(states, options) {
    let { column, values, silent } = options
    const newFilters = this.updateFilters(column, values)

    this.execQuery()

    if (!silent) {
      this.table.$emit('filter-change', newFilters)
    }

    this.updateTableScrollY()
  },
  toggleAllSelection() {
    this.toggleAllSelection()
  },
  rowSelectedChanged(states, row) {
    this.toggleRowSelection(row)
    this.updateAllSelected()
  },
  setHoverRow(states, row) {
    states.hoverRow = row
  },
  setCurrentRow(states, row) {
    this.updateCurrentRow(row)
  }
}

Watcher.prototype.commit = function(name, ...args) {
  const mutations = this.mutations

  if (name in mutations) {
    mutations[name].apply(this, [this.states].concat(args))
  } else {
    throw new Error(`Action not found: ${name}`)
  }
}

Watcher.prototype.updateTableScrollY = function() {
  Vue.nextTick(this.table.updateScrollY)
}

export default Watcher

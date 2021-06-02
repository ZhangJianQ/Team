import Vue from 'vue'
import scrollbarWidth from '../utils/scrollbar-width'
// 计算表格主体部分宽高
class TableLayout {
  constructor(options) {
    this.observers = []
    this.table = null
    this.store = null
    this.columns = null
    this.fit = true
    this.showHeader = true
    this.height = null
    this.scrollX = false // 是否有水平滚动
    this.scrollY = false // 是否有垂直滚动
    this.bodyWidth = null
    this.fixedWidth = null
    this.rightFixedWidth = null
    this.tableHeight = null
    this.appendHeight = 0
    this.headerHeight = 44
    this.footerHeight = 44
    this.viewportHeight = null
    this.bodyHeight = null // 等于设置的 height - headerHeight- footerHeight
    this.fixedBodyHeight = null
    this.gutterWidth = scrollbarWidth()

    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name]
      }
    }

    if (!this.table) {
      throw Error('table is required')
    }
    if (!this.store) {
      throw Error('store is required')
    }
  }
  /**
   * 垂直方向是否有滚动，对比 body.offsetHeight 和 bodyHeight
   */
  updateScrollY() {
    const height = this.height
    const bodyWrapper = this.table.bodyWrapper

    if (height === null) return false

    if (this.table.$el && bodyWrapper) {
      const body = bodyWrapper.querySelector('.table__body')
      const prevScrollY = this.scrollY
      const scrollY = body.offsetHeight > this.bodyHeight
      this.scrollY = scrollY
      return prevScrollY != scrollY
    }

    return false
  }
  setHeight(val, prop = 'height') {
    const el = this.table.$el
    this.height = val

    if (!el && (val || val === 0)) {
      return Vue.nextTick(() => {
        this.setHeight(val, prop)
      })
    }

    if (typeof val === 'number') {
      el.style[prop] = val + 'px'
      this.updateElsHeight()
    } else if (typeof val === 'string') {
      el.style[prop] = val
      this.updateElsHeight()
    }
  }
  setMaxHeight(val) {
    this.setHeight(val, 'max-height')
  }
  getFlattenColumns() {
    const flattenColumns = []
    const columns = this.table.columns
    columns.forEach(column => {
      if (column.isColumnGroup) {
        flattenColumns.push.apply(flattenColumns, column.columns)
      } else {
        flattenColumns.push(column)
      }
    })
  }
  updateElsHeight() {
    if (!this.table.$ready) {
      return Vue.nextTick(() => this.updateElsHeight())
    }
    const { headerWrapper, appendWrapper, footerWrapper } = this.table.$refs
    this.appendHeight = appendWrapper ? appendWrapper.offsetHeight : 0

    if (this.showHeader && !headerWrapper) return

    const headerTrElm = headerWrapper
      ? headerWrapper.querySelector('.table__header tr')
      : null
    const noneHeader = this.headerDisplayNone(headerTrElm)
    const headerHeight = (this.headerHeight = !this.showHeader
      ? 0
      : headerWrapper.offsetHeight)

    if (
      this.showHeader &&
      !noneHeader &&
      headerWrapper.offsetWidth > 0 &&
      (this.table.columns || []).length > 0 &&
      headerHeight < 2
    ) {
      return Vue.nextTick(() => this.updateElsHeight())
    }

    const tableHeight = (this.tableHeight = this.table.$el.clientHeight)
    const footerHeight = (this.footerHeight = footerWrapper
      ? footerWrapper.offsetHeight
      : 0)
    if (this.height !== null) {
      this.bodyHeight =
        tableHeight - headerHeight - footerHeight + (footerWrapper ? 1 : 0)
    }
    this.fixedBodyHeight = this.scrollX
      ? this.bodyHeight - this.gutterWidth
      : this.bodyHeight

    const noData = !(this.store.state.data && this.store.state.data.length)
    this.viewportHeight = this.scrollX
      ? tableHeight - (noData ? 0 : this.gutterWidth)
      : tableHeight

    this.updateScrollY()
    this.notifyObservers('scrollable')
  }
  headerDisplayNone(elem) {
    if (!elem) return true
    let headerChild = elem
    while (headerChild.tagName !== 'DIV') {
      if (getComputedStyle(headerChild).display === 'none') {
        return true
      }
      headerChild = headerChild.parentElement
    }
    return false
  }
  updateColumnsWidth() {
    const fit = this.fit
    const bodyWidth = this.table.$el.clientWidth
    let bodyMinWidth = 0
    const flattenColumns = this.getFlattenColumns()
    let flexColumns = flattenColumns.filter(
      column => typeof column.width !== 'number'
    )

    flattenColumns.forEach(column => {
      if (typeof column.width === 'number' && column.realWidth) {
        column.realWidth = null
      }
    })

    if (flexColumns.length > 0 && fit) {
      flattenColumns.forEach(column => {
        bodyMinWidth += column.width || column.minWidth || 80
      })

      const scrollYWidth = this.scrollY ? this.gutterWidth : 0

      if (bodyMinWidth <= bodyWidth - scrollYWidth) {
        this.scrollY = false
        const totalFlexWidth = bodyWidth - scrollYWidth - bodyWidth

        if (flexColumns.length === 1) {
          flexColumns[0].realWidth =
            (flexColumns[0].minWidth || 80) + totalFlexWidth
        } else {
          const allColumnsWidth = flexColumns.reduce(
            (prev, column) => prev + (column.minWidth || 80),
            0
          )
          const flexWidthPerPixel = totalFlexWidth / allColumnsWidth
          let noneFirstWidth = 0

          flexColumns.forEach((column, index) => {
            if (index === 0) return
            const flexWidth = Math.floor(
              (column.minWidth || 80) * flexWidthPerPixel
            )
            noneFirstWidth += flexWidth
            column.realWidth = (column.minWidth || 80) + flexWidth
          })
          flexColumns[0].realWidth =
            (flexColumns[0].minWidth || 80) + totalFlexWidth - noneFirstWidth
        }
      } else {
        this.scrollX = true
        flexColumns.forEach(column => {
          column.realWidth = column.minWidth
        })
      }
      this.bodyWidth = Math.max(bodyMinWidth, bodyWidth)
      this.table.resizeState.width = this.bodyWidth
    } else {
      flattenColumns.forEach(column => {
        if (!column.width && !column.minWidth) {
          column.realWidth = 80
        } else {
          column.realWidth = column.width || column.minWidth
        }

        bodyMinWidth += column.realWidth
      })

      this.scrollX = bodyMinWidth > bodyWidth
      this.bodyWidth = bodyMinWidth
    }

    const fixedColumns = this.store.states.fixedColumns
    if (fixedColumns.length > 0) {
      let fixedWidth = 0
      fixedColumns.forEach(column => {
        fixedWidth += column.realWidth || column.width
      })

      this.fixedWidth = fixedWidth
    }

    const rightFixedColumns = this.store.states.rightFixedColumns
    if (rightFixedColumns.length > 0) {
      let rightFixedWidth = 0
      rightFixedColumns.forEach(column => {
        rightFixedWidth += column.realWidth || width
      })

      this.rightFixedWidth = rightFixedWidth
    }

    this.notifyObservers('columns')
  }
  addObserver(observer) {
    const index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }
  notifyObservers(evt) {
    const observers = this.observers
    observers.forEach(obs => {
      switch (evt) {
        case 'columns':
          obs.onColumnsChange(this)
          break
        case 'scrollable':
          obs.onScrollableChange(this)
          break
        default:
          throw new Error('table layout dont have this event')
      }
    })
  }
}

export default TableLayout

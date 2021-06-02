<template>
  <div class="table"
       :class="[
      {
        'table--fit': fit,
        'table--striped': stripe,
        'table--border': border,
        'table--hidden': isHidden,
        'table--fluid-height': maxHeight,
        'table--scrollable-x': layout.scrollX,
        'table--scrollable-y': layout.scrollY
      },
      tableSize ? `table--${tableSize}` : ''
    ]"
       @mouseleave="handleMouseLeave($event)">
    <div class="hidden-columns"
         ref="hiddenColumns">
      <slot></slot>
    </div>
    <div v-if="showHeader"
         v-mousewheel="handleHeaderFooterMousewheel"
         class="table__header-wrapper"
         ref="headerWrapper">
      <table-header ref="tableHeader"
                    :store="store"
                    :border="border"
                    :default-sort="defaultSort"
                    :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }"></table-header>
    </div>
    <div class="table__body-wrapper"
         ref="bodyWrapper"
         :style="[bodyHeight]">
      <table-body :content="content"
                  :store="store"
                  :stripe="stripe"
                  :row-class-name="rowClassName"
                  :row-style="rowStyle"
                  :highlight="highlightCurrentRow"
                  :style="{ width: bodyWdith }"></table-body>
      <div class="table__empty-block"
           v-if="!data || data.length === 0">
        <span class="table__empty-text">
          <slot name="empty">暂无数据</slot>
        </span>
      </div>
      <div ref="appendWrapper"
           class="table__append-wrapper"
           v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </div>
    <div ref="footerWrapper"
         class="table__footer-wrapper"
         v-if="showSummary"
         v-show="data && data.length > 0"
         v-mousewheel="handleHeaderFooterMousewheel">
      <table-footer :store="store"
                    :border="border"
                    :sum-text="sumText"
                    :summary-method="summaryMethod"
                    :default-sort="defaultSort"
                    :style="{ width: layout.bodyWidth ? layout.bodyWidth + 'px' : '' }"></table-footer>
    </div>
    <div v-if="fixedColumns.length > 0"
         v-mousewheel="handleFixedMousewheel"
         class="table-fixed"
         ref="fixedWrapper"
         :style="[
        {
          width: layout.fixedWidth ? layout.fixedWidth + 'px' : ''
        },
        fixedHeight
      ]">
      <div v-if="showHeader"
           class="table__fixed-header-wrapper"
           ref="fixedHeaderWrapper">
        <table-header ref="fixedTableHeader"
                      fixed="left"
                      :border="border"
                      :store="store"
                      :style="{
            width: bodyWidth
          }"></table-header>
      </div>
      <div class="table__fixed-body-wrapper"
           ref="fixedBodyWrapper"
           :style="[
          {
            top: layout.headerHeader + 'px'
          },
          fixedBodyHeight
        ]">
        <table-body fixed="left"
                    :store="store"
                    :stripe="stripe"
                    :highlight="highlightCurrentRow"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :style="{ width: bodyWidth }"></table-body>
        <div class="table__append-gutter"
             :style="{ height: layout.appendHeight + 'px' }"></div>
      </div>
      <div v-if="showSummary"
           class="table__fixed-footer-wrapper"
           v-show="data && data.length > 0"
           ref="fixedFooterWrapper">
        <table-footer fixed="left"
                      :store="store"
                      :border="border"
                      :sum-text="sumText"
                      :summary-method="summaryMethod"
                      :style="{
            width: bodyWidth
          }"></table-footer>
      </div>
    </div>
    <div v-if="rightFixedColumns > 0"
         class="table__fixed-right"
         v-mousewheel="handleFixedMousewheel"
         ref="rigthFixedWrapper"
         :style="[
        {
          width: layout.rightFixedWidth ? layout.rightFixedWidth + 'px' : '',
          right: layout.scrollY ? (border ? layout.gutterWidth : 0) + 'px' : ''
        },
        fixedHeight
      ]">
      <div v-if="showHeader"
           class="table__fixed-header-wrapper"
           ref="rightFixedHeaderWrapper">
        <table-header ref="rightFixedHeader"
                      fixed="right"
                      :border="border"
                      :store="store"
                      :style="{
            width: bodyWidth
          }"></table-header>
      </div>
      <div class="table__fixed-body-wrapper"
           ref="rightFixedBodyWrapper"
           :style="[
          {
            top: layout.headerHeight + 'px'
          },
          fixedBodyHeight
        ]">
        <table-body fixed="right"
                    :store="store"
                    stripe="stripe"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :highlight="highlightCurrentRow"
                    :style="{
            width: bodyWidth
          }"></table-body>
        <div class="table__append-gutter"
             v-if="$slots.append"
             :style="{ height: layout.appendHeight + 'px' }"></div>
      </div>
      <div class="table__fixed-footer-wrapper"
           v-if="showSummay"
           v-show="data && data.length > 0"
           ref="rightFixedFooterWrapper">
        <table-footer fixed="right"
                      :store="store"
                      :border="border"
                      :sum-text="sumText"
                      :summary-method="summaryMethod"
                      :style="{
            width: bodyWidth
          }"></table-footer>
      </div>
    </div>
    <!-- 竖向(layout.scrollY)滚动时滚动条的宽度 -->
    <div class="table__fixed-right-patch"
         v-if="rightFixedColumns.length > 0"
         ref="rightFixedPatch"
         :style="{
        width: layout.scrollY ? layout.gutterWidth + 'px' : '0',
        height: layout.headerHeight + 'px'
      }"></div>
    <div class="table__column-resize-proxy"
         ref="resizeProxy"
         v-show="resizeProxyVisible"></div>
  </div>
</template>

<script>
import Mousewheel from '@/directives/mousewheel'
import TableHeader from './table-header'
import TableBody from './table-body'
import TableFooter from './table-footer'
import { debounce, throttle } from 'throttle-debounce'
let seed = 1
export default {
  name: 'ElTable',
  directives: { Mousewheel },
  props: {
    data: {
      type: Array,
      defaultL: () => []
    },
    // 样式属性
    size: String,
    width: [String, Number],
    height: [String, Number],
    maxHeight: [String, Number],
    fit: {
      // 列自动撑开
      type: Boolean,
      default: true
    },
    stripe: Boolean, // 斑马线
    border: Boolean,
    showHeader: {
      type: Boolean,
      default: true
    },
    highlightCurrentRow: Boolean,
    // 合并相关
    showSummary: Boolean,
    summaryMethod: Function,
    constext: {},
    emptyText: String,
    // 样式设置
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    cellClassName: [String, Function],
    cellStyle: [Object, Function],
    headerRowClassName: [String, Function],
    headerRowStyle: [Object, Function],
    headerCellClassName: [String, Function],
    headerCellStyle: [Object, Function],
    defaultSort: Object,
    spanMethod: Function,
    selectedOnIndeterminate: {
      // 表头复选框行为
      type: Boolean,
      default: true
    },
    // 树相关属性
    defaultExpandAll: Boolean,
    currentRowKey: [String, Number],
    expandRowKeys: Array, //配合 rowKey 设置展开的行
    indent: {
      // 树节点的缩进
      type: Number,
      default: 16
    },
    treeProps: {
      type: Object,
      default() {
        return {
          hasChildren: 'hasChildren',
          children: 'children'
        }
      }
    },
    lazy: Boolean, // 懒加载子节点
    load: Function // 懒加载方法
  },
  components: {
    TableHeader,
    TableBody,
    TableFooter
  },
  computed: {
    tableSize() {
      return this.size || (this.$ELEMENT || {}).size
    },
    bodyWrapper() {
      return this.$refs.bodyWrapper
    },
    shouldUpdateHeight() {
      // 如果设置了高度和列固定就更新表格高度
      return (
        this.height ||
        this.maxHeight ||
        this.fixedColumns.length > 0 ||
        this.rightFixedColumns.length > 0
      )
    },
    bodyWidth() {
      // 表格宽度 = 表格可见宽度 - 活动条宽度
      const { bodyWidth, scrollY, gutterWidth } = this.layout
      return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : ''
    },
    bodyHeight() {
      // 表格高度
      const { headerHeight = 0, bodyHeight, footerHeight = 0 } = this.layout
      if (this.height) {
        // 设置高度 - headerHeight - footerHeight - 1?
        return {
          height: bodyHeight ? bodyHeight + 'px' : ''
        }
      } else if (this.maxHeight) {
        const maxHeight = this.maxHeight
        if (typeof maxHeight === 'number') {
          return {
            maxHeight:
              maxHeight -
              footerHeight -
              (this.showHeader ? headerHeight : 0) +
              'px'
          }
        }
      }
      return {}
    },
    fixedBodyHeight() {
      if (this.height) {
        return {
          height: this.layout.fixedBodyHeight
            ? this.layout.fixedBodyHeight + 'px'
            : ''
        }
      } else if (this.maxHeight) {
        let maxHeight = this.maxHeight
        if (typeof maxHeight === 'number') {
          maxHeight = this.layout.scrollX
            ? maxHeight - this.layout.gutterWidth
            : maxHeight
          if (this.showHeader) {
            maxHeight -= this.headerHeight
          }
          maxHeight -= this.layout.footerHeight
          return {
            maxHeight: maxHeight + 'px'
          }
        }
      }
      return {}
    },
    fixedHeight() {
      if (this.maxHeight) {
        if (this.showSummary) {
          return {
            bottom: 0
          }
        }
        return {
          bottom:
            this.layout.scrollX && this.data.length
              ? this.layout.gutterWidth + 'px'
              : ''
        }
      } else {
        if (this.showSummary) {
          return {
            height: this.layout.tableHeight
              ? this.layout.tableHeight + 'px'
              : ''
          }
        }
        return {
          height: this.layout.viewportHeight
            ? this.layout.viewportHeight + 'px'
            : ''
        }
      }
    }
  },
  watch: {
    height: {
      immediate: true,
      handler(val) {
        this.layout.setHeight(val)
      }
    },
    maxHeight: {
      immediate: true,
      handler(val) {
        this.layout.setMaxHeight(val)
      }
    },
    currentRowKey: {
      immediate: true,
      handler(val) {
        if (!this.rowKey) return
        this.store.setCurrentRow(val)
      }
    },
    data: {
      immediate: true,
      handler(val) {
        this.store.commit('setData', val)
      }
    },
    expandRowKeys: {
      immediate: true,
      handler(val) {
        if (val) {
          this.store.setExpandRowKeysAdapter(val)
        }
      }
    }
  },
  created() {
    this.tableId = 'table-' + seed++
    this.debouncedUpdateLayout = debounce(50, () => {
      this.doLayout
    })
  },
  mounted() {
    this.bindEvents()
    this.doLayout()
  },
  destroyed() {
    this.unbindEvents()
  },
  methods: {
    setCurrentRow(row) {
      this.store.commit('setCurrentRow', row)
    },
    toggleRowSelection(row, selected) {
      // 多选，设置行的选中状态
      this.store.toggleRowSelection(row, selected, false)
      this.store.updateAllSelected()
    },
    toggleRowExpansion(row, expanded) {
      this.stroe.toggleRowExpansionAdapter(row, expanded)
    },
    clearSelection() {
      this.store.clearSelection()
    },
    clearFilter(columnKeys) {
      this.store.clearFilter(columnKeys)
    },
    clearSort() {
      this.store.clearSort()
    },
    handleMouseLeave() {
      // 干啥？
      this.store.commit('setHoverRow', null)
      if (this.hoverState) this.hoverState = null
    },
    updateScrollY() {
      const changed = this.layout.updateScrollY()
      if (changed) {
        this.layout.notifyObservers('scrollable')
        this.layout.updateColumnsWidth()
      }
    },
    syncPosition() {
      return throttle(20, function () {
        //
      })
    },
    handleFixedMousewheel() {},
    // 设置横向滚动
    handleHeaderFooterMousewheel(evt, data) {
      const { pixelX, pixelY } = data
      if (Math.abs(pixelX) >= Math.abs(pixelY)) {
        this.bodyWrapper.scrollLeft += data.pixelX / 5
      }
    },
    bindEvents() {
      this.bodyWrapper.addEventListener('scroll', this.syncPosition, {
        passive: true
      })
      if (this.fit) {
        this.$el.addEventListener('resize', this.resizeListener)
      }
    },
    unbindEvents() {
      this.bodyWrapper.removeEventListener('scroll', this.syncPosition, {
        passive: true
      })
      if (this.fit) {
        this.$el.removeEventListener('resize', this.resizeListener)
      }
    },
    resizeListener() {},
    doLayout() {
      if (this.shouldUpdateHeight) {
        this.layout.updateElsHeight()
      }
      this.layout.updateColumnsWidth()
    },
    sort(prop, order) {
      this.store.commit('sort', { prop, order })
    },
    toggleAllSelection() {
      this.store.commit('toggleAllSelection')
    }
  },
  data() {
    return {
      resizeProxyVisible: false
    }
  }
}
</script>
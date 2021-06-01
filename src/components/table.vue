<template>
  <div
    class="table"
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
    @mouseleave="handleMouseLeave($event)"
  >
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>
    <div
      v-if="showHeader"
      v-mousewheel="handleHeaderFooterMousewheel"
      class="table__header-wrapper"
      ref="headerWrapper"
    >
      <table-header
        ref="tableHeader"
        :store="store"
        :border="border"
        :default-sort="defaultSort"
        :style="{
          width: layout.bodyWidth ? layout.bodyWidth + 'px' : ''
        }"
      ></table-header>
    </div>
    <div class="table__body-wrapper" ref="bodyWrapper" :style="[bodyHeight]">
      <table-body
        :content="content"
        :store="store"
        :stripe="stripe"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :highlight="highlightCurrentRow"
        :style="{ width: bodyWdith }"
      ></table-body>
      <div class="table__empty-block" v-if="!data || data.length === 0">
        <span class="table__empty-text">
          <slot name="empty">暂无数据</slot>
        </span>
      </div>
      <div
        ref="appendWrapper"
        class="table__append-wrapper"
        v-if="$slots.append"
      >
        <slot name="append"></slot>
      </div>
    </div>
    <div
      ref="footerWrapper"
      class="table__footer-wrapper"
      v-if="showSummary"
      v-show="data && data.length > 0"
      v-mousewheel="handleHeaderFooterMousewheel"
    >
      <table-footer
        :store="store"
        :border="border"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        :default-sort="defaultSort"
        :style="{ width: layout.bodyWidth ? layout.bodyWidth + 'px' : '' }"
      ></table-footer>
    </div>
    <div
      v-if="fixedColumns.length > 0"
      v-mousewheel="handleFixedMousewheel"
      class="table-fixed"
      ref="fixedWrapper"
      :style="[
        {
          width: layout.fixedWidth ? layout.fixedWidth + 'px' : ''
        },
        fixedHeight
      ]"
    >
      <div
        v-if="showHeader"
        class="table__fixed-header-wrapper"
        ref="fixedHeaderWrapper"
      >
        <table-header
          ref="fixedTableHeader"
          fixed="left"
          :border="border"
          :store="store"
          :style="{
            width: bodyWidth
          }"
        ></table-header>
      </div>
      <div
        class="table__fixed-body-wrapper"
        ref="fixedBodyWrapper"
        :style="[
          {
            top: layout.headerHeader + 'px'
          },
          fixedBodyHeight
        ]"
      >
        <table-body
          fixed="left"
          :store="store"
          :stripe="stripe"
          :highlight="highlightCurrentRow"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :style="{ width: bodyWidth }"
        ></table-body>
        <div
          class="table__append-gutter"
          :style="{ height: layout.appendHeight + 'px' }"
        ></div>
      </div>
      <div
        v-if="showSummary"
        class="table__fixed-footer-wrapper"
        v-show="data && data.length > 0"
        ref="fixedFooterWrapper"
      >
        <table-footer
          fixed="left"
          :store="store"
          :border="border"
          :sum-text="sumText"
          :summary-method="summaryMethod"
          :style="{
            width: bodyWidth
          }"
        ></table-footer>
      </div>
    </div>
    <div
      v-if="rightFixedColumns > 0"
      class="table__fixed-right"
      v-mousewheel="handleFixedMousewheel"
      ref="rigthFixedWrapper"
      :style="[
        {
          width: layout.rightFixedWidth ? layout.rightFixedWidth + 'px' : '',
          right: layout.scrollY ? (border ? layout.gutterWidth : 0) + 'px' : ''
        },
        fixedHeight
      ]"
    >
      <div
        v-if="showHeader"
        class="table__fixed-header-wrapper"
        ref="rightFixedHeaderWrapper"
      >
        <table-header
          ref="rightFixedHeader"
          fixed="right"
          :border="border"
          :store="store"
          :style="{
            width: bodyWidth
          }"
        ></table-header>
      </div>
      <div
        class="table__fixed-body-wrapper"
        ref="rightFixedBodyWrapper"
        :style="[
          {
            top: layout.headerHeight + 'px'
          },
          fixedBodyHeight
        ]"
      >
        <table-body
          fixed="right"
          :store="store"
          stripe="stripe"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :highlight="highlightCurrentRow"
          :style="{
            width: bodyWidth
          }"
        ></table-body>
        <div
          class="table__append-gutter"
          v-if="$slots.append"
          :style="{ height: layout.appendHeight + 'px' }"
        ></div>
      </div>
      <div
        class="table__fixed-footer-wrapper"
        v-if="showSummay"
        v-show="data && data.length > 0"
        ref="rightFixedFooterWrapper"
      >
        <table-footer
          fixed="right"
          :store="store"
          :border="border"
          :sum-text="sumText"
          :summary-method="summaryMethod"
          :style="{
            width: bodyWidth
          }"
        ></table-footer>
      </div>
    </div>
    <div
      class="table__fixed-right-patch"
      v-if="rightFixedColumns.length > 0"
      ref="rightFixedPatch"
      :style="{
        width: layout.scrollY ? layout.gutterWidth + 'px' : '0',
        height: layout.headerHeight + 'px'
      }"
    ></div>
    <div
      class="table__column-resize-proxy"
      ref="resizeProxy"
      v-show="resizeProxyVisible"
    ></div>
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
    size: String,
    width: [String, Number],
    height: [String, Number],
    maxHeight: [String, Number],
    fit: {
      type: Boolean,
      default: true
    },
    stripe: Boolean,
    border: Boolean,
    constext: {},
    showHeader: {
      type: Boolean,
      default: true
    },
    showSummary: Boolean,
    summaryMethod: Function,
    rowClassName: [String, Function]
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
    showUpdateHeight() {
      return (
        this.height ||
        this.maxHeight ||
        this.fixedColumns.length > 0 ||
        this.rightFixedColumns.length > 0
      )
    },
    bodyWidth() {
      const { bodyWidth, scrollY, gutterWidth } = this.layout
      return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : ''
    },
    bodyHeight() {
      const { headerHeight = 0, bodyHeight, footerHeight = 0 } = this.layout
      if (this.height) {
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
    setCurrentRow(row) {},
    toggleRowSelection(row, selected) {},
    toggleRowExpansion(row, expanded) {},
    clearSelection() {},
    clearFilter() {},
    clearSort() {},
    handleMouseLeave() {
      this.store.commit('setHoverRow', null)
      if (this.hoverState) this.hoverState = null
    },
    updateScrollY() {},
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
    bindEvents() {},
    unbindEvents() {},
    resizeListener() {},
    doLayout() {},
    sort() {},
    toggleAllSelection() {}
  },
  data() {
    return {
      resizeProxyVisible: false
    }
  }
}
</script>
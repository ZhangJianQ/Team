<template>
  <div class="table"
       :class="[{
    'table--fit':fit,
    'table--striped':stripe,
    'table--border':border,
    'table--hidden':isHidden,
    'table--fluid-height':maxHeight,
    'table--scrollable-x':layout.scrollX,
    'table--scrollable-y':layout.scrollY
  },tableSize?`table--${tableSize}`:'']"
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
           width:layout.bodyWidth?layout.bodyWidth+'px':''
         }"></table-header>
    </div>
    <div class="table__body-wrapper"
         ref="bodyWrapper">
      <table-body></table-body>
      <div class="table__empty-block"
           v-if="!data||data.length===0">
        <span class="table__empty-text">
          <slot name="empty">暂无数据</slot>
        </span>
      </div>
      <div class="table__append-wrapper"
           v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </div>
    <div class="table__footer-wrapper"
         v-if="showSummary"
         v-show="data&&data.length>0">
      <table-footer></table-footer>
    </div>
    <div class="table-fixed"
         ref="fixedWrapper"
         :style="[{
           width:layout.fixedWidth?layout.fixedWidth+'px':''
         }]">
      <div class="table__fixed-header-wrapper"
           ref="fixedHeaderWrapper">
        <table-header></table-header>
      </div>
      <div class="table__fixed-body-wrapper"
           ref="fixedBodyWrapper">
        <table-body fixed="left"></table-body>
        <div class="table__append-gutter"
             :style="{height:layout.appendHeight+'px'}"></div>
        <div class="table__fixed-footer-wrapper"
             v-show="showSummary"
             ref="fixedFooterWrapper">
          <table-footer fixed="left"></table-footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Mousewheel from '@/directives/mousewheel'
import TableHeader from './table-header'
import TableBody from './table-body'
import TableFooter from './table-footer'
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
    bodyWrapper(){
      return this.$refs.bodyWrapper
    },
    showUpdateHeight(){},
    bodyWidth(){},
    bodyHeight(){},
    fixedBodyHeight(){},
    fixedHeight(){},
    emptyBlockStyle(){}
  },
  watch:{
    height:{
      immediate:true,
      handler(val){
        this.layout.setHeight(val)
      }
    },
    maxHeight(){
      immediate:true,
      handler(val){
        this.layout.setMaxHeight(val)
      }
    },
    currentRowKey:{
      immediate:true,
      handler(val){
        if(!this.rowKey) return;
        this.store.setCurrentRow(val)
      }
    },
    data:{
      immediate:true,
      handler(val){
        this.store.commit('setData', val)
      }
    },
    expandRowKeys:{
      immediate:true,
      handler(val){
        if(val){
          this.store.setExpandRowKeysAdapter(val)
        }
      }
    }
  },
  created(){},
  mounted(){},
  destroyed(){},
  methods: {
    setCurrentRow(row) {},
    toggleRowSelection(row, selected) {},
    toggleRowExpansion(row, expanded) {},
    clearSelection() {},
    clearFilter() {},
    clearSort() {},
    handleMouseLeave() {},
    updateScrollY() {},
    handleFixedMousewheel() {},
    handleHeaderFooterMousewheel() {},
    bindEvents() {},
    unbindEvents() {},
    resizeListener() {},
    doLayout() {},
    sort() {},
    toggleAllSelection() {}
  }
}
</script>
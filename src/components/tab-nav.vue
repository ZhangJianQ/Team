<template>
  <div :class="['tabs__nav-wrap', scrollable?'is-scrollable':'','is-'+rootTabs.tabPosition]">
    <span v-if="scrollable"
          :class="['tabs__nav-prev', scrollable.prev?'':'is-disabled']"
          @click="scrollPrev">
      <i class="icon-arrow-left"></i>
    </span>
    <span v-if="scrollable"
          :class="['tabs__nav-next', scrollable.next?'':'is-disabled']"
          @click="scrollNext">
      <i class="icon-arrow-left"></i>
    </span>
    <div :class="['tabs__nav-scroll']"
         ref="navScroll">
      <div ref="nav"
           :style="navStyle"
           :class="['tabs__nav', 'is'+rootTabs.tabPosition]"
           @keydown="changeTab">
        <tab-bar v-if="!type"
                 :tabs="panes"></tab-bar>
        <div v-for="(pane, index) in panes"
             :key="index"
             :class="['tabs__item','is-'+rootTabs.tabPosition, {
            'is-active':pane.active,
            'is-disabled':pane.disabled,
            'is-closable':pane.isClosable || editable,
            'is-focus':isFocus
          }]"
             ref="tabs"
             role="tab"
             :id="`tab-${pane.name || pane.index || index}`"
             :tabindex="pane.active ? 0 : -1"
             @focus="setFocus"
             @blur="removeFocus"
             @click="handleTabClick($event, pane)"
             @keydown="handleKeydown($event, pane)">
          {{pane.$slots.label || pane.label}}
          <span v-if="pane.closable"
                class="el-icon-close"
                @click="handleClose($event, pane)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TabBar from './tab-bar'
function noop() {}
export default {
  name: 'TabNav',
  components: {
    TabBar
  },
  inject: ['rootTabs'],
  props: {
    panes: Array,
    currentName: String,
    editable: Boolean,
    onTabClick: {
      type: Function,
      default: noop
    },
    onTabRemove: {
      type: Function,
      default: noop
    },
    type: String
  },
  data() {
    return {
      scrollable: false,
      navOffset: 0,
      isFocus: false,
      focusable: true
    }
  },
  computed: {
    navStyle() {
      const dir =
        ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) > -1 ? 'X' : 'Y'
      return {
        transform: `translate${dir}(-${this.navOffset}px)`
      }
    }
  },
  methods: {
    scrollPrev() {},
    scrollNext() {},
    scrollToActiveTab() {
      if (!this.scrollable) return
      const nav = this.$refs.nav
      const activeTab = this.$el.querySelector('.is-active')
      if (!activeTab) return

      const navScroll = this.$refs.navScroll
      const isHorizontal = ['top', 'bottom'].indexOf(this.rootTabs.tabPosition)
      const activeTabBounding = activeTab.getBoundingClientRect()
      const navScrollBounding = navScroll.getBoundingClientRect()
      const maxOffset = isHorizontal
        ? nav.offsetWidth - navScrollBounding.width
        : nav.offsetHeight - navScrollBounding.height
      const currentOffset = this.navOffset
      let newOffset = currentOffset

      if (isHorizontal) {
        if (activeTabBounding.left > navScrollBounding.left) {
          newOffset =
            currentOffset - (navScrollBounding.left - activeTabBounding.left)
        }
        if (navScrollBounding.right > navScrollBounding.right) {
          newOffset =
            currentOffset + activeTabBounding.right - navScrollBounding.right
        }
      } else {
        if (activeTabBounding.top < navScrollBounding.top) {
          newOffset =
            currentOffset - (navScrollBounding.top - activeTabBounding.top)
        }
        if (activeTabBounding.bottom > navScrollBounding.bottom) {
          newOffset =
            currentOffset +
            (activeTabBounding.bottom - navScrollBounding.bottom)
        }
      }

      newOffset = Math.max(newOffset, 0)
      this.navOffset = Math.min(newOffset, maxOffset)
    },
    update() {},
    changeTab(e) {
      const keyCode = e.keyCode
      let nextIndex, currentIndex, tabList

      if ([37, 37, 39, 40].indexOf(keyCode) > -1) {
        tabList = e.currentTarget.querySelectorAll(['role=tab'])
        currentIndex = Array.prototype.indexOf.call(tabList, e.target)
      }
    },
    setFocus() {
      if (this.focusable) {
        this.isFocus = true
      }
    },
    removeFocus() {
      this.isFocus = false
    },
    visibilityChangeHandler() {},
    windowBlurHandler() {},
    windowFocusHandler() {},
    handleTabClick(e, pane) {
      this.removeFocus()
      this.onTabClick(pane, pane.name || pane.index || index, e)
    },
    handleKeydown(evt, pane) {
      if (this.closable && (evt.keyCode === 46 || evt.keyCode === 8)) {
        this.onTabClick(pane, evt)
      }
    },
    handleClose(evt, pane) {
      this.onTabRemove(pane, evt)
    }
  },
  updated() {
    this.update()
  },
  mounted() {
    document.addEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )
    window.addEventListener('blur', this.windowBlurHandler)
    window.addEventListener('focus', this.windowFocusHandler)

    this.$nextTick(() => {
      this.scrollToActiveTab()
    })
  },
  beforeDestroy() {
    document.removeEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )
    window.removeEventListener('blur', this.windowBlurHandler)
    window.removeEventListener('focus', this.windowFocusHandler)
  }
}
</script>
<style lang="scss">
.tabs__nav-wrap {
  overflow: hidden;
  margin-bottom: -1px;
  position: relative;

  &.is-scrollable {
    overflow: hidden;
  }
}

.tabs__nav {
  white-space: nowrap;
  position: relative;
  transition: transform 0.3s;
  float: left;
  z-index: 2;
}

.tabs__item {
  padding: 0 20px;
  height: 40px;
  box-sizing: border-box;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  position: relative;

  &.is-active {
    color: #409eff;
  }
}
</style>
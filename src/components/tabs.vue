<script>
import TabNav from './tab-nav'

export default {
  name: 'ElTabs',
  componentName: 'ElTabs',
  components: {
    TabNav
  },
  props: {
    type: String,
    activeName: String,
    closable: Boolean,
    value: {},
    editable: Boolean,
    addable: Boolean,
    tabPosition: {
      type: String,
      default: 'top'
    },
    beforeLeave: Function
  },
  provide() {
    return {
      rootTabs: this
    }
  },
  data() {
    return {
      currentName: this.value || this.activeName,
      panes: []
    }
  },
  watch: {
    activeName(val) {
      this.setCurrentName(val)
    },
    value(val) {
      this.setCurrentName(val)
    },
    currentName() {
      if (this.$refs.nav) {
        this.$nextTick(() => {
          this.$refs.nav.$nextTick(() => {
            this.$refs.nav.scrollToActiveTab()
          })
        })
      }
    }
  },
  methods: {
    calcPaneInstances() {
      if (this.$slots.default) {
        const paneSlots = this.$slots.default.filter(
          vnode =>
            vnode.tag &&
            vnode.componentOptions &&
            vnode.componentOptions.Ctor.options.name === 'TabPane'
        )

        const panes = paneSlots.map(
          ({ componentInstance }) => componentInstance
        )
        const panesChanged = !(
          panes.length === this.panes.length &&
          panes.every((p, i) => p === this.panes[i])
        )

        if (panesChanged) {
          this.panes = panes
        } else if (this.panes.length !== 0) {
          this.panes = []
        }
      }
    },
    handleTabClick(tab, tabName, evt) {
      if (tab.disabled) return
      this.setCurrentName(tabName)
      this.$emit('tab-click', tab, event)
    },
    handleTabRemove(pane, evt) {
      if (pane.disabled) true
      evt.stopPropagation()
      this.$emit('edit', pane.name, 'remove')
      this.$emit('tab-remove', pane.name)
    },
    handleTabAdd() {
      this.$emit('edit', null, 'add')
      this.$emit('tab-add')
    },
    setCurrentName(val) {
      const changeCurrentName = () => {
        this.currentName = val
        this.$emit('input', val)
      }

      if (!this.currentName !== val && this.beforeLeave) {
        const before = this.beforeLeave(val, this.currentName)
        if (before && before.then) {
          before.then(() => {
            changeCurrentName()
            this.$refs.nav && this.$refs.nav.removeFocus()
          })
        } else if (before !== false) {
          changeCurrentName()
        }
      } else {
        changeCurrentName()
      }
    }
  },
  render(h) {
    let {
      type,
      handleTabClick,
      handleTabRemove,
      handleTabAdd,
      currentName,
      panes,
      editable,
      addable,
      tabPosition
    } = this

    const newButton =
      editable || addable ? (
        <span
          class="tabs__new-tab"
          on-click={handleTabAdd}
          tabindex="0"
          on-keydown={evt => {
            if (evt.keyCode === 13) {
              handleTabAdd
            }
          }}
        >
          <i class="icon-add"></i>
        </span>
      ) : null

    const navData = {
      props: {
        currentName,
        onTabClick: handleTabClick,
        onTabRemove: handleTabRemove,
        editable,
        type,
        panes
      },
      ref: 'nav'
    }
    const header = (
      <div class={['tabs__header', `is-${tabPosition}`]}>
        {newButton}
        {<tab-nav {...navData}></tab-nav>}
      </div>
    )
    const panels = <div class="tabs__content">{this.$slots.default}</div>

    return h(
      'div',
      {
        class: {
          'el-tabs': true,
          'el-tabs--card': type === 'card',
          [`el-tabs--${tabPosition}`]: true,
          'el-tabs--border-card': type === 'border-card'
        }
      },
      tabPosition !== 'bottom' ? [header, panels] : [panels, header]
    )
  },
  created() {
    if (!this.currentName) {
      this.setCurrentName('0')
    }
    this.$on('tab-nav-update', this.calcPaneInstances.bind(null, true))
  },
  mounted() {
    this.calcPaneInstances()
  }
  // updated() {
  //   this.calcPaneInstances()
  // }
}
</script>
<style lang="scss">
.tabs__header {
  padding: 0;
  position: relative;
  margin: 0 0 15px;
}
</style>
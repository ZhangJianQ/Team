let seed = 1
export default {
  name: 'TableColumn',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    label: String,
    prop: String,
    width: {},
    minWidth: {},
    sortable: {
      type: [Boolean, String],
      default: false
    },
    align: String,
    fixed: [Boolean, String],
    formatter: Function,
    index: [Number, String]
  },
  data() {
    return {
      columns: []
    }
  },
  computed: {
    owner() {
      let parent = this.$parent
      while (parent && !parent.tableId) {
        parent = parent.$parent
      }
      return parent
    },
    realAlign() {
      return this.align ? 'is-' + this.align : null
    },
    renderHeaderAlign() {
      return this.headerAlign ? 'is-' + this.headerAlign : this.realAlign
    }
  },
  methods: {
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
    setColumnWidth(column) {},
    setColumnForcedProps(column) {
      const type = column.type
    },
    setColumnRenders(column) {},
    registerNormalWatchers() {},
    registerComplexWwatchers() {}
  },
  beforeCreate() {
    this.row = {}
    this.column = {}
    this.$index = 0
    this.columnId = ''
  },
  created() {
    const parent = this.columnOrTableParent
  },
  mounted() {},
  destoryed() {},
  render(h) {
    return h('div', this.$slots.default)
  }
}

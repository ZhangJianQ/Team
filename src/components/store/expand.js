import { toggleRowStatus, getKeysMap, getRowIdentity } from '../table-util'
// 展开行
export default {
  data() {
    return {
      states: {
        defaultExpandAll: false,
        expandRows: [] // 缓存已经展开的行
      }
    }
  },
  methods: {
    updateExpandRows() {
      const { data = [], rowKey, defaultExpandAll, expandRows } = this.states

      if (defaultExpandAll) {
        this.states.expandRows = data.slice()
      } else if (rowKey) {
        const expandRowsMap = getKeysMap(expandRows, rowKey)
        this.states.expandRows = data.reduce((prev, row) => {
          const rowId = getRowIdentity(row, rowKey)
          const rowInfo = expandRowsMap[rowId]

          if (rowInfo) {
            prev.push(row)
          }
          return prev
        }, [])
      } else {
        this.states.expandRows = []
      }
    },
    toggleRowExpansion(row, expanded) {
      const changed = toggleRowStatus(this.states.expandRows, row, expanded)
      if (changed) {
        this.table.$emit('expand-change', row, this.states.expandRows.slice())
        this.scheduleLayout()
      }
    },
    setExpandRowKeys(rowKeys) {
      this.assertRowKey()
      const { data, rowKey } = this.states
      const KeysMap = getKeysMap(data, rowKey)

      this.states.expandRows = rowKeys.reduce((prev, cur) => {
        const info = KeysMap[cur]
        if (info) {
          prev.push(info.row)
        }
        return prev
      }, [])
    },
    isRowExpanded(row) {
      const { expandRows = [], rowKey } = this.states
      if (rowKey) {
        const expandMap = getKeysMap(expandRows, rowKey)
        return !!expandMap[getRowIdentity(row, rowKey)]
      }
      return expandRows.indexOf(row) !== -1
    }
  }
}

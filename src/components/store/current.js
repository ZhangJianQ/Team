import { getRowIdentity } from '../table-util'
export default {
  data() {
    return {
      states: {
        _currentRowKey: null,
        currentRow: null
      }
    }
  },
  methods: {
    setCurrentRowKey(key) {
      this.assertRowKey()
      this.states._currentRowKey = key
      this.setCurrentRowByKey(key)
    },
    setCurrentRowByKey(key) {
      const { states } = this
      const { data = [], rowKey } = states
      let currentRow = null

      if (rowKey) {
        currentRow = data.find(item => getRowIdentity(item, rowKey) === key)
      }
      states.currentRow = currentRow
    },
    updateCurrentRow(currentRow) {
      const { states, table } = this
      const oldCurrentRow = states.currentRow

      if (currentRow && currentRow !== oldCurrentRow) {
        states.currentRow = currentRow
        table.$emit('current-change', currentRow, oldCurrentRow)
        return
      }
      if (!currentRow && oldCurrentRow) {
        states.currentRow = null
        table.$emit('current-change', null, oldCurrentRow)
      }
    },
    updateCurrentRowData() {
      const { states, table } = this
      const { rowKey, _currentRowKey } = states
      const data = states.data || []
      const oldCurrentRow = states.currentRow

      if (data.indexOf(oldCurrentRow) === -1 && oldCurrentRow) {
        if (rowKey) {
          const currentRowKey = getRowIdentity(oldCurrentRow, rowKey)
          this.setCurrentRowByKey(currentRowKey)
        } else {
          states.currentRow = null
        }

        if (states.currentRow === null) {
          table.$emit('current-change', null, oldCurrentRow)
        }
      } else if (_currentRowKey) {
        this.setCurrentRowByKey(_currentRowKey)
        this.restoreCurrentRowKey()
      }
    }
  }
}

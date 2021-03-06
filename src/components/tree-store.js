import Node from './node'
import { getNodeKey } from './tree-util'

export default class TreeStore {
  constructor(options) {
    this.currentNode = null
    this.currentNodeKey = null

    for (let key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    }

    this.nodesMap = {}

    this.root = new Node({
      data: this.data,
      store: this
    })

    if (this.lazy && this.load) {
      const fn = this.load
      fn(this.root, data => {
        this.root.doCreateChildren(data)
        this._initDefaultCheckedNodes()
      })
    } else {
      this._initDefaultCheckedNodes()
    }
  }
  /**
   * 过滤器，使用隐藏的方法
   */
  filter(val) {
    const filterNodeMethod = this.filterNodeMethod
    const lazy = this.lazy
    // 递归
    const traverse = node => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes
      childNodes.forEach(child => {
        child.visible = filterNodeMethod.call(child, val, child.data, child)
        traverse(child)
      })

      if (!node.visible && childNodes.length) {
        let allHidden = true
        allHidden = !childNodes.some(child => child.visible)

        if (node.root) {
          node.root.visible = allHidden === false
        } else {
          node.visible = allHidden === false
        }
      }

      if (!val) return

      // 过滤时需要展开所有节点
      if (node.visible && !node.isLeaf && !lazy) {
        node.expand()
      }
    }

    traverse(this)
  }
  /**
   * 设置树数据，如果数据变了更新整个树
   */
  setData(val) {
    const instanceChanged = val !== this.root.data
    // 根节点变化了
    if (instanceChanged) {
      this.root.setData(val)
      this._initDefaultCheckedNodes()
    } else {
      this.root.updateChildren()
    }
  }
  /**
   * 获取节点实例
   */
  getNode(data) {
    if (data instanceof Node) return data
    const key = typeof data === 'object' ? data : getNodeKey(this.key, data)
    return this.nodesMap[key] || null
  }
  insertBefore(data, refData) {
    const ref = this.getNode(refData)
    ref.parent.insertBefore({ data }, ref)
  }
  insertAfter(data, refData) {
    const refNode = this.getNode(refData)
    refNode.parent.insertAfter({ data }, refNode)
  }
  remove(data) {
    const node = this.getNode(data)

    if (node && node.parent) {
      if (node === this.currentNode) {
        this.currentNode = null
      }
      node.parent.removeChild(node)
    }
  }
  append(data, parentData) {
    const parentNode = parentData ? this.getNode(parentData) : this.root

    if (parentNode) {
      parentNode.insertChild({ data })
    }
  }
  /**
   * 根据设置初始化所有选中节点
   */
  _initDefaultCheckedNodes() {
    const defaultCheckedKeys = this.defaultCheckedKeys || []
    const nodesMap = this.nodesMap

    defaultCheckedKeys.forEach(checkedKey => {
      const node = nodesMap[checkedKey]

      if (node) {
        node.setChecked(true, !this.checkStrictly)
      }
    })
  }
  _initDefaultCheckedNode(node) {
    const defaultCheckedKeys = this.defaultCheckedKeys || []

    if (defaultCheckedKeys.indexOf(node.key) !== -1) {
      node.setChecked(true, !this.checkStrictly)
    }
  }
  setDefaultCheckedKey(newVal) {
    if (newVal !== this.defaultCheckedKeys) {
      this.defaultCheckedKeys = newVal
      this._initDefaultCheckedNodes()
    }
  }
  /**
   * 将节点缓存成 {nodeKey: node} 的结构
   */
  registerNode(node) {
    const key = this.key
    if (!key || !node || !node.data) return

    const nodeKey = node.key
    if (nodeKey !== undefined) this.nodesMap[node.key] = node
  }
  deregisterNode(node) {
    const key = this.key
    if (!key || !node || !node.data) return

    node.childNodes.forEach(child => {
      this.deregisterNode(child)
    })

    delete this.nodesMap[node.key]
  }
  /**
   * 获取选中节点状态，使用了递归
   */
  getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
    const checkedNodes = []
    const traverse = function(node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes

      childNodes.forEach(child => {
        if (
          (child.checked || (includeHalfChecked && child.indeterminate)) &&
          (!leafOnly || (leafOnly && child.isLeaf))
        ) {
          checkedNodes.push(child.data)
        }

        traverse(child)
      })
    }

    traverse(this)

    return checkedNodes
  }
  getCheckedKeys(leafOnly = false) {
    return this.getCheckedNodes(leafOnly).map(data => (data || {})[this.key])
  }
  getHalfCheckedNodes() {
    const nodes = []
    const traverse = node => {
      const childNodes = node.root ? node.root.childNodes : node.childNodes

      childNodes.forEach(child => {
        if (child.indeterminate) {
          nodes.push(child.data)
        }
        traverse(child)
      })
    }

    traverse(this)

    return nodes
  }
  getHalfCheckedKeys() {
    return this.getHalfCheckedNodes().map(data => (data || {})[this.key])
  }
  /**
   * 从缓存中获取所有节点
   */
  _getAllNodes() {
    const nodes = []
    const nodesMap = this.nodesMap
    for (let key in nodesMap) {
      if (nodesMap.hasOwnProperty(key)) {
        nodes.push(nodesMap[key])
      }
    }

    return nodes
  }
  /**
   * 先删除,再添加
   */
  updateChildren(key, data) {
    const node = this.nodesMap[key]
    if (!node) return
    const childNodes = node.childNodes
    for (let i = childNodes.length - 1; i >= 0; i--) {
      const child = childNodes[i]
      this.remove(child.data)
    }
    for (let i = 0, j = data.length; i < j; i++) {
      const child = data[i]
      this.append(child, node.data)
    }
  }
  _setCheckedKeys(key, leafOnly = false, checkedKeys) {
    const allNodes = this._getAllNodes().sort((a, b) => b.level - a.level)
    const cache = Object.create(null)
    const keys = Object.keys(checkedKeys)
    allNodes.forEach(node => node.setChecked(false, false))

    for (let i = 0, j = allNodes.length; i < j; i++) {
      const node = allNodes[i]
      const nodeKey = node.data[key].toString()
      let checked = keys.indexOf(nodeKey) > -1
      if (!checked) {
        if (node.checked && !cache[nodeKey]) {
          node.setChecked(false, false)
        }
        continue
      }

      let parent = node.parent
      while (parent && parent.level > 0) {
        cache[parent.data[key]] = true
        parent = parent.parent
      }

      if (node.isLeaf || this.checkStrictly) {
        node.setChecked(true, false)
        continue
      }

      node.setChecked(true, true)

      if (leafOnly) {
        node.setChecked(false, false)
        const traverse = function(node) {
          const childNodes = node.childNodes
          childNodes.forEach(child => {
            if (!child.isLeaf) {
              child.setChecked(false, false)
            }
            traverse(child)
          })
        }
        traverse(node)
      }
    }
  }
  setCheckedNodes(array, leafOnly = false) {
    const key = this.key
    const checkedKeys = {}
    array.forEach(item => {
      checkedKeys[(item || {})[key]] = true
    })
    this._setCheckedKeys(key, leafOnly, checkedKeys)
  }
  setCheckedKeys(keys, leafOnly = false) {
    this.defaultCheckedKeys = keys
    const key = this.key
    const checkedKeys = {}
    keys.forEach(key => {
      checkedKeys[key] = true
    })

    this._setCheckedKeys(key, leafOnly, checkedKeys)
  }
  setDefaultExpandedKeys(keys) {
    keys = keys || []
    this.defaultExpandedKeys = keys

    keys.forEach(key => {
      const node = this.getNode(key)
      if (node) node.expand(null, this.autoExpandParent)
    })
  }
  setChecked(data, checked, deep) {
    const node = this.getNode(data)

    if (node) {
      node.setChecked(!!checked, deep)
    }
  }
  getCurrentNode() {
    return this.currentNode
  }
  /**
   * 更新当前选中节点
   */
  setCurrentNode(currentNode) {
    const prevCurrentNode = this.currentNode
    if (prevCurrentNode) {
      prevCurrentNode.isCurrent = false
    }
    this.currentNode = currentNode
    this.currentNode.isCurrent = true
  }
  setUserCurrentNode(node) {
    const key = node[this.key]
    const currNode = this.nodesMap[key]
    this.setCurrentNode(currNode)
  }
  setCurrentNodeKey(key) {
    if (key === null || key === undefined) {
      this.currentNode && (this.currentNode.isCurrent = false)
      this.currentNode = null
      return
    }
    const node = this.getNode(key)
    if (node) {
      this.setCurrentNode(node)
    }
  }
}

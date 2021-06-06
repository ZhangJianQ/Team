import { markNodeData, NODE_KEY } from './tree-util'

/**
 * 获取子节点的各个状态值
 * - 没有使用节点的方法，比如状态被修改后不能再被修改回去，就不必再执行循环
 * @return 全选中，全部选中，半选，全部禁用
 */
export const getChildState = nodes => {
  let all = true // 全选，子节点还不是
  let none = true // 全部没选中
  let allWithoutDisable = true // 节点非禁用
  // 半选中
  for (let i = 0, len = nodes.length; i < len; i++) {
    const n = nodes[i]
    if (n.checked !== true || n.indeterminate) {
      all = false
      if (!n.disabled) {
        allWithoutDisable = false
      }
    }
    if (n.checked !== false || n.indeterminate) {
      none = false
    }
  }
  return { all, none, allWithoutDisable, half: !all && !none }
}

/**
 * 循环向上更新节点状态，使用了递归
 * 根据子节点状态更新节点状态的值
 */
const reInitChecked = node => {
  if (node.childNodes.length === 0) return

  const { all, none, half } = getChildState(node.childNodes)
  if (all) {
    node.checked = true
    node.indeterminate = false
  } else if (half) {
    node.checked = false
    node.indeterminate = true
  } else if (none) {
    node.checked = false
    node.indeterminate = false
  }

  const parent = node.parent
  if (!parent || parent.level === 0) return

  // 循环更新节点状态
  if (!node.store.checkStrictly) {
    reInitChecked(parent)
  }
}

/**
 * 根据 props 配置获取数据
 * 用户可以自定义数据的字段名
 */
const getPropertyFromData = (node, prop) => {
  const props = node.store.props
  const data = node.data || {}
  const config = props[prop]

  if (typeof config === 'function') {
    return config(data, node)
  } else if (typeof config === 'string') {
    return data[config]
  } else if (typeof config === 'undefined') {
    const dataProp = data[prop]
    return dataProp === undefined ? '' : dataProp
  }
}

let seed = 0
export default class Node {
  constructor(options) {
    // 基本属性
    this.id = seed++
    this.level = 0
    this.text = null
    this.data = null
    this.parent = null
    this.childNodes = []
    // 状态属性
    this.checked = false
    this.indeterminate = false
    this.expanded = false
    this.visible = true
    this.isCurrent = false
    this.loaded = false
    this.loading = false

    // 属性合并
    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name]
      }
    }

    if (this.parent) {
      this.level = this.parent.level + 1
    }

    const store = this.store
    if (!store) {
      throw new Error('store is required')
    }
    store.registerNode(this)

    // 用户手动设置叶子节点
    const props = store.props
    if (props && typeof props.isLeaf !== 'undefined') {
      const isLeaf = getPropertyFromData(this, 'isLeaf')
      if (typeof isLeaf === 'boolean') {
        this.isLeafByUser = isLeaf
      }
    }

    // 设置节点展开方式，非懒加载设置 expanded 属性，否则使用 expand 方法
    if (store.lazy !== true && this.data) {
      this.setData(this.data)

      if (store.defaultExpandAll) {
        this.expanded = true
      }
    } else if (this.level > 0 && store.lazy && store.defaultExpandAll) {
      this.expand()
    }

    // 将非数组转成数组，就是给非数组加一个数字属性
    if (!Array.isArray(this.data)) {
      markNodeData(this, this.data)
    }

    if (!this.data) return

    // 展开节点及父节点，通过检查本节点是否包含是展开节点中
    const defaultExpandedKeys = store.defaultExpandedKeys
    const key = store.key
    if (
      key &&
      defaultExpandedKeys &&
      defaultExpandedKeys.indexOf(this.key) > -1
    ) {
      this.expand(null, store.autoExpandParent)
    }

    // 当前选中
    if (
      key &&
      store.currentNodeKey !== undefined &&
      this.key === store.currentNodeKey
    ) {
      store.currentNode = this
      store.currentNode.isCurrent = true
    }

    // 懒加载
    if (store.lazy) {
      store._initDefaultCheckedNode(this)
    }

    this.updateLeafState()
  }
  /**
   * 获取子数据，并生成子节点
   */
  setData(data) {
    if (!Array.isArray(data)) {
      markNodeData(this, data)
    }

    this.data = data
    this.childNodes = []

    let children
    if (this.level === 0 && this.data instanceof Array) {
      children = this.data
    } else {
      children = getPropertyFromData(this, 'children') || []
    }

    // 更新子节点
    for (let i = 0, len = children.length; i < len; i++) {
      this.insertChildren({ data: children[i] })
    }
  }
  // Getter
  get label() {
    return getPropertyFromData(this, 'label')
  }
  get key() {
    const nodeKey = this.store.key
    if (this.data) return this.data[nodeKey]
    return null
  }
  get disabled() {
    return getPropertyFromData(this, 'disabled')
  }
  get nextSibling() {
    const parent = this.parent
    if (parent) {
      const index = parent.childNodes.indexOf(this)

      if (index > -1 && index < parent.childNodes.length - 1) {
        return parent.childNodes[index + 1]
      }
    }
    return null
  }
  get previousSibling() {
    const parent = this.parent
    if (parent) {
      const index = parent.childNodes.indexOf(this)

      if (index > -1) {
        return index > 0 ? parent.childNodes[index + 1] : null
      }
    }
    return null
  }
  /**
   * 是否包含某个节点，使用了递归
   */
  contains(target, deep = true) {
    const walk = function(parent) {
      const children = parent.childNodes || []
      let result = false
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i]
        if (child === target || (deep && walk(child))) {
          result = true
          break
        }
      }
      return result
    }
    return walk(this)
  }
  remove() {
    const parent = this.parent
    if (parent) {
      parent.removeChild(this)
    }
  }
  /**
   * 插入子节点通用方法，包含子数据和子节点
   */
  insertChildren(child, index, batch) {
    if (!child) throw new Error('child is required')

    // 更新子数据 node.data
    if (!(child instanceof Node)) {
      if (!batch) {
        const children = this.getChildren(true)
        if (children.indexOf(child.data) === -1) {
          if (typeof index === 'undefined' || index < 0) {
            // 新节点
            children.push(child.data)
          } else {
            // 更新节点
            children.splice(index, 0, child.data)
          }
        }
      }
      Object.assign(child, {
        parent: this,
        store: this.store
      })
      child = new Node(child)
    }
    // 更新子节点 node.childNodes
    child.level = this.level + 1
    if (typeof index === 'undefined' || index < 0) {
      this.childNodes.push(child)
    } else {
      this.childNodes.splice(index, 0, child)
    }

    this.updateLeafState()
  }
  insertBefore(child, ref) {
    let index
    if (ref) {
      index = this.childNodes.indexOf(ref)
    }

    this.insertChildren(child, index)
  }
  insertAfter(child, ref) {
    let index
    if (ref) {
      index = this.childNodes.indexOf(ref)
      if (index !== -1) index += 1
    }
    this.insertChildren(child, index)
  }
  removeChild(child) {
    const children = this.getChildren() || []
    // 删除子数据 node.data
    const dataIndex = children.indexOf(child.data)
    if (dataIndex > -1) {
      children.splice(dataIndex, 1)
    }
    // 删除子节点 node.childNodes
    const index = this.childNodes.indexOf(child)
    if (index > -1) {
      this.store && this.store.deregisterNode(child)
      child.parent = null
      this.childNodes.splice(index, 1)
    }
    this.updateLeafState()
  }
  /**
   * 按数据删除节点, 操作 node.data
   */
  removeChildByData(data) {
    let targetNode = null

    for (let i = 0, len = this.childNodes.length; i < len; i++) {
      if (this.childNodes[i].data === data) {
        targetNode = this.childNodes[i]
        break
      }
    }

    if (targetNode) {
      this.removeChild(targetNode)
    }
  }
  /**
   * 展开节点方法
   * 包含懒加载和非懒加载两种方式
   */
  expand(callback, expandParent) {
    // 一般方式，通过设置 expanded
    const done = () => {
      if (expandParent) {
        let parent = this.parent
        while (parent.level > 0) {
          parent.expanded = true
          parent = parent.parent
        }
      }
      this.expanded = true
      if (callback) callback()
    }

    // 懒加载方法
    if (this.shouldLoadData()) {
      this.loadData = data => {
        if (data instanceof Array) {
          if (this.checked) {
            this.setChecked(true, true)
          } else if (!this.store.checkStrictly) {
            reInitChecked(this)
          }

          done()
        }
      }
    } else {
      done()
    }
  }
  /**
   * 懒加载批量插入子节点
   * insertChildren 一次只插入一个节点
   */
  doCreateChildren(array, defaultProps = {}) {
    array.forEach(item => {
      this.insertChildren(
        Object.assign({ data: item }, defaultProps),
        undefined,
        true
      )
    })
  }
  collapse() {
    this.expanded = false
  }
  /**
   * 懒加载，且当前节点没有加载过子节点
   */
  shouldLoadData() {
    return this.store.lazy && this.store.load && !this.loaded
  }
  /**
   * 更新节点状态，isLeaf
   */
  updateLeafState() {
    if (
      this.store.lazy &&
      this.load !== true &&
      typeof this.isLeafByUser !== 'undefined'
    ) {
      this.isLeaf = this.isLeafByUser
      return
    }
    const childNodes = this.childNodes
    if (
      !this.store.lazy ||
      (this.store.lazy === true && this.loaded === true)
    ) {
      this.isLeaf = !childNodes || childNodes.length === 0
      return
    }
    this.isLeaf = false
  }
  /**
   * 设置节点状态，如果使用了懒加载同时加载数据，使用了递归
   * 区分了一般模式和懒加载模式
   */
  setChecked(val, deep, recursion, passValue) {
    this.indeterminate = val === 'half'
    this.checked = val === true

    if (this.store.checkStrictly) return

    if (!(this.shouldLoadData() && !this.store.checkDescendants)) {
      let { all, allWithoutDisable } = getChildState(this.childNodes)

      if (!this.isLeaf && !all && allWithoutDisable) {
        this.checked = false
        val = false
      }

      // 将子孙节点操作包装成闭包
      const handleDescendants = () => {
        if (deep) {
          const childNodes = this.childNodes
          for (let i = 0, len = childNodes.length; i < len; i++) {
            const child = childNodes[i]
            passValue = passValue || val !== false
            const isCheck = child.disabled ? child.checked : passValue
            child.setChecked(isCheck, deep, true, passValue)
          }

          const { half, all } = getChildState(childNodes)
          if (!all) {
            this.checked = all
            this.indeterminate = half
          }
        }
      }

      if (this.shouldLoadData()) {
        this.loadData(
          () => {
            handleDescendants()
            reInitChecked(this)
          },
          {
            checked: va !== false
          }
        )
        return
      } else {
        handleDescendants()
      }
    }

    const parent = this.parent
    if (!parent || parent.level === 0) return

    if (!recursion) {
      reInitChecked(parent)
    }
  }
  /**
   * 获取子数据，如果没有强制返回一个空数组
   */
  getChildren(forceInit = false) {
    if (this.level === 0) return this.data

    const data = this.data
    if (!data) return null

    const props = this.store.props
    let children = 'children'
    if (props) {
      children = props.children || 'children'
    }

    if (data[children] === undefined) {
      data[children] = null
    }

    if (forceInit && !data[children]) {
      data[children] = []
    }

    return data[children]
  }
  /**
   * 更新子数据
   */
  updateChildren() {
    const newData = this.getChildren() || []
    const oldData = this.childNodes.map(node => node.data)
    const newDataMap = {}
    const newNodes = []

    newData.forEach((item, index) => {
      const key = item[NODE_KEY]
      const isNodeExit =
        !!key && oldData.findIndex(data => data[NODE_KEY] === key) > 0
      if (isNodeExit) {
        newDataMap[key] = { index, data: item }
      } else {
        newNodes.push({ index, data: item })
      }
    })

    if (!this.store.lazy) {
      oldData.forEach(item => {
        if (!newDataMap[item[NODE_KEY]]) {
          this.removeChildByData(item)
        }
      })
    }

    newNodes.forEach(({ index, data }) => {
      this.insertChildren({ data }, index)
    })

    this.updateLeafState()
  }
  loadData(callback, defaultProps = {}) {
    if (
      this.store.lazy &&
      this.store.load &&
      !this.loaded &&
      (!this.loading || Object.keys(defaultProps).length)
    ) {
      this.loading = true

      const resolve = children => {
        this.loaded = true
        this.loading = false
        this.childNodes = []
        this.doCreateChildren(children, defaultProps)
        this.updateLeafState()

        if (callback) {
          callback.call(this, children)
        }
      }

      this.store.load(this, resolve)
    } else {
      if (callback) {
        callback.call(this)
      }
    }
  }
}

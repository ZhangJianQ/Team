<template>
  <div class="tree"
       :class="{
    'el-tree--highlight-current':highlightCurrent,
    'is-dragging':!!dragState.draggingNode,
    'not-drop':!dragState.allowDrop,
    'is-drop-inner':dragState.dropType==='inner'
  }">
    <tree-node v-for="child in root.childNodes"
               :node="child"
               :props="props"
               :render-after-expand="renderAfterExpand"
               :show-checkbox="showCheckbox"
               :key="getNodeKey(child)"
               :render-content="renderContent"
               @node-expand="handleNodeExpand"></tree-node>
    <div class="tree__empty-block"
         v-if="isEmpty">
      <span class="tree__empty-text">{{emptyText}}</span>
    </div>
    <div v-show="dragState.showDropIndicator"
         ref="dropIndicator"
         class="tree__drop-indicator"></div>
  </div>
</template>
<script>
import Emitter from '@/mixins/emitter'
import TreeNode from './tree-node.vue'
import { getNodeKey, findNearestComponent } from './tree-util'
import { removeClass } from '../utils/dom'
import TreeStore from './tree-store'

export default {
  name: 'Tree',
  mixins: [Emitter],
  components: {
    TreeNode
  },
  props: {
    data: Array,
    emptyText: {
      type: String,
      default: '没有数据'
    },
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false
    },
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    defaultCheckedKeys: Array,
    defaultExpandKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: false
    },
    allowDrag: Function,
    allowDrop: Function,
    props: {
      default() {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled'
        }
      }
    },
    lazy: {
      type: Boolean,
      default: false
    },
    highlightCurrent: Boolean,
    load: Function,
    filterNodeMethod: Function,
    accordion: Boolean,
    indent: {
      type: Number,
      default: 18
    },
    iconClass: String
  },
  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
      treeItems: null,
      checkboxItems: [],
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true
      }
    }
  },
  computed: {
    children: {
      set(val) {
        this.data = val
      },
      get() {
        return this.data
      }
    },
    treeItemArray() {
      return Array.prototype.slice.call(this.treeItems)
    },
    isEmpty() {
      const { childNodes } = this.root
      return (
        !childNodes ||
        childNodes.length === 0 ||
        childNodes.every(c => !c.visible)
      )
    }
  },
  watch: {
    defaultCheckedKeys(val) {
      this.store.setDefaultCheckedKey(val)
    },
    defaultExpandKeys(val) {
      this.store.defaultExpandKeys = val
      this.store.setDefaultExpandedKeys(val)
    },
    data(val) {
      this.store.setData(val)
    },
    checkboxItems(val) {
      Array.prototype.forEach.call(val, checkbox => {
        checkbox.setAttribute('tabindex', -1)
      })
    },
    checkStrictly(val) {
      this.store.checkStrictly = val
    }
  },
  methods: {
    filter(val) {
      if (!this.filterNodeMethod) {
        throw new Error('filterNodeMethod is required')
      }
      this.store.filter(val)
    },
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    },
    /**
     * 获取数据节点所在的树
     */
    getNodePath(data) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }

      const node = this.store.getNode(data)
      if (!node) {
        return []
      }
      let parent = node.parent
      while (parent && parent !== this.root) {
        path.push(parent.data)
        parent = parent.parent
      }
      return path.reverse()
    },
    getCheckedNodes(leafOnly, includeHalfChecked) {
      return this.store.getCheckedNodes(leafOnly, includeHalfChecked)
    },
    getCheckedKeys(leafOnly) {
      return this.store.getCheckedKeys(leafOnly)
    },
    getCurrentNode() {
      const currentNode = this.store.getCurrentNode()
      return currentNode ? currentNode.data : null
    },
    getCurrentKey() {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      const currentNode = this.getCurrentNode()
      return currentNode ? currentNode[this.nodeKey] : ''
    },
    setCheckedNodes(keys, leafOnly) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      this.store.setCheckedNodes(keys, leafOnly)
    },
    setCheckedKeys(keys, leafOnly) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      this.store.setCheckedKeys(keys, leafOnly)
    },
    setChecked(data, checked, deep) {
      this.store.setChecked(data, checked, deep)
    },
    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes()
    },
    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys()
    },
    setCurrentNode(node) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      this.store.setUserCurrentNode(node)
    },
    setCurrentKey(key) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      this.store.setCurrentNodeKey(key)
    },
    getNode(data) {
      return this.store.getNode(data)
    },
    remove(data) {
      this.store.remove(data)
    },
    append(data, parentNode) {
      this.store.append(data, parentNode)
    },
    insertBefore(data, refNode) {
      this.store.insertBefore(data, refNode)
    },
    insertAfter(data, refNode) {
      this.store.insertAfter(data, refNode)
    },
    handleNodeExpand(nodeData, node, instance) {
      this.broadcast('TreeNode', 'tree-node-expand', node)
      this.$emit('node-expand', nodeData, node, instance)
    },
    updateKeyChildren(key, data) {
      if (!this.nodeKey) {
        throw new Error('nodekey is required')
      }
      this.store.updateChildren(key, data)
    },
    initTableIndex() {
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')
      this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')
      const checkedItem = this.$el.querySelectorAll(
        '.is-checked[role=treeitem]'
      )

      if (checkedItem.length) {
        checkedItem[0].setAttribute('tabindex', 0)
        return
      }
      this.treeItems[0] && this.treeItems[0].setAttribute('tabindex', 0)
    },
    handleKeydown(evt) {
      const currentItem = evt.target
      if (currentItem.className.indexOf('tree-node') === -1) {
        return
      }
      const keyCode = evt.keyCode
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]')
      const currentIndex = this.treeItemArray.indexOf(currentItem)
      let nextIndex
      if ([38, 40].indexOf(keyCode) > -1) {
        evt.preventDefault()
        if (keyCode === 38) {
          nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0
        } else {
          nextIndex =
            currentIndex < this.treeItemArray.length - 1 ? currentIndex + 1 : 0
        }
        this.treeItemArray[nextIndex].focus()
      }
      if ([37, 39].indexOf(keyCode) > -1) {
        // left、right 展开
        evt.preventDefault()
        currentItem.click() // 选中
      }

      const hasInput = currentItem.querySelector('[type=checkbox]')
      if ([13, 32].indexOf(keyCode) > -1 && hasInput) {
        evt.preventDefault()
        hasInput.click()
      }
    }
  },
  /**
   * 设置拖拽，合并store数据
   */
  created() {
    this.isTree = true
    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      load: this.load,
      props: this.props,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandKeys: this.defaultExpandKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod
    })

    this.root = this.store.root

    // 拖动
    let dragState = this.dragState
    this.$on('tree-node-drag-start', (evt, treeNode) => {
      if (
        typeof this.allowDrag === 'function' &&
        !this.allowDrag(treeNode.node)
      ) {
        evt.preventDefault()
        return false
      }
      evt.dataTransfer.effectAllowed = 'move'

      try {
        evt.dataTransfer.setData('text/plain', '')
      } catch (e) {}
      dragState.draggingNode = treeNode
      this.$emit('node-drag-start', treeNode.node, evt)
    })

    this.$on('tree-node-drag-over', evt => {
      const dropNode = findNearestComponent(evt.target, 'TreeNode')
      const oldDropNode = dragState.draggingNode

      if (oldDropNode && oldDropNode !== dropNode) {
        removeClass(oldDropNode.$el, 'is-drop-inner')
      }

      const draggingNode = dragState.draggingNode

      if (!draggingNode || !dropNode) return
      let dropPrev = true,
        dropInner = true,
        dropNext = true,
        userAllowDropInner = true

      if (typeof this.allowDrop === 'function') {
        dropPrev = this.allowDrop(draggingNode.node, dropNode.node, 'prev')
        userAllowDropInner = dropInner = this.allowDrop(
          draggingNode.node,
          dropNode.node,
          'inner'
        )
        dropNext = this.allowDrop(draggingNode.node, dropNode.node, 'next')
      }
      evt.dataTransfer.dropEffect = dropInner ? 'move' : 'none'

      if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
        if (oldDropNode) {
          this.$emit(
            'node-drag-leave',
            draggingNode.node,
            oldDropNode.node,
            evt
          )
        }
        this.$emit('node-drag-enter', draggingNode.node, dropNode.node, evt)
      }

      if (dropPrev || dropInner || dropNext) {
        dragState.dropNode = dropNode
      }

      if (dropNode.node.nextSibling === draggingNode.node) {
        dropNext = false
      }

      if (dropNode.node.contains(draggingNode.node, false)) {
        dropInner = false
      }

      if (
        draggingNode.node === dropNode.node ||
        draggingNode.node.contains(dropNode.node)
      ) {
        dropPrev = false
        dropInner = false
        dropNext = false
      }

      const targetPosition = dropNode.$el.getBoundingClientRect()
      const treePosition = this.$el.getBoundingClientRect()
      let dropType
      const prevPercent = dropPrev
        ? dropInner
          ? 0.25
          : dropNext
          ? 0.45
          : 1
        : -1
      const nextPercent = dropNext
        ? dropInner
          ? 0.75
          : dropPrev
          ? 0.55
          : 0
        : 1

      let indicatoreTop = -9999
      const distance = evt.clientY - targetPosition.top

      if (distance < targetPosition.height * prevPercent) {
        dropType = 'before'
      } else if (distance > targetPosition.height * nextPercent) {
        dropType = 'after'
      } else if (dropInner) {
        dropType = 'inner'
      } else {
        dropType = 'none'
      }

      const iconPosition = dropNode.$el
        .querySelector('.el-tree-node__expand-icon')
        .getBoundingClientRect()
      const dropIndicator = this.$refs.dropIndicator
      if (dropType === 'before') {
        indicatorTop = iconPosition.top - treePosition.top
      } else if (dropType === 'after') {
        indicatorTop = iconPosition.bottom - treePosition.top
      }
      dropIndicator.style.top = indicatorTop + 'px'
      dropIndicator.style.left = iconPosition.right - treePosition.left + 'px'

      if (dropType === 'inner') {
        addClass(dropNode.$el, 'is-drop-inner')
      } else {
        removeClass(dropNode.$el, 'is-drop-inner')
      }

      dragState.showDropIndicator =
        dropType === 'before' || dropType === 'after'
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner
      dragState.dropType = dropType
      this.$emit('node-drag-over', draggingNode.node, dropNode.node, evt)
    })

    this.$on('tree-node-drag-end', event => {
      const { draggingNode, dropType, dropNode } = dragState
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (draggingNode && dropNode) {
        const draggingNodeCopy = { data: draggingNode.node.data }
        if (dropType !== 'none') {
          draggingNode.node.remove()
        }
        if (dropType === 'before') {
          dropNode.node.parent.insertBefore(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'after') {
          dropNode.node.parent.insertAfter(draggingNodeCopy, dropNode.node)
        } else if (dropType === 'inner') {
          dropNode.node.insertChild(draggingNodeCopy)
        }
        if (dropType !== 'none') {
          this.store.registerNode(draggingNodeCopy)
        }

        removeClass(dropNode.$el, 'is-drop-inner')

        this.$emit(
          'node-drag-end',
          draggingNode.node,
          dropNode.node,
          dropType,
          event
        )
        if (dropType !== 'none') {
          this.$emit(
            'node-drop',
            draggingNode.node,
            dropNode.node,
            dropType,
            event
          )
        }
      }
      if (draggingNode && !dropNode) {
        this.$emit('node-drag-end', draggingNode.node, null, dropType, event)
      }

      dragState.showDropIndicator = false
      dragState.draggingNode = null
      dragState.dropNode = null
      dragState.allowDrop = true
    })
  },
  mounted() {
    this.initTableIndex()
    this.$el.addEventListener('keydown', this.handleKeydown)
  },
  updated() {
    this.treeItems = this.$el.querySelectorAll('[role=treeitem]')
    this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]')
  }
}
</script>
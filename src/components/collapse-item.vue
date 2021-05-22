<template>
  <div class="collapse-item"
       :class="{'is-active':isActive, 'is-disabled':disabled}">
    <div role="tab">
      <div class="collapse-item__header"
           @click="handleHeaderClick"
           :id="`collapse-header-${id}`"
           :class="{'is-active':isActive}">
        <slot name="title">{{title}}</slot>
        <span>{{isActive?'折叠':'展开'}}</span>
      </div>
      <div class="collapse-item__content"
           v-show="isActive">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
const generateId = function () {
  return Math.floor(Math.random() * 10000)
}
import Emitter from '@/mixins/emitter'
export default {
  name: 'CollapseItem',
  mixins: [Emitter],
  props: {
    title: String,
    name: {
      type: [String, Number],
      default() {
        return this._uid
      }
    },
    disabled: false
  },
  computed: {
    isActive() {
      return this.collapse.activeNames.indexOf(this.name) > -1
    }
  },
  data() {
    return {
      id: generateId()
    }
  },
  inject: ['collapse'],
  methods: {
    handleHeaderClick() {
      if (this.disabled) return
      this.dispatch('Collapse', 'item-click', this)
    }
  }
}
</script>
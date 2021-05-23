<template>
  <li class="dropdown__item"
      :class="{
        'is-disabled':disabled,
        'dropdown-menu__item--divided':divided
      }"
      @click="handleClick">
    <slot></slot>
  </li>
</template>

<script>
import Emitter from '@/mixins/emitter'
export default {
  name: 'DropdownItem',
  mixins: [Emitter],
  props: {
    disabled: Boolean,
    divided: Boolean,
    command: {}
  },
  methods: {
    handleClick() {
      this.dispatch('Dropdown', 'menu-item-click', [this.command, this])
    }
  }
}
</script>

<style lang="scss">
.dropdown-menu__item--divided {
  border-bottom: 1px solid #000;
}
</style>
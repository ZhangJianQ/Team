<template>
  <div class="tab-pane"
       v-if="visible"
       v-show="active"
       :id="`pane-${paneName}`">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'TabPane',
  props: {
    label: String,
    labelContent: String,
    name: String,
    closable: Boolean,
    disabled: Boolean,
    lazy: Boolean
  },
  computed: {
    visible() {
      return !this.lazy || this.loaded || this.active
    },
    active() {
      const active = this.$parent.currentName === (this.name || this.index)

      if (active) {
        this.loaded = true
      }

      return active
    },
    paneName() {
      return this.name || this.index
    }
  },
  data() {
    return {
      loaded: false,
      index: null
    }
  },
  updated() {
    this.$parent.$emit('tab-nav-update')
  }
}
</script>
<template>
  <div class="alert" :class="[typeClass, 'is-' + effect]" v-show="visible">
    <i v-if="showIcon" :class="[iconClass]"></i>
    <div class="alert__content">
      <slot name="title">{{ title }}</slot>
      <div class="alert__description">
        <slot>{{ description }}</slot>
      </div>
      <div class="alert__closebtn" @click="handleClose">关闭</div>
    </div>
  </div>
</template>
<script>
const TYPE_ICON_CLASSES = {
  success: 'icon-success',
  warn: 'icon-warning',
  error: 'icon-error'
}
export default {
  props: {
    type: {
      type: String,
      default: 'info'
    },
    showIcon: Boolean,
    title: String,
    description: String,
    effect: {
      type: String,
      default: 'light',
      validator: function (value) {
        return ['light', 'dark'].indexOf(value) !== -1
      }
    }
  },
  data() {
    return {
      visible: true
    }
  },
  computed: {
    typeClass() {
      return `alert--${this.type}`
    },
    iconClass() {
      return TYPE_ICON_CLASSES[this.type]
    }
  },
  methods: {
    handleClose() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus">
.alert--warn
  &.is-light
    color orange

  &.is-dark
    color red
</style>
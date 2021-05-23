<template>
  <div class="divider"
       v-bind="$attrs"
       v-on="$listeners"
       :class="[`divider--${direction}`]">
    <div class="divider__text"
         :class="[`is-${contentPosition}`]"
         v-if="$slots.default && direction !== 'vertical'">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    contentPosition: {
      type: String,
      default: 'center',
      validator(val) {
        return ['left', 'right', 'center'].indexOf(val) !== -1
      }
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1
      }
    }
  }
}
</script>

<style lang="scss">
.divider {
  background-color: #dcdfe6;
  position: relative;
}

.divider--horizontal {
  display: block;
  height: 1px;
  width: 100%;
  margin: 24px 0;
}

.divider--vertical {
  position: relative;
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 8px;
  vertical-align: middle;
}

.divider__text {
  position: absolute;
  padding: 0 10px;
  background-color: #fff;
  left: 20px;
  transform: translateY(-50%);

  &.is-right {
    left: auto;
    right: 20px;
  }
}
</style>
<template>
  <div class="card"
       :class="shadow?'is-'+shadow:'is-always-shadow'">
    <div class="card__header"
         v-if="$slots.header||header">
      <slot name="header">{{header}}</slot>
    </div>
    <div class="card__body"
         :style="bodyStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    header: {},
    bodyStyle: {},
    shadow: {
      type: String
    }
  }
}
</script>

<style lang="scss">
.card {
  border-radius: 4px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  overflow: hidden;
  color: #303133;
  transition: 0.3s;

  .is-always-shadow {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}
</style>
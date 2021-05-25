<template>
  <a
    :href="disabled ? '' : href"
    :class="[
      'el-link',
      `el-link--${type}`,
      {
        'is-disabled': disabled,
        'is-underline': underline && !disabled
      }
    ]"
    v-bind="$attrs"
  ></a>
</template>

<script>
export default {
  name: 'Link',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    underline: {
      type: Boolean,
      defualt: true
    },
    disabled: Boolean,
    href: String
  }
}
</script>
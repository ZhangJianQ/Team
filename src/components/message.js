import Vue from 'vue'
import Main from './message.vue'
// 以原型的方式扩展 message 组件
// 手动触发生成组件
let MessageConstructor = Vue.extend(Main)
let seed = 1
let instance = null
let instances = []
let zIndex = 2000
let types = ['success', 'warning', 'info', 'error']

const Message = function(options = {}) {
  if (Vue.prototype.$isServer) return

  if (typeof options === 'string') {
    options = {
      message: message
    }
  }
  let userOnClose = options.onClose
  let id = 'message_' + seed++

  options.onClose = function() {
    Message.close(id, userOnClose)
  }
  instance = new MessageConstructor({
    data: options
  })
  instance.id = id

  // 虚拟DOM
  instance.$mount()
  document.body.appendChild(instance.$el)

  let verticalOffset = options.offset || 20
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 20
  })
  instance.verticalOffset = verticalOffset
  instance.visible = true
  instance.$el.style.zIndex = zIndex++
  instances.push(instance)

  return instance
}

types.forEach(type => {
  Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
      options.type = type
      return Message(options)
    }
  }
})

// 覆盖 message 组件的 close 方法
Message.close = function(id, userOnClose) {
  let len = instances.length
  let index = -1
  let removeHeight

  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      removeHeight = instances[i].$el.offsetHeight
      index = i
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i])
      }
      instances.splice(index, 1)
      break
    }
  }

  if (len <= 1 || index === -1 || index > instances.length - 1) return

  // 从被删除的元素开始，依次重新计算高度
  for (let i = index; i < len - 1; i++) {
    let dom = instances[i].$el
    dom.style['top'] = parseInt(dom.style['top']) - removeHeight - 20 + 'px'
  }
}

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

export default Message

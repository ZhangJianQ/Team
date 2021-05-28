import Vue from 'vue'
import Main from './notification.vue'

const NotificationContructor = Vue.extend(Main)
let instance = null
let instances = []
let uid = 1
let zIndex = 2000

const Notification = function(options) {
  options = Object.assign({}, options)
  const userOnClose = options.onClose
  const id = 'notification_' + uid++
  const position = options.position || 'top-right'

  options.onClose = function() {
    Notification.close(id, userOnClose)
  }

  instance = new NotificationContructor({
    data: options
  })

  instance.id = id
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.visible = true
  instance.dom = instance.$el
  instance.dom.style.zIndex = zIndex++

  // 计算偏移量
  let verticalOffset = options.offset || 0
  instances
    .filter(item => item.position === position)
    .forEach(item => {
      verticalOffset += item.$el.offsetHeight + item.offset || 16
    })
  instance.verticalOffset = verticalOffset
  instances.push(instance)
  return instance
}

const TYPES = ['success', 'info', 'warning', 'error']
TYPES.forEach(type => {
  // 工厂函数方式创建不同类型的通知
  Notification[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      }

      options.type = type
      return Notification(options)
    }
  }
})

Notification.close = function(id, userOnClose) {
  let index = -1
  const len = instances.length
  const instance = instances.filter((ins, i) => {
    if (ins.id === id) {
      index = i
      return true
    }
    return false
  })[0]

  if (!instance) return

  if (typeof userOnClose === 'function') {
    userOnClose(instance)
  }
  instances.splice(index, 1)

  if (len <= 1) return
  const position = instance.position
  const removeHeight = instance.dom.offsetHeight

  // 调整每个通知框的高度
  for (let i = index; i < len - 1; i++) {
    if (instances[i].position === position) {
      instances[i].dom.style[instance.verticalProperty] =
        parseInt(instances[i].dom.style[instance.verticalProperty], 10) -
        removeHeight -
        16 +
        'px'
    }
  }
}

Notification.closeAll = function() {
  // 从后往前移除元素，防止从前往后移除触发调整位置的操作
  for (let i = instance.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

export default Notification

import Vue from 'vue'
import messageBoxMain from './message-box.vue'

const defaultOptions = {
  title: null,
  message: '',
  type: '',
  showInput: false,
  showClose: true,
  inputValue: null,
  inputType: 'text',
  beforeClose: null,
  cancelOrClose: false
}
const defaultBooleanOptions = [
  'modal',
  'showClose',
  'closeOnClickModal',
  'closeOnPressEscape',
  'closeOnHashChange'
]
const MessageBoxContrustor = Vue.extend(messageBoxMain)
let currentMessage, instance
let messageBoxs = []
/**
 * 代理模式
 * 回调包装器，执行消息框操作回调
 * @param {string} action
 */
const defaultCallback = action => {
  // 执行 callback 回调
  if (currentMessage) {
    let callback = currentMessage.callback
    if (typeof callback === 'function') {
      if (instance.showInput) {
        callback(instance.inputValue, action)
      } else {
        callback(action)
      }
    }

    // 触发期约
    if (currentMessage.resolve) {
      if (action === 'confirm') {
        if (instance.showInput) {
          currentMessage.resolve({
            value: instance.inputValue,
            action
          })
        } else {
          currentMessage.resolve(action)
        }
      } else if (
        currentMessage.reject &&
        (action === 'cancel' || action === 'close')
      ) {
        currentMessage.reject(action)
      }
    }
  }
}

const initInstance = () => {
  instance = new MessageBoxContrustor({
    el: document.createElement('div')
  })

  instance.callback = defaultCallback
}

// 手动控制 messagebox 的插入和显示
const showNextMsg = () => {
  if (!instance) {
    initInstance()
  }
  instance.action = ''

  if (!instance.visible || instance.closeTimer) {
    if (messageBoxs.length > 0) {
      currentMessage = messageBoxs.shift()

      let options = currentMessage.options
      for (let prop in options) {
        if (options.hasOwnProperty(prop)) {
          instance[prop] = options[prop]
        }
      }

      if (options.callback === undefined) {
        options.callback = defaultCallback
      }

      // 回调函数包装器
      let oldCallback = instance.callback
      instance.callback = (action, instance) => {
        oldCallback(action, instance)
        showNextMsg()
      }

      delete instance.$slots.default

      defaultBooleanOptions.forEach(prop => {
        if (instance[prop] === undefined) {
          instance[prop] = true
        }
      })

      document.body.appendChild(instance.$el)

      Vue.nextTick(() => {
        instance.visible = true
      })
    }
  }
}

// 合并参数，执行
const MessageBox = function(options, callback) {
  if (typeof options === 'string') {
    options = {
      message: options
    }

    if (typeof arguments[1] === 'string') {
      options.title = arguments[1]
    }
  } else if (options.callback && !callback) {
    callback = options.callback
  }

  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => {
      messageBoxs.push({
        options: Object.assign(
          {},
          defaultOptions,
          MessageBox.defaults,
          options
        ),
        callback,
        resolve,
        reject
      })

      showNextMsg()
    })
  } else {
    messageBoxs.push({
      options: Object.assign({}, defaultOptions, MessageBox.defaults, options),
      callback
    })

    showNextMsg()
  }
}

MessageBox.setDefaults = defaults => {
  MessageBox.defaults = defaults
}

// 定义类别，主要是合并参数
MessageBox.alert = (message, title, options) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  } else if (title === undefined) {
    title = ''
  }

  return MessageBox(
    Object.assign(
      {
        title,
        message,
        $type: 'alert',
        closeOnPressEscape: false,
        closeOnClickModal: false
      },
      options
    )
  )
}

MessageBox.confirm = (message, title, options) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  } else if (title === undefined) {
    title = ''
  }

  return MessageBox(
    Object.assign(
      {
        title,
        message,
        $type: 'confirm',
        showCancelButton: true
      },
      options
    )
  )
}

MessageBox.prompt = (message, title, options) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  } else if (title === undefined) {
    title = ''
  }

  return MessageBox(
    Object.assign(
      {
        title,
        message,
        showCancelButton: true,
        showInput: true,
        $type: 'prompt'
      },
      options
    )
  )
}

MessageBox.close = () => {
  instance.doClose()
  instance.visible = true
  messageBoxs = []
  currentMessage = null
}

export default MessageBox
export { MessageBox }

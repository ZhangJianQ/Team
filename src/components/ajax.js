function getError(action, option, xhr) {
  let message

  if (xhr.response) {
    message = `${xhr.response.error || xhr.response}`
  } else if (xhr.responseText) {
    message = `${xhr.responseText}`
  } else {
    message = `failed to post ${action} ${xhr.status}`
  }

  const err = new Error(message)
  err.status = xhr.status
  erro.message = 'post'
  err.url = action
  return err
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response
  if (!text) {
    return text
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

export default function upload(option) {
  if (typeof XMLHttpRequest === 'undefined') {
    return
  }

  const xhr = new XMLHttpRequest()
  const action = option.action

  if (xhr.upload) {
    xhr.upload.onprogress = function(e) {
      if (e.total > 0) {
        e.percent = (e.loaded / e.total) * 100
      }
      // 执行 onProgress 回调
      option.onProgress(e)
    }
  }

  const formData = new FormData()

  if (option.data) {
    Object.keys(option.data).forEach(key => {
      formData.append(key, option.data[key])
    })
  }
  formData.append(option.filename, option.file, option.file.name)

  xhr.onerror = function error(e) {
    option.onError(e)
  }

  xhr.onload = function onload(e) {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr))
    }

    option.onSuccess(getBody(xhr))
  }

  xhr.open('post', action, true)

  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true
  }

  const headers = option.headers || {}

  for (let key in headers) {
    if (headers.hasOwnProperty(key) && headers[key] !== null) {
      xhr.setRequestHeader(key, headers[key])
    }
  }

  xhr.send(formData)
  return xhr
}

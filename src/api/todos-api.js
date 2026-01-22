import Axios from 'axios'

// Helper: ensure newTodo has all required fields
function normalizeTodo(newTodo) {
  return {
    name: newTodo.name || 'Untitled',
    dueDate: newTodo.dueDate || new Date().toISOString(),
    done: newTodo.done ?? false
  }
}

export async function getTodos(accessToken) {
  const response = await Axios.get(
    `${process.env.REACT_APP_API_ENDPOINT}/todos`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  console.log('Todos:', response.data)
  console.log('Fetching todos', response.data.items)
  return response.data.items
}

export async function createTodo(accessToken, newTodo) {
  const normalizedTodo = normalizeTodo(newTodo)

  const response = await Axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/todos`,
    normalizedTodo, // Axios automatically stringifies objects
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  // Ensure returned item has done and todoId
  const item = response.data.item
  return {
    todoId: item.todoId,
    name: item.name,
    dueDate: item.dueDate,
    done: item.done ?? false
  }
}

export async function patchTodo(accessToken, todoId, updatedTodo) {
  await Axios.patch(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}`,
    updatedTodo,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
}

export async function deleteTodo(accessToken, todoId) {
  await Axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
}

export async function getUploadUrl(accessToken, todoId) {
  const response = await Axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/todos/${todoId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl, file) {
  await Axios.put(uploadUrl, file)
}

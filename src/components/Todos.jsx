import update from 'immutability-helper'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'

import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import {
  deleteTodo,
  getTodos,
  patchTodo,
  createTodo,
  getUploadUrl,
  uploadFile
} from '../api/todos-api'
import { NewTodoInput } from './NewTodoInput'

export function Todos() {
  const { getAccessTokenSilently } = useAuth0()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const navigate = useNavigate()

  // Fetch all todos on mount
  useEffect(() => {
    async function fetchTodos() {
      try {
        const token = await getAccessTokenSilently({
          audience: 'https://test-endpoint',
          scope: 'read:todos'
        })
        const todosFromApi = await getTodos(token)
        const normalized = todosFromApi.map((t) => ({
          todoId: t.todoId,
          name: t.name || 'Untitled',
          dueDate: t.dueDate || new Date().toISOString(),
          done: t.done ?? false,
          attachmentUrl: t.attachmentUrl || null
        }))
        setTodos(normalized)
      } catch (err) {
        console.error('Failed to fetch todos', err)
        alert('Failed to fetch todos')
      } finally {
        setLoadingTodos(false)
      }
    }

    fetchTodos()
  }, [getAccessTokenSilently])

  // Create a new todo
  async function handleNewTodo(newTodo) {
    try {
      const token = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })
      const createdTodo = await createTodo(token, newTodo)
      const normalized = {
        todoId: createdTodo.todoId,
        name: createdTodo.name || 'Untitled',
        dueDate: createdTodo.dueDate || new Date().toISOString(),
        done: createdTodo.done ?? false,
        attachmentUrl: createdTodo.attachmentUrl || null
      }
      setTodos((prev) => [...prev, normalized])
    } catch (err) {
      console.error('Failed to create todo', err)
      alert('Failed to create todo')
    }
  }

  // Toggle todo done
  async function onTodoCheck(pos) {
    const todo = todos[pos]
    try {
      const token = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })
      await patchTodo(token, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(update(todos, { [pos]: { done: { $set: !todo.done } } }))
    } catch (err) {
      console.error('Failed to update todo', err)
      alert('Failed to update todo')
    }
  }

  // Delete a todo
  async function onTodoDelete(todoId) {
    try {
      const token = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'delete:todos'
      })
      await deleteTodo(token, todoId)
      setTodos((prev) => prev.filter((t) => t.todoId !== todoId))
    } catch (err) {
      console.error('Failed to delete todo', err)
      alert('Failed to delete todo')
    }
  }

  // Navigate to edit page
  function onEditButtonClick(todoId) {
    navigate(`/todos/${todoId}/edit`)
  }

  // Handle file upload for a todo
  async function onFileChange(todoId, file) {
    try {
      const token = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })
      const { uploadUrl, attachmentUrl } = await getUploadUrl(token, todoId)
      await uploadFile(uploadUrl, file)

      // Update todo locally with new attachment URL
      setTodos((prev) =>
        prev.map((t) => (t.todoId === todoId ? { ...t, attachmentUrl } : t))
      )
    } catch (err) {
      console.error('Failed to upload file', err)
      alert('Failed to upload file')
    }
  }

  function renderLoading() {
    return (
      <Grid.Row>
        <Loader active inline="centered" indeterminate>
          Loading TODOs...
        </Loader>
      </Grid.Row>
    )
  }

  function renderTodosList() {
    if (!todos.length) return <p>No todos yet!</p>

    return (
      <Grid padded>
        {todos.map((todo, pos) => (
          <Grid.Row key={todo.todoId}>
            <Grid.Column width={1} verticalAlign="middle">
              <Checkbox
                checked={todo.done}
                onChange={() => onTodoCheck(pos)}
              />
            </Grid.Column>
            <Grid.Column width={10} verticalAlign="middle">
              {todo.name}
            </Grid.Column>
            <Grid.Column width={3} floated="right">
              {todo.dueDate}
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                icon
                color="blue"
                onClick={() => onEditButtonClick(todo.todoId)}
              >
                <Icon name="pencil" />
              </Button>
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                icon
                color="red"
                onClick={() => onTodoDelete(todo.todoId)}
              >
                <Icon name="delete" />
              </Button>
            </Grid.Column>

            {todo.attachmentUrl && (
              <Grid.Column width={16}>
                <Image src={todo.attachmentUrl} size="medium" wrapped />
              </Grid.Column>
            )}

            <Grid.Column width={16}>
              <Divider />
            </Grid.Column>
          </Grid.Row>
        ))}
      </Grid>
    )
  }

  return (
    <div>
      <Header as="h1">TODOs</Header>
      <NewTodoInput onNewTodo={handleNewTodo} />
      {loadingTodos ? renderLoading() : renderTodosList()}
    </div>
  )
}

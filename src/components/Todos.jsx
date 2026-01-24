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
import { deleteTodo, getTodos, patchTodo, createTodo } from '../api/todos-api'
import { NewTodoInput } from './NewTodoInput'

export function Todos() {
  const { getAccessTokenSilently } = useAuth0()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTodos() {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: 'https://test-endpoint',
          scope: 'read:todos'
        })
        const todosFromApi = await getTodos(accessToken)

        const normalized = todosFromApi.map((t) => ({
          todoId: t.todoId,
          name: t.name || 'Untitled',
          dueDate: t.dueDate || new Date().toISOString(),
          done: t.done ?? false,
          attachmentUrl: t.attachmentUrl || null
        }))

        setTodos(normalized)
      } catch (e) {
        alert(`Failed to fetch todos: ${e.message}`)
        console.error(e)
      } finally {
        setLoadingTodos(false)
      }
    }

    fetchTodos()
  }, [getAccessTokenSilently])

  async function handleNewTodo(newTodo) {
    const trimmedName = newTodo.name?.trim()
    if (!trimmedName || trimmedName.length < 3) {
      alert("Todo name must be at least 3 characters and not all whitespace.")
      return
    }

    try {
      const accessToken = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })

      const createdTodo = await createTodo(accessToken, {
        ...newTodo,
        name: trimmedName
      })

      const normalized = {
        todoId: createdTodo.todoId,
        name: createdTodo.name || 'Untitled',
        dueDate: createdTodo.dueDate || new Date().toISOString(),
        done: createdTodo.done ?? false,
        attachmentUrl: createdTodo.attachmentUrl || null
      }

      setTodos((prev) => {
        const exists = prev.some((t) => t.todoId === normalized.todoId)
        if (exists) return prev
        return [...prev, normalized]
      })
    } catch (e) {
      alert('Failed to create a new TODO')
      console.error(e)
    }
  }

  async function onTodoCheck(pos) {
    try {
      const todo = todos[pos]
      const accessToken = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })
      await patchTodo(accessToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(update(todos, { [pos]: { done: { $set: !todo.done } } }))
    } catch (e) {
      console.error('Failed to update TODO', e)
      alert('Failed to update todo')
    }
  }

  async function onTodoDelete(todoId) {
    try {
      const accessToken = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'delete:todos'
      })
      await deleteTodo(accessToken, todoId)
      setTodos((prev) => prev.filter((t) => t.todoId !== todoId))
    } catch (e) {
      alert('Todo deletion failed')
      console.error(e)
    }
  }

  function onEditButtonClick(todoId) {
    navigate(`/todos/${todoId}/edit`)
  }

  function renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
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
                onChange={() => onTodoCheck(pos)}
                checked={todo.done}
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

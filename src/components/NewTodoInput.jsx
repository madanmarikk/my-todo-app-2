import { useAuth0 } from '@auth0/auth0-react'
import dateFormat from 'dateformat'
import React, { useState } from 'react'
import { Divider, Grid, Input } from 'semantic-ui-react'
import { createTodo } from '../api/todos-api'

export function NewTodoInput({ onNewTodo }) {
  const [newTodoName, setNewTodoName] = useState('')
  const { getAccessTokenSilently } = useAuth0()

  const onTodoCreate = async () => {
    if (!newTodoName.trim()) {
      alert('Please enter a task name')
      return
    }

    try {
      const accessToken = await getAccessTokenSilently({
        audience: 'https://test-endpoint',
        scope: 'write:todos'
      })
      const dueDate = calculateDueDate()
      const createdTodo = await createTodo(accessToken, {
        name: newTodoName,
        dueDate
      })

      const normalizedTodo = {
        todoId: createdTodo.todoId || Date.now().toString(),
        name: createdTodo.name || newTodoName,
        dueDate: createdTodo.dueDate || dueDate,
        done: createdTodo.done ?? false,
        attachmentUrl: createdTodo.attachmentUrl || null
      }

      onNewTodo(normalizedTodo)
      setNewTodoName('')
    } catch (e) {
      console.log('Failed to create a new TODO', e)
      alert('Todo creation failed')
    }
  }

  return (
    <Grid.Row>
      <Grid.Column width={16}>
        <Input
          action={{
            color: 'teal',
            labelPosition: 'left',
            icon: 'add',
            content: 'New task',
            onClick: onTodoCreate
          }}
          fluid
          actionPosition="left"
          placeholder="To change the world..."
          value={newTodoName}
          onChange={(event) => setNewTodoName(event.target.value)}
        />
      </Grid.Column>
      <Grid.Column width={16}>
        <Divider />
      </Grid.Column>
    </Grid.Row>
  )
}

function calculateDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return dateFormat(date, 'yyyy-mm-dd')
}

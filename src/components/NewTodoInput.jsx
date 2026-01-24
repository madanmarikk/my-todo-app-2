import React, { useState } from 'react'
import { Divider, Grid, Input } from 'semantic-ui-react'

export function NewTodoInput({ onNewTodo }) {
  const [newTodoName, setNewTodoName] = useState('')

  const onTodoCreate = () => {
    const trimmedName = newTodoName.trim()
    if (!trimmedName || trimmedName.length < 3) {
      alert('Todo name must be at least 3 characters and not all whitespace.')
      return
    }

    const dueDate = calculateDueDate()

    // Pass the todo to parent, parent will handle API
    onNewTodo({ name: trimmedName, dueDate })

    setNewTodoName('')
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
  return date.toISOString().split('T')[0] // yyyy-mm-dd
}

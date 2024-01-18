const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find(user => user.username === username);

  if (!foundUser) {
    return response.status(404).json({
      error: 'User not found'
    });
  }
  
  request.user = foundUser;

  return next()
}


app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const foundUser = users.find(user => user.username === username);
 
  if (!foundUser) {
    const user = { 
      id: uuidv4(),
      name, 
      username,
      todos: []
    };
  
    users.push(user);
  
    return response.status(201).json(user)
  }

  return response.status(400).json({
    error: 'Username already exists'
  })

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if (!foundTodo){
    return response.status(404).json({
      error: 'To-do not found'
    })
  }

  foundTodo.title = title;
  foundTodo.deadline = deadline;

  return response.json(foundTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if (!foundTodo){
    return response.status(404).json({
      error: 'To-do not found'
    })
  }

  foundTodo.done = true;

  return response.json(foundTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);

  if (!foundTodo){
    return response.status(404).json({
      error: 'To-do not found'
    })
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  
  user.todos.splice(todoIndex, 1);

  return response.status(204).json()
});

module.exports = app;
const express = require('express');
const cors = require('cors');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const foundUser = users.find(user => user.username === request.headers.username);

  if (foundUser ===  undefined){
    response.status(404);

    return response.json({
        error: 'User not found'
    })
  } else {

    request.user = foundUser;
    next()
  }

}

app.post('/users', (request, response) => {
  const body = request.body;

  const user = new Object;
  user.id = String(users.length + 1);
  user.name = body.name;
  user.username = body.username;
  user.todos = [];

  users.push(user);

  return response.json(users[users.length - 1]);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const body = request.body;

  const todo = new Object;

  const hasTodos = user.todos[0] != [];

  todo.id = hasTodos ? user.todos.length + 1 : 0;
  todo.title = body.title;
  todo.done = false;
  todo.deadline = new Date(body.deadline);
  todo.creted_at = new Date();


  user.todos.push(todo);

  // console.log(user.todos);

  return response.json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const title = request.body.title;
  const deadline = request.body.deadline;
  const todoID = request.params.id;

  const foundTodo = user.todos.find(todo => todo.id == todoID);

  if (foundTodo ===  undefined){
    response.status(404);

    return response.json({
        error: 'To-do not found'
    })
  } else {

    foundTodo.title = title;
    foundTodo.deadline = deadline;
  
    return response.json(foundTodo)
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todoID = request.params.id;

  const foundTodo = user.todos.find(todo => todo.id == todoID);

  if (foundTodo ===  undefined){
    response.status(404);

    return response.json({
        error: 'To-do not found'
    })
  } else {
    foundTodo.done = true;
  
    return response.json(foundTodo)
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todoID = request.params.id;

  console.log(`todoID: ${todoID}`);

  const foundTodo = user.todos.find(todo => todo.id == todoID);

  if (foundTodo ===  undefined){
    response.status(404);

    return response.json({
        error: 'To-do not found'
    })
  } else {
    const index = user.todos.indexOf(foundTodo);

    const x = user.todos.splice(index, 1);
  
    return response.json()
  }
});

module.exports = app;
let express = require('express')
let app = express()

app.use(express.json())

let path = require('path')

let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let {format} = require('date-fns')
const {isMatch} = require('date-fns')

let dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

let initalizeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`Error: "${e.message}"`)
    process.exit(1)
  }
}

module.exports = app

initalizeDbandServer()

let checkRequest = (request, response, next) => {
  let {status, priority, search_q, category, date} = request.query
  if (status !== undefined) {
    try {
      status = status.replace('%20', ' ')
      let array = ['TO DO', 'IN PROGRESS', 'DONE']
      let checkStatus = array.includes(status)

      if (checkStatus === true) {
        request.status = status
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } // value
  else if (priority !== undefined) {
    try {
      let array = ['HIGH', 'LOW', 'MEDIUM']
      let checkPriority = array.includes(priority)
      if (checkPriority) {
        request.priority = priority
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else if (search_q !== undefined) {
    request.search_q = search_q
  } else if (category !== undefined) {
    let array = ['WORK', 'HOME', 'LEARNING']
    let checkCategory = array.includes(category)
    if (checkCategory) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  } // v
  else if (date !== undefined) {
    try {
      const result = format(new Date(date), 'yyyy-MM-dd')
      let isMatchValue = isMatch(date, 'yyyy-MM-dd')
      if (isMatchValue) {
        request.date = result
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  next()
}

let updateFunction = (request, response, next) => {
  let {
    status = '',
    priority = '',
    todo = '',
    category = '',
    dueDate = '',
  } = request.body
  if (status !== '') {
    try {
      let array = ['TO DO', 'IN PROGRESS', 'DONE']
      if (array.includes(status) === true) {
        request.status = status
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else if (priority !== '') {
    try {
      let array = ['HIGH', 'LOW', 'MEDIUM']
      let checkPriority = array.includes(priority)
      if (checkPriority === true) {
        request.priority = priority
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else if (todo !== '') {
    request.todo = todo
  } else if (category !== '') {
    try {
      let array = ['WORK', 'HOME', 'LEARNING']
      let checkCategory = array.includes(category)
      if (checkCategory) {
        request.category = category
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else if (dueDate !== '') {
    try {
      const result = format(new Date(dueDate), 'yyyy-MM-dd')
      let isMatchValue = isMatch(dueDate, 'yyyy-MM-dd')
      if (isMatchValue) {
        request.date = result
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  next()
}

let postFunction = (request, response, next) => {
  let {status, priority, category, dueDate} = request.body
  if (status !== undefined) {
    status = status.replace('%20', ' ')
    let array = ['TO DO', 'IN PROGRESS', 'DONE']
    let checkStatus = array.includes(status)

    if (checkStatus === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  } // value
  if (priority !== undefined) {
    let array = ['HIGH', 'LOW', 'MEDIUM']
    let checkPriority = array.includes(priority)
    if (checkPriority === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
  if (category !== undefined) {
    let array = ['WORK', 'HOME', 'LEARNING']
    let checkCategory = array.includes(category)
    if (checkCategory === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  } // v
  if (dueDate !== undefined) {
    try {
      const result = format(new Date(dueDate), 'yyyy-MM-dd')
      let isMatchValue = isMatch(dueDate, 'yyyy-MM-dd')
      if (isMatchValue === true) {
        request.date = result
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  next()
}

// API 1

app.get('/todos/', checkRequest, async (request, response) => {
  let {status = '', priority = '', search_q = '', category = ''} = request
  const returnListQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE status LIKE "%${status}%" AND priority LIKE "%${priority}%" AND todo LIKE "%${search_q}%" AND category LIKE "%${category}%";`
  let returnList = await db.all(returnListQuery)
  response.send(returnList)
})

// API 2

app.get('/todos/:todoId', async (request, response) => {
  let {todoId} = request.params
  const returnSingleQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id = ${todoId};`
  let returnSingle = await db.get(returnSingleQuery)
  response.send(returnSingle)
})

// API 3
app.get('/agenda/', checkRequest, async (request, response) => {
  let {date} = request
  const returnDateQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE due_date = "${date}";`
  let returnDateValue = await db.all(returnDateQuery)
  response.send(returnDateValue)
})

// API 4
app.post('/todos/', postFunction, async (request, response) => {
  let {id, todo} = request.body
  let {priority, status, category, date} = request
  const createTodoQuery = `INSERT INTO todo VALUES (${id},"${todo}","${priority}","${status}","${category}","${date}");`
  await db.run(createTodoQuery)
  response.send('Todo Successfully Added')
})

// API 5

app.put('/todos/:todoId', updateFunction, async (request, response) => {
  let {todoId} = request.params
  let {
    status = '',
    priority = '',
    todo = '',
    category = '',
    dueDate = '',
  } = request
  if (status !== '') {
    try {
      const updateSingleQuery = `UPDATE todo SET status = "${status}" WHERE id = ${todoId};`
      await db.run(updateSingleQuery)
      response.send('Status Updated')
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  if (priority !== '') {
    try {
      const updateSingleQuery = `UPDATE todo SET priority = "${priority}" WHERE id = ${todoId};`
      await db.run(updateSingleQuery)
      response.send('Priority Updated')
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  if (todo !== '') {
    try {
      const updateSingleQuery = `UPDATE todo SET todo = "${todo}" WHERE id = ${todoId};`
      await db.run(updateSingleQuery)
      response.send('Todo Updated')
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo')
    }
  }
  if (category !== '') {
    try {
      const updateSingleQuery = `UPDATE todo SET category = "${category}" WHERE id = ${todoId};`
      await db.run(updateSingleQuery)
      response.send('Category Updated')
    } catch (e) {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  if (dueDate !== '') {
    try {
      const updateSingleQuery = `UPDATE todo SET due_date = "${dueDate}" WHERE id = ${todoId};`
      await db.run(updateSingleQuery)
      response.send('Due Date Updated')
    } catch (e) {
      console.log(e.message)
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
})

// API 6
app.delete('/todos/:todoId', async (request, response) => {
  let {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

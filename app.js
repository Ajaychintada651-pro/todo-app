const express = require("express");
const app = express();

const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log(`Server Starting At http://localhost:3000/`);
    });
  } catch (err) {
    console.log(`DB Error:${err.message}`);
  }
};

initializeDBAndServer();

//API-1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery = "";

  if (priority !== undefined && status !== undefined) {
    getTodosQuery = `SELECT * FROM todo 
      WHERE 
      todo LIKE "%${search_q}%" AND 
      status LIKE "%${status}%" AND
      priority LIKE "%${priority}%";
      `;
  } else if (priority !== undefined && status === undefined) {
    getTodosQuery = `SELECT * FROM todo
    WHERE 
    todo LIKE "%${search_q}%" AND 
    priority LIKE "%${priority}%";
    `;
  } else if (status !== undefined && priority === undefined) {
    getTodosQuery = `SELECT * FROM todo
        WHERE
        todo LIKE "%${search_q}%" AND 
        status LIKE "%${status}%";
        `;
  } else {
    getTodosQuery = `SELECT * FROM todo
      WHERE 
      todo LIKE "%${search_q}%";
      `;
  }

  const dbResponse = await db.all(getTodosQuery);
  response.send(dbResponse);
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

//API-3
app.use(express.json());
app.post("/todos/", async (request, response) => {
  try {
    const todoDetails = request.body;
    const { id, todo, priority, status } = todoDetails;
    const createTodoQuery = `INSERT INTO todo (id,todo,priority,status) 
            VALUES (${id},'${todo}','${priority}','${status}');
            `;
    const dbResponse = await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  } catch (err) {
    console.log(err);
  }
});

//check-api
app.get("/todos/", async (request, response) => {
  const query = `SELECT * FROM todo ORDER BY id;`;
  const dbResponse = await db.all(query);
  response.send(dbResponse);
});

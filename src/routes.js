import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database;

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body;
      if (title && description) {
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        database.insert('tasks', task)
        return response.writeHead(201).end();
      } else {
        return response.writeHead(400).end(JSON.stringify(`Some information is missing!`));
      }
    },
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null);
      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;
      const tasks = database.select('tasks');
      const findTask = tasks.find(task => task.id === id);
      if (findTask === undefined) {
        return response.writeHead(404).end(JSON.stringify(`A task with the id: ${id} wasn't found!`));
      } else {
        const updatedTask = {
          ...findTask,
          title: title ? title : findTask.title,
          description: description ? description : findTask.description,
          updated_at: new Date().toISOString(),
        };
        database.update('tasks', id, updatedTask);
        return response.writeHead(204).end();
      }
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const tasks = database.select('tasks');
      const findTask = tasks.find(task => task.id === id);
      if (findTask === undefined) {
        return response.writeHead(404).end(JSON.stringify(`A task with the id: ${id} wasn't found!`));
      } else {
        database.delete('tasks', id);
        return response.writeHead(204).end();
      }
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;
      const tasks = database.select('tasks');
      const findTask = tasks.find(task => task.id === id);
      if (findTask === undefined) {
        return response.writeHead(404).end(JSON.stringify(`A task with the id: ${id} wasn't found!`));
      } else {
        const toggleCompleteTask = {
          ...findTask,
          completed_at: findTask.completed_at ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        database.complete('tasks', id, toggleCompleteTask);
        return response.writeHead(204).end();
      }
    },
  }
]
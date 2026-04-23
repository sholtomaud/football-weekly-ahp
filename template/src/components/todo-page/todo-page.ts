import { BaseComponent, html, css } from '../../core/base-component.ts';

const template = html`
<div class="todo-container">
  <h1>To-Do List</h1>
  <div class="add-task">
    <input type="text" id="new-task-input" placeholder="Enter a new task..." />
    <button id="add-task-btn">Add Task</button>
  </div>
  <ul id="task-list"></ul>
</div>
`;

const style = css`
.todo-container { padding: 2rem; max-width: 600px; margin: 0 auto; }
.add-task { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
input { flex-grow: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
button { padding: 0.5rem 1rem; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
ul { list-style: none; padding: 0; }
li { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #eee; }
.completed .task-text { text-decoration: line-through; color: #888; }
.task-text { cursor: pointer; flex-grow: 1; }
.delete-btn { background: #ff4d4d; color: white; border: none; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer; }
`;

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export class TodoPageComponent extends BaseComponent {
  static tagName = 'todo-page';
  tasks: Todo[] = [];
  nextTaskId = 1;
  taskInput!: HTMLInputElement;
  addTaskButton!: HTMLButtonElement;
  taskList!: HTMLElement;

  constructor() {
    super(template, style);
    this.loadTasks();
  }

  init() {
    this.taskInput = this.shadowRoot!.getElementById('new-task-input') as HTMLInputElement;
    this.addTaskButton = this.shadowRoot!.getElementById('add-task-btn') as HTMLButtonElement;
    this.taskList = this.shadowRoot!.getElementById('task-list')!;

    this.addTaskButton.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') this.addTask();
    });

    this.renderTasks();
  }

  addTask() {
    const taskText = this.taskInput.value.trim();
    if (!taskText) return;

    const newTask = { id: this.nextTaskId++, text: taskText, completed: false };
    this.tasks.push(newTask);
    this.taskInput.value = '';
    this.saveTasks();
    this.renderTasks();
  }

  toggleTaskComplete(taskId: number) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  deleteTask(taskId: number) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveTasks();
    this.renderTasks();
  }

  saveTasks() {
    localStorage.setItem('boba-tasks', JSON.stringify(this.tasks));
    localStorage.setItem('boba-nextTaskId', this.nextTaskId.toString());
  }

  loadTasks() {
    const storedTasks = localStorage.getItem('boba-tasks');
    if (storedTasks) this.tasks = JSON.parse(storedTasks);
    const storedNextId = localStorage.getItem('boba-nextTaskId');
    if (storedNextId) this.nextTaskId = parseInt(storedNextId, 10);
  }

  renderTasks() {
    this.taskList.innerHTML = '';
    this.tasks.forEach((task) => {
      const li = document.createElement('li');
      if (task.completed) li.classList.add('completed');

      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      span.onclick = () => this.toggleTaskComplete(task.id);

      const btn = document.createElement('button');
      btn.className = 'delete-btn';
      btn.innerHTML = '&times;';
      btn.onclick = (e) => {
        e.stopPropagation();
        this.deleteTask(task.id);
      };

      li.append(span, btn);
      this.taskList.append(li);
    });
  }
}

if (!customElements.get(TodoPageComponent.tagName)) {
  customElements.define(TodoPageComponent.tagName, TodoPageComponent);
}

import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";

const TODO_FILE = `${Deno.cwd()}/todo.md`;
const TEMPLATE_FILE = `${Deno.cwd()}/todo.template.md`;

interface Task {
  text: string;
  done: boolean;
}

function loadTasks(): Task[] {
  try {
    const content = Deno.readTextFileSync(TODO_FILE);
    return content
      .split("\n")
      .filter((line) => line.startsWith("- [ ]") || line.startsWith("- [x]"))
      .map((line) => ({
        text: line.slice(6).trim(),
        done: line.startsWith("- [x]"),
      }));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  const content = tasks
    .map((t) => `- [${t.done ? "x" : " "}] ${t.text}`)
    .join("\n");
  Deno.writeTextFileSync(TODO_FILE, content);
}

function listTasks() {
  const tasks = loadTasks();
  if (tasks.length === 0) {
    console.log("Nessun task.");
  } else {
    tasks.forEach((task, i) => {
      const status = task.done ? "[x]" : "[ ]";
      console.log(`${i + 1}. ${status} ${task.text}`);
    });
    const doneCount = tasks.filter((t) => t.done).length;
    console.log(
      `\nTotali: ${tasks.length}, Da completare: ${tasks.length - doneCount}`,
    );
  }
}

function addTask(taskText: string) {
  const tasks = loadTasks();
  tasks.push({ text: taskText, done: false });
  saveTasks(tasks);
  console.log(`Aggiunto: ${taskText}`);
}

function removeTask(index: number) {
  const tasks = loadTasks();
  if (index < 1 || index > tasks.length) {
    console.log("Indice non valido.");
    return;
  }
  const removed = tasks.splice(index - 1, 1);
  saveTasks(tasks);
  console.log(`Rimosso: ${removed[0].text}`);
}

function completeTask(index: number) {
  const tasks = loadTasks();
  if (index < 1 || index > tasks.length) {
    console.log("Indice non valido.");
    return;
  }
  tasks[index - 1].done = true;
  saveTasks(tasks);
  console.log(`Completato: ${tasks[index - 1].text}`);
}

function initTodoFile() {
  try {
    Deno.copyFileSync(TEMPLATE_FILE, TODO_FILE);
    console.log("✔︎ Todo initialized.");
  } catch {
    console.log("🚨 Template not found.");
  }
}

await new Command()
  .name("todo")
  .description("Manage todo tasks")
  .command("init", "Initialize todo file from template")
  .action(initTodoFile)
  .command("list", "List all tasks")
  .action(listTasks)
  .command("add <task>", "Add a new task")
  .action((_, task: string) => addTask(task))
  .command("remove <index:number>", "Remove a task by index")
  .action((_, index: number) => removeTask(index))
  .command("done <index:number>", "Mark a task as done")
  .action((_, index: number) => completeTask(index))
  .parse(Deno.args);

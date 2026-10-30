import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const TODO_FILE = `${process.cwd()}/todo.md`;
const TEMPLATE_FILE = `${process.cwd()}/todo.template.md`;

interface Task {
	text: string;
	done: boolean;
}

function loadTasks(): Task[] {
	try {
		const content = readFileSync(TODO_FILE, "utf-8");
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
	writeFileSync(TODO_FILE, content);
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
	console.log(`Rimosso: ${removed[0]?.text}`);
}

function completeTask(index: number) {
	const tasks = loadTasks();
	if (index < 1 || index > tasks.length) {
		console.log("Indice non valido.");
		return;
	}
	const task = tasks[index - 1] as Task;
	task.done = true;
	saveTasks(tasks);
	console.log(`Completato: ${task.text}`);
}

function initTodoFile() {
	try {
		copyFileSync(TEMPLATE_FILE, TODO_FILE);
		console.log("✔︎ Todo initialized.");
	} catch {
		console.log("🚨 Template not found.");
	}
}

const [command, argument] = process.argv.slice(2);

switch (command) {
	case "init":
		initTodoFile();
		break;
	case "list":
		listTasks();
		break;
	case "add":
		if (argument) addTask(argument);
		else console.log("Usage: todo add <task>");
		break;
	case "remove":
		removeTask(Number(argument));
		break;
	case "done":
		completeTask(Number(argument));
		break;
	default:
		console.log("Usage: todo <init|list|add|remove|done> [task|index]");
		process.exit(command ? 1 : 0);
}

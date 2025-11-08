// todo.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TODO_FILE = path.join(__dirname, "../todo.md");
const TEMPLATE_FILE = path.join(__dirname, "../todo.template.md");

function loadTasks() {
	if (!fs.existsSync(TODO_FILE)) return [];
	const lines = fs.readFileSync(TODO_FILE, "utf8").split("\n");
	return lines
		.filter((line) => line.startsWith("- [ ]") || line.startsWith("- [x]"))
		.map((line) => ({
			text: line.slice(6).trim(),
			done: line.startsWith("- [x]"),
		}));
}

function saveTasks(tasks) {
	const content = tasks
		.map((t) => `- [${t.done ? "x" : " "}] ${t.text}`)
		.join("\n");
	fs.writeFileSync(TODO_FILE, content);
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

function addTask(taskText) {
	const tasks = loadTasks();
	tasks.push({ text: taskText, done: false });
	saveTasks(tasks);
	console.log(`Aggiunto: ${taskText}`);
}

function removeTask(index) {
	const tasks = loadTasks();
	if (index < 1 || index > tasks.length) {
		console.log("Indice non valido.");
		return;
	}
	const removed = tasks.splice(index - 1, 1);
	saveTasks(tasks);
	console.log(`Rimosso: ${removed[0].text}`);
}

function completeTask(index) {
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
	if (fs.existsSync(TEMPLATE_FILE)) {
		fs.copyFileSync(TEMPLATE_FILE, TODO_FILE);
		console.log("✔︎ Todo initialized.");
	} else {
		console.log("🚨 Template not found.");
	}
}

const [, , cmd, ...args] = process.argv;

switch (cmd) {
	case "list":
		listTasks();
		break;
	case "add":
		addTask(args.join(" "));
		break;
	case "remove":
		removeTask(parseInt(args[0], 10));
		break;
	case "done":
		completeTask(parseInt(args[0], 10));
		break;
	case "init":
		initTodoFile();
		break;
	default:
		console.log(
			"Usa: list | add <task> | remove <index> | done <index> | init",
		);
}

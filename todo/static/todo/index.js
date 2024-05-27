document.addEventListener("DOMContentLoaded", () => {
    // Toggle active class on click on each task list button
    document.querySelectorAll(".task-list").forEach((task_list) => {
        task_list.onclick = () => {
            document.querySelector(".active")?.classList.remove("active");
            task_list.classList.add("active");
            const tasksList = task_list.dataset.taskslist;
            load_tasks(tasksList, "due_date");
        };
    });

    // By default, submit button is disabled
    document.querySelector("#addTaskButton").disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector("#newTaskTitle").onkeyup = () => {
        if (document.querySelector("#newTaskTitle").value.length > 0)
            document.querySelector("#addTaskButton").disabled = false;
        else document.querySelector("#addTaskButton").disabled = true;
    };

    // Add task on submit
    document.getElementById("newTaskForm").onsubmit = addNewTask;

    // By default, load all tasks
    document.querySelector(".task-list").classList.add("active");
    load_tasks("all", "due_date");
    
});

var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

function showCheckIcon(x) {
    x.className = "bi-check-circle";
}

function hideCheckIcon(x) {
    x.className = "bi-circle";
}

function toggleCaretIcon(x) {
    x.classList.toggle("bi-caret-right-fill");
    x.classList.toggle("bi-caret-down-fill");
}

function togglePlusIcon(x) {
    x.classList.toggle("bi-plus-circle");
    x.classList.toggle("bi-dash-circle");
    resetNewTaskForm();
}

function addDueDate() {
    const dueDateValueHolder = document.querySelector("#dueDateValueHolder");
    const dueDateInput = document.querySelector("#dueDateInput");
    const dueDatePicker = document.querySelector("#dueDatePicker");
    dueDateValueHolder.style.display = "none";
    dueDateInput.style.display = "inline";
    dueDatePicker.style.display = "inline";
    dueDatePicker.onchange = function () {
        const dueDate = dueDatePicker.value;
        dueDatePicker.style.display = "none";
        dueDateInput.style.display = "none";
        dueDateValueHolder.style.display = "inline";
        dueDateInput.value = dueDate;
        dueDateValueHolder.innerHTML = `
        <i class="bi bi-calendar-check" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="Add due date"
        ></i> ${dueDate}
        `;
    };
}

function addReminderDate() {
    const reminderDateHolder = document.querySelector("#reminderDateHolder");
    const reminderDateInput = document.querySelector("#reminderDateInput");
    const reminderDatePicker = document.querySelector("#reminderDatePicker");
    reminderDateHolder.style.display = "none";
    reminderDateInput.style.display = "inline";
    reminderDatePicker.style.display = "inline";
    reminderDatePicker.onchange = function () {
        const reminderDate = reminderDatePicker.value;
        reminderDatePicker.style.display = "none";
        reminderDateInput.style.display = "none";
        reminderDateHolder.style.display = "inline";
        reminderDateInput.value = reminderDate;
        reminderDateHolder.innerHTML = `
        <i class="bi bi-bell" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="Remind me"
        ></i> ${reminderDate}
        `;
    };
    reminderDatePicker.onclick = function () {
        console.log("clicked");
    };
}

function addRepeatOptions() {
    const repeatOptionHolder = document.querySelector("#repeatOptionHolder");
    const selectRepeatBox = document.querySelector("#selectRepeatBox");
    const repeatInput = document.querySelector("#repeatInput");
    repeatOptionHolder.style.display = "none";
    repeatInput.style.display = "inline";
    selectRepeatBox.style.display = "inline";

    selectRepeatBox.onchange = function () {
        const repeatOption = selectRepeatBox.value;
        repeatInput.style.display = "none";
        selectRepeatBox.style.display = "none";
        repeatOptionHolder.style.display = "inline";
        repeatInput.value = repeatOption;
        repeatOptionHolder.innerHTML = `
        <i class="bi bi-repeat" data-bs-toggle="tooltip" data-bs-placement="bottom"
            title="Rpeat"
        ></i> ${repeatOption}
        `;
    };
}

function resetNewTaskForm() {
    const newTaskTitle = document.querySelector("#newTaskTitle");

    const dueDateValueHolder = document.querySelector("#dueDateValueHolder");
    const dueDateInput = document.querySelector("#dueDateInput");
    const dueDatePicker = document.querySelector("#dueDatePicker");

    const reminderDateHolder = document.querySelector("#reminderDateHolder");
    const reminderDateInput = document.querySelector("#reminderDateInput");
    const reminderDatePicker = document.querySelector("#reminderDatePicker");

    const repeatOptionHolder = document.querySelector("#repeatOptionHolder");
    const selectRepeatBox = document.querySelector("#selectRepeatBox");
    const repeatInput = document.querySelector("#repeatInput");

    // Reset new task title value
    newTaskTitle.value = null;

    // Reset due date value
    dueDateValueHolder.style.display = "none";
    dueDateInput.style.display = "inline";
    dueDatePicker.style.display = "none";
    dueDateInput.value = null;

    // Reset reminder date value
    reminderDateHolder.style.display = "none";
    reminderDateInput.style.display = "inline";
    reminderDatePicker.style.display = "none";
    reminderDateInput.value = null;

    // Reset repeat option value
    repeatInput.style.display = "inline";
    selectRepeatBox.style.display = "none";
    repeatOptionHolder.style.display = "none";
    repeatInput.value = null;
}

function addNewTask() {
    const title = document.querySelector("#newTaskTitle").value;
    const dueDate = document.querySelector("#dueDateInput").value;
    const reminder = document.querySelector("#reminderDateInput").value;
    const repeat = document.querySelector("#repeatInput").value;

    console.log(title);
    console.log(dueDate);
    console.log(reminder);
    console.log(repeat);
    // Send data to backend
    fetch("/tasks/", {
        method: "POST",
        // headers: {
        //     "Content-Type": "application/json",
        // },
        body: JSON.stringify({
            title: title,
            due_date: dueDate,
            reminder_date: reminder,
            repeat: repeat,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            load_tasks("all", "due_date");
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    // Clear new task form + hide modal
    resetNewTaskForm();
    return false;
}

function toggleComplete(task_id) {
    // Fetch task based on its ID
    fetch(`/tasks/${task_id}`)
        .then((response) => response.json())
        .then((task) => {
            // Update complete status
            fetch(`/tasks/${task_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    completed: !task.completed,
                }),
            }).then(() => {
                load_tasks("all", "due_date");
            });
        });
}

function toggleImportant(task_id) {
    // Query task based on its ID
    fetch(`/tasks/${task_id}`)
        .then((response) => response.json())
        .then((task) => {
            // Update task's complete status
            fetch(`/tasks/${task_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    important: !task.important,
                }),
            }).then(() => {
                load_tasks("all", "due_date");
            });
        });
}

function load_tasks(task_list, sortBy) {
    const plannedTasks = document.getElementById("planned");
    const completeTasks = document.getElementById("complete");
    const today = new Date();

    plannedTasks.innerHTML = `<h6 id="planned-tasks-count"></h6>`;

    completeTasks.innerHTML = `
        <h6 data-bs-toggle="collapse" data-bs-target="#completed-tasks">
            <i
                id="complete-tasks-count"
                class="bi bi-caret-down-fill"
                onclick="toggleCaretIcon(this)"
            ></i>
        </h6>
        <div id="completed-tasks" class="collapse"></div>`;

    fetch(`/tasks/${task_list}/${sortBy}`)
        .then((response) => response.json())
        .then((tasks) => {
            completedTasksCount = 0;
            plannedTasksCount = 0;

            tasks.forEach((task) => {
                // Create new task -> add class name
                const taskId = task.id;
                const title = task.title;
                const reminderDate = task.reminder_date;
                const repeat = task.repeat;
                const important = task.important;
                const dueDate = new Date(task.due_date);
                const newTask = document.createElement("div");
                const overDue = today > dueDate;
                const isCompleted = task.completed;

                newTask.className =
                    "d-flex align-items-center border rounded mb-3 bg-white shadow-sm";

                newTask.innerHTML = `
                    <div class="p-3">
                        <i
                            
                            class="${isCompleted ? "bi bi-check-circle-fill" : "bi bi-circle"}"
                            onmouseover="${isCompleted ? "" : "showCheckIcon(this)"}"
                            onmouseout="${isCompleted ? "" : "hideCheckIcon(this)"}"
                            onclick="toggleComplete(${taskId})"
                            style="font-size: large; color: blue"
                        ></i>
                    </div>
                    <div class="flex-grow-1 p-2">
                        <div class="d-flex flex-column">
                            <div class="${
                                isCompleted ? "text-decoration-line-through" : ""
                            }">${title}
                            </div>
                            <div class="d-flex flex-wrap">
                                <div
                                    class="me-3"
                                    style="${overDue ? "font-size: small; color: rgb(255, 0, 0)" : "font-size: small"}"
                                >
                                    <i class="${task.due_date ? "bi bi-calendar-check" : ""}"></i>
                                    <span>${task.due_date ? task.due_date : ""}</span>
                                </div>
                                <div class="me-3" style="font-size: small">
                                    <i class="${reminderDate ? "bi bi-bell" : ""}"></i>
                                    <span>${reminderDate ? reminderDate : ""}</span>
                                </div>
                                <div style="font-size: small">
                                    <i class="${repeat ? "bi bi-repeat" : ""}"></i>
                                    <span> ${repeat ? repeat : ""}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-3">
                        <i
                            class="${important ? "bi bi-star-fill" : "bi bi-star"}"
                            data-bs-toggle="tooltip"
                            style="font-size: large; color: blue"
                            data-bs-placement="bottom"
                            onclick="toggleImportant(${taskId})"
                            title="Mask task as important"
                        >
                        </i>
                    </div>
                `;

                if (isCompleted) {
                    // Increase num of completed tasks -> add to DOM
                    completedTasksCount++;
                    document.querySelector("#completed-tasks").append(newTask);
                } else {
                    // Increase num of planned tasks -> add to DOM
                    plannedTasksCount++;
                    document.querySelector("#planned").append(newTask);
                }
            });

            // Update num of planned tasks
            document.querySelector("#planned-tasks-count").innerHTML = `${
                task_list.charAt(0).toUpperCase() + task_list.slice(1)
            } (${plannedTasksCount})`;

            // Update num of completed task
            document.getElementById(
                "complete-tasks-count"
            ).innerHTML = `Completed (${completedTasksCount})`;

            // Update task count for each task_list
            updateTasksCount(task_list, sortBy);
        })
        // Catch any error
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTasksCount(task_list, sortBy) {
    document.querySelectorAll(".task-count").forEach((task_list) => {
        const taskList = task_list.innerHTML.toLowerCase();
        fetch(`/tasks/${taskList}/${sortBy}`)
            .then((response) => response.json())
            .then((tasks) => {
                plannedTasksCount = 0;
                tasks.forEach((task) => {
                    if (!task.completed) {
                        plannedTasksCount++;
                    }
                });
                // Update planned task count in each button
                document.getElementById(
                    `${taskList}TasksCount`
                ).innerHTML = `(${plannedTasksCount})`;
            })
            // Catch any error
            .catch((error) => {
                console.error("Error:", error);
            });
    });
}

function sortTasks() {
    document.querySelectorAll(".sort-tasks").forEach((task_list) => {
        task_list.onclick = () => {
            const sortBy = task_list.dataset.sort_by;
            document.querySelectorAll(".task-list").forEach((task_list) => {
                if (task_list.className.includes("active")) {
                    const taskslist = task_list.dataset.taskslist;
                    load_tasks(taskslist, sortBy);
                    
                }
            });
        };
    });
}



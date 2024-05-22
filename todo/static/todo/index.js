document.addEventListener("DOMContentLoaded", () => {
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
    document
        .getElementById("all")
        .addEventListener("click", () => load_tasks("all"));
    document
        .getElementById("important")
        .addEventListener("click", () => load_tasks("important"));
    document
        .getElementById("today")
        .addEventListener("click", () => load_tasks("today"));

    // By default, load all tasks
    load_tasks("all");
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
            load_tasks("all");
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
                load_tasks("all");
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
                load_tasks("all");
            });
        });
}

// function load_tasks(task_list) {
//     const plannedTasks = document.getElementById("planned");
//     const completeTasks = document.getElementById("complete");

//     plannedTasks.innerHTML = '<h6 id="planned-tasks-count"></h6>';
//     completeTasks.innerHTML = '<h6 id="complete-tasks-count"></h6>';

//     fetch(`/tasks/${task_list}`)
//         .then((response) => response.json())
//         .then((tasks) => {
//             completed = 0;
//             planned = 0;
//             tasks.forEach((task) => {
//                 // Create new task -> add class name
//                 const newTask = document.createElement("div");
//                 newTask.className =
//                     "d-flex align-items-center border rounded mb-2 shadow";

//                 if (task.completed) {
//                     newTask.innerHTML = `
//                         <div class="p-3">
//                             <i
//                                 class="bi bi-check-circle-fill"
//                                 onclick="toggleComplete(${task.id})"
//                                 style="font-size: large; color: blue"
//                             ></i>
//                         </div>
//                         <div class="flex-grow-1 p-2">
//                             <div class="d-flex flex-column">
//                                 <div class="text-decoration-line-through">${
//                                     task.title
//                                 }
//                                 </div>
//                                 <div class="d-flex flex-wrap">
//                                     <div
//                                         class="me-3"
//                                         style="font-size: small; color: rgb(255, 0, 0)"
//                                     >
//                                         <i class="bi bi-calendar-check"></i>
//                                         <span>${task.due_date}</span>
//                                     </div>
//                                     <div class="me-3" style="font-size: small">
//                                         <i class="bi bi-bell"></i>
//                                         <span>${task.reminder_date}</span>
//                                     </div>
//                                     <div style="font-size: small">
//                                         <i class="bi bi-repeat"></i>
//                                         <span> ${task.repeat}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div class="p-3">
//                             <i
//                                 class="${
//                                     task.important
//                                         ? "bi bi-star-fill"
//                                         : "bi bi-star"
//                                 }"
//                                 data-bs-toggle="tooltip"
//                                 style="font-size: large; color: blue"
//                                 data-bs-placement="bottom"
//                                 onclick="toggleImportant(${task.id})"
//                                 title="Mask task as important"
//                             >
//                             </i>
//                         </div>
//                     `;
//                     completed++;
//                     document.querySelector("#complete").append(newTask);
//                 } else {
//                     newTask.innerHTML = `
//                         <div class="p-3">
//                             <i
//                                 class="bi bi-circle"
//                                 onmouseover="showCheckIcon(this)"
//                                 onmouseout="hideCheckIcon(this)"
//                                 onclick="toggleComplete(${task.id})"
//                                 style="font-size: large; color: blue"
//                             ></i>
//                         </div>
//                         <div class="flex-grow-1 p-2">
//                             <div class="d-flex flex-column">
//                                 <div>${task.title}</div>
//                                 <div class="d-flex flex-wrap">
//                                     <div
//                                         class="me-3"
//                                         style="font-size: small; color: rgb(255, 0, 0)"
//                                     >
//                                         <i class="bi bi-calendar-check"></i>
//                                         <span>${task.due_date}</span>
//                                     </div>
//                                     <div class="me-3" style="font-size: small">
//                                         <i class="bi bi-bell"></i>
//                                         <span>${task.reminder_date}</span>
//                                     </div>
//                                     <div style="font-size: small">
//                                         <i class="bi bi-repeat"></i>
//                                         <span> ${task.repeat}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div class="p-3">
//                             <i
//                                 class="${
//                                     task.important
//                                         ? "bi bi-star-fill"
//                                         : "bi bi-star"
//                                 }"
//                                 data-bs-toggle="tooltip"
//                                 style="font-size: large; color: blue"
//                                 data-bs-placement="bottom"
//                                 onclick="toggleImportant(${task.id})"
//                                 title="Mask task as important"
//                             >
//                             </i>
//                         </div>
//                     `;
//                     // Increase num of planned tasks
//                     planned++;
//                     // Append new task to DOM
//                     document.querySelector("#planned").append(newTask);
//                 }
//             });

//             // Update num of planned tasks
//             document.querySelector("#planned-tasks-count").innerHTML = `${
//                 task_list.charAt(0).toUpperCase() + task_list.slice(1)
//             } (${planned})`;

//             // Update num of completed task
//             document.getElementById(
//                 "complete-tasks-count"
//             ).innerHTML = `Completed (${completed})`;
//         })
//         // Catch any error
//         .catch((error) => {
//             console.error("Error:", error);
//         });
// }

function load_tasks(task_list) {
    const plannedTasks = document.getElementById("planned");
    const completeTasks = document.getElementById("complete");

    plannedTasks.innerHTML = '<h6 id="planned-tasks-count"></h6>';
    completeTasks.innerHTML = `
        <h6 data-bs-toggle="collapse" data-bs-target="#completed-tasks">
            <i
                id="complete-tasks-count"
                class="bi bi-caret-down-fill"
                onclick="toggleCaretIcon(this)"
            ></i>
        </h6>
        <div id="completed-tasks" class="collapse"></div>`;

    fetch(`/tasks/${task_list}`)
        .then((response) => response.json())
        .then((tasks) => {
            completed = 0;
            planned = 0;
            tasks.forEach((task) => {
                // Create new task -> add class name
                const newTask = document.createElement("div");
                newTask.className =
                    "d-flex align-items-center border rounded mb-3 bg-white shadow-sm";

                if (task.completed) {
                    newTask.innerHTML = `
                        <div class="p-3">
                            <i
                                class="bi bi-check-circle-fill"
                                onclick="toggleComplete(${task.id})"
                                style="font-size: large; color: blue"
                            ></i>
                        </div>
                        <div class="flex-grow-1 p-2">
                            <div class="d-flex flex-column">
                                <div class="text-decoration-line-through">${
                                    task.title
                                }
                                </div>
                                <div class="d-flex flex-wrap">
                                    <div
                                        class="me-3"
                                        style="font-size: small; color: rgb(255, 0, 0)"
                                    >
                                        <i class="bi bi-calendar-check"></i>
                                        <span>${task.due_date}</span>
                                    </div>
                                    <div class="me-3" style="font-size: small">
                                        <i class="bi bi-bell"></i>
                                        <span>${task.reminder_date}</span>
                                    </div>
                                    <div style="font-size: small">
                                        <i class="bi bi-repeat"></i>
                                        <span> ${task.repeat}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-3">
                            <i
                                class="${
                                    task.important
                                        ? "bi bi-star-fill"
                                        : "bi bi-star"
                                }"
                                data-bs-toggle="tooltip"
                                style="font-size: large; color: blue"
                                data-bs-placement="bottom"
                                onclick="toggleImportant(${task.id})"
                                title="Mask task as important"
                            >
                            </i>
                        </div>
                    `;

                    // Increase num of completed tasks by 1
                    completed++;

                    // Append new completed task to DOM
                    document.querySelector("#completed-tasks").append(newTask);
                } else {
                    newTask.innerHTML = `
                        <div class="p-3">
                            <i
                                class="bi bi-circle"
                                onmouseover="showCheckIcon(this)"
                                onmouseout="hideCheckIcon(this)"
                                onclick="toggleComplete(${task.id})"
                                style="font-size: large; color: blue"
                            ></i>
                        </div>
                        <div class="flex-grow-1 p-2">
                            <div class="d-flex flex-column">
                                <div>${task.title}</div>
                                <div class="d-flex flex-wrap">
                                    <div
                                        class="me-3"
                                        style="font-size: small; color: rgb(255, 0, 0)"
                                    >
                                        <i class="bi bi-calendar-check"></i>
                                        <span>${task.due_date}</span>
                                    </div>
                                    <div class="me-3" style="font-size: small">
                                        <i class="bi bi-bell"></i>
                                        <span>${task.reminder_date}</span>
                                    </div>
                                    <div style="font-size: small">
                                        <i class="bi bi-repeat"></i>
                                        <span> ${task.repeat}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-3">
                            <i
                                class="${
                                    task.important
                                        ? "bi bi-star-fill"
                                        : "bi bi-star"
                                }"
                                data-bs-toggle="tooltip"
                                style="font-size: large; color: blue"
                                data-bs-placement="bottom"
                                onclick="toggleImportant(${task.id})"
                                title="Mask task as important"
                            >
                            </i>
                        </div>
                    `;

                    // Increase num of planned tasks
                    planned++;

                    // Append new planned task to DOM
                    document.querySelector("#planned").append(newTask);
                }
            });

            // Update num of planned tasks
            document.querySelector("#planned-tasks-count").innerHTML = `${
                task_list.charAt(0).toUpperCase() + task_list.slice(1)
            } (${planned})`;

            // Update num of completed task
            document.getElementById(
                "complete-tasks-count"
            ).innerHTML = `Completed (${completed})`;

            // Update task count for each task_list
            updateTasksCount();
        })
        // Catch any error
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTasksCount(task_list) {
    document.querySelectorAll(".task-count").forEach((task_list) => {
        const taskList = task_list.innerHTML.toLowerCase();
        fetch(`/tasks/${taskList}`)
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

function sortTasks(task_list, key) {
    document.querySelectorAll(".sort-tasks").forEach((task_list) => {
        task_list.onclick = () => {
            console.log(task_list.dataset.task);
        };
    });
}

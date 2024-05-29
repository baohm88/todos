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

    document.getElementById('search').
    onkeyup = () => {
        let title = document.getElementById('search').value;
        title = title.toLowerCase();
        filterTasks(title);
    }

    // Add task on submit
    document.getElementById("newTaskForm").onsubmit = addNewTask;

    // By default, load all tasks
    document.querySelector(".task-list").classList.add("active");
    load_tasks("all", "due_date");
});

function showCheckIcon(x) {
    x.className = "bi-check-circle";
}

function hideCheckIcon(x) {
    x.className = "bi-circle";
}

function toggleChevronIcon(x) {
    x.classList.toggle("bi-chevron-down");
    x.classList.toggle("bi-chevron-right");
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
    const due_date = document.querySelector("#dueDateInput").value;
    const reminder_date = document.querySelector("#reminderDateInput").value;
    const repeat = document.querySelector("#repeatInput").value;

    fetch("/tasks/", {
        method: "POST",
        body: JSON.stringify({
            title: title,
            due_date: due_date,
            reminder_date: reminder_date,
            repeat: repeat,
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            loadCurrentTaskList();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    
    resetNewTaskForm();
    return false;
}

function loadCurrentTaskList() {
    document.querySelectorAll(".task-list").forEach((task_list) => {
        if (task_list.className.includes("active")) {
            const taskslist = task_list.dataset.taskslist;
            load_tasks(taskslist, "due_date");
        }
    });
}

function toggleComplete(task_id) {
    fetch(`/tasks/${task_id}`)
        .then((response) => response.json())
        .then((task) => {
            fetch(`/tasks/${task_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    completed: !task.completed,
                }),
            }).then(() => {
                loadCurrentTaskList();
            });
        });
}

function toggleImportant(task_id) {
    const currentImportant = document.getElementById(`currentImportant_${task_id}`);
    
    fetch(`/tasks/${task_id}`)
        .then((response) => response.json())
        .then((task) => {
            fetch(`/tasks/${task_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    important: !task.important,
                }),
            }).then(() => {
                if (currentImportant.classList.contains('bi-star-fill')) {
                    currentImportant.classList.remove('bi-star-fill');
                    currentImportant.classList.add('bi-star');
                } else {
                    currentImportant.classList.remove('bi-star');
                    currentImportant.classList.add('bi-star-fill');
                }
                updateTasksCount();
            });
        });
}

function filterTasks(title) {
    if (title.length == 0) {
        loadCurrentTaskList();
    }

    fetch(`/tasks/all/due_date`)
            .then((response) => response.json())
            .then((tasksFromServer) => {
                console.log(tasksFromServer);
                let filteredTasks = []
                tasksFromServer.forEach(task => {
                    let tastTitle = task.title;
                    tastTitle =  tastTitle.toLowerCase()
                    if (tastTitle.includes(title)) {
                        console.log(tastTitle);
                        filteredTasks.push(task)
                    }
                });
                renderTasks(filteredTasks);
            })
            // Catch any error
            .catch((error) => {
                console.error("Error:", error);
            });
}

function renderTasks(tasks) {
    const plannedTasksView = document.getElementById("planned-tasks-view");
    const completeTasksView = document.getElementById("complete-tasks-view");
    const today = new Date();

    plannedTasksView.innerHTML = `<h6 id="planned-tasks-count"></h6>`;

    completeTasksView.innerHTML = `
        <h6 data-bs-toggle="collapse" data-bs-target="#completed-tasks">
            <i
                id="complete-tasks-count"
                class="bi bi-chevron-down"
                onclick="toggleChevronIcon(this)"
            ></i>
        </h6>
        <div id="completed-tasks" class="collapse"></div>`;

    const completeTaks = document.querySelector("#completed-tasks");


    completedTasksCount = 0;
    plannedTasksCount = 0;

    tasks.forEach((task) => {
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
                    <div 
                        class="${isCompleted? "text-decoration-line-through": ""}"
                        ondblclick="updateTitle(${taskId})"
                        id="titleGrp_${taskId}"
                    >${title}
                    </div>
                    
                    <form class="form_edit mb-2" id="formEditTitle_${taskId}">
                        <textarea class="mb-2" rows="1" id="newTitle_${taskId}">${title}</textarea>
                        <div class="border-top py-1">
                            <button type="submit" class="btn btn-primary btn-sm">Save</button>
                            <button class="btn btn-secondary btn-sm">Cancel</button>
                        </div>
                    </form>

                    <div class="d-flex flex-wrap" style="font-size: small">

                        <div 
                            class="me-3" style="${
                                overDue ? "color: rgb(255, 0, 0)" : ""
                            }" 
                            id="dueDateGrp_${taskId}" 
                            onclick="updateDueDate(${taskId})"
                        >
                            <i class="${task.due_date ? "bi bi-calendar-check": ""}"></i>
                            <span id="currentDueDate_${taskId}">${task.due_date ? task.due_date : ""}</span>
                        </div>

                        <form class="form_edit me-2" id="formEditDue_${taskId}">
                            <i class="bi bi-calendar-check"></i>
                            <input 
                                id="newTaskDueDate_${taskId}"
                                type="date"
                            />
                        </form>

                        <div 
                            class="me-3" 
                            id="reminderGrp_${taskId}"
                            onclick="updateReminder(${taskId})"
                        >
                            <i class="${reminderDate ? "bi bi-bell" : ""}" ></i>
                            <span id="currentReminder_${taskId}">${reminderDate ? reminderDate : ""}</span>
                        </div>

                        <form class="form_edit me-2" id="formEditReminder_${taskId}">
                            <i class="bi bi-calendar-check"></i>
                            <input 
                                id="new_reminder_${taskId}"
                                type="date"
                            />
                        </form>

                        <div id="repeatGrp_${taskId}" onclick="updateRepeat(${taskId})" class="me-2">
                            <i class="${repeat ? "bi bi-repeat" : ""}"></i>
                            <span id="currentRepeat_${taskId}"> ${repeat ? repeat : ""}</span>
                        </div>

                        <form class="form_edit me-2" id="formEditRepeat_${taskId}">
                            <select id="newRepeat_${taskId}">
                                <option value="" disabled selected>Select 1 option</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Montly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </form>

                    </div>
                </div>
            </div>
            <div class="${isCompleted ? "p-0" : "p-3"}">
                <i
                    class="${isCompleted ? "" : important ? "bi bi-star-fill": "bi bi-star"}"
                    data-bs-toggle="tooltip"
                    style="font-size: large; color: blue"
                    data-bs-placement="bottom"
                    onclick="toggleImportant(${taskId})"
                    title="Mask task as important"
                    id="currentImportant_${taskId}"
                >
                </i>
            </div>
            
            <div class="${isCompleted ? "p-3" : "p-0"}">
                <i class="${isCompleted ? "bi bi-trash3" : ""}" 
                onclick="deleteTask(${taskId})"></i>
            </div>

            
        `;

        newTask.setAttribute('id', `task_${task.id}`);

        if (isCompleted) {
            completedTasksCount++;
            completeTaks.append(newTask);
        } else {
            plannedTasksCount++;
            plannedTasksView.append(newTask);
        }
    });

    if (plannedTasksCount) {
        document.querySelector("#planned-tasks-count").innerHTML = `Tasks (${plannedTasksCount})`;    
    } else {
        plannedTasksView.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show">
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                Your have no planned task. Click <i
                    class="bi bi-plus-circle"
                    style="font-size: x-large; color: blue"
                    data-bs-toggle="collapse"
                    data-bs-target="#new-task-form-view"
                    onclick="togglePlusIcon(this)"
                ></i> to create one.
            </div>
            `;
    }

    if (completedTasksCount) {
        document.getElementById(
            "complete-tasks-count"
        ).innerHTML = `&nbsp &nbsp Completed (${completedTasksCount})`;
    } else {
        completeTasksView.innerHTML = '';
    }
}

function load_tasks(task_list, sortBy) {
    // const plannedTasksView = document.getElementById("planned-tasks-view");
    // const completeTasksView = document.getElementById("complete-tasks-view");


    fetch(`/tasks/${task_list}/${sortBy}`)
        .then((response) => response.json())
        .then((tasks) => {
            renderTasks(tasks);
            updateTasksCount();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTasksCount() {
    document.querySelectorAll(".task-count").forEach((task_list) => {
        const taskList = task_list.innerHTML.toLowerCase();
        fetch(`/tasks/${taskList}/due_date`)
            .then((response) => response.json())
            .then((tasks) => {
                plannedTasksCount = 0;
                tasks.forEach((task) => {
                    if (!task.completed) {
                        plannedTasksCount++;
                    }
                });
                // Update planned task count in each button
                document.getElementById(`${taskList}TasksCount`).innerHTML = `(${plannedTasksCount})`;
            })
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

function updateTitle(taskID) {
    const currentTitle = document.getElementById(`titleGrp_${taskID}`);
    const formEditTitle = document.getElementById(`formEditTitle_${taskID}`);
    currentTitle.style.display = "none";
    formEditTitle.style.display = "block";

    formEditTitle.onsubmit = function () {
        const newTitle = document.getElementById(`newTitle_${taskID}`).value;

        fetch(`/tasks/edit_title/${taskID}`, {
            method: "POST",
            body: JSON.stringify({
                title: newTitle,
            }),
        })
            .then((response) => response.json())
            .then((task) => {
                currentTitle.innerHTML = task.title;
                formEditTitle.style.display = "none";
                currentTitle.style.display = "block";
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        // Stop form from submitting
        return false;
    };
}

function updateDueDate(taskID) {
    const dueDateGrp = document.getElementById(`dueDateGrp_${taskID}`);
    const formEditDue = document.getElementById(`formEditDue_${taskID}`);
    const newTaskDueDate = document.getElementById(`newTaskDueDate_${taskID}`);
    const currentDueDate = document.getElementById(`currentDueDate_${taskID}`);

    dueDateGrp.style.display = "none";
    formEditDue.style.display = "block";

    newTaskDueDate.onchange = () => {
        const newTaskDueDateInput = newTaskDueDate.value;

        fetch(`/tasks/edit_due_date/${taskID}`, {
            method: "POST",
            body: JSON.stringify({
                due_date: newTaskDueDateInput,
            }),
        })
            .then((response) => response.json())
            .then((task) => {
                currentDueDate.innerHTML = task.due_date;
                dueDateGrp.style.display = "block";
                formEditDue.style.display = "none";
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };
}

function updateReminder(taskID) {
    const reminderGrp = document.getElementById(`reminderGrp_${taskID}`);
    const formEditReminder = document.getElementById(`formEditReminder_${taskID}`);
    const newReminder = document.getElementById(`new_reminder_${taskID}`);
    const currentReminder = document.getElementById(`currentReminder_${taskID}`);

    reminderGrp.style.display = "none";
    formEditReminder.style.display = "block";

    newReminder.onchange = () => {
        const newReminderInput = newReminder.value;

        fetch(`/tasks/edit_reminder_date/${taskID}`, {
            method: "POST",
            body: JSON.stringify({
                reminder_date: newReminderInput,
            }),
        })
            .then((response) => response.json())
            .then((task) => {
                currentReminder.innerHTML = task.reminder_date;
                reminderGrp.style.display = "block";
                formEditReminder.style.display = "none";
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };
}

function updateRepeat(taskID) {
    const formEditRepeat = document.querySelector(`#formEditRepeat_${taskID}`);
    const currentRepeat = document.querySelector(`#currentRepeat_${taskID}`);
    const newRepeat = document.querySelector(`#newRepeat_${taskID}`);
    currentRepeat.style.display = "none";
    formEditRepeat.style.display = "block";

    newRepeat.onchange = function () {
        const newRpeat = newRepeat.value;

        fetch(`/tasks/edit_repeat/${taskID}`, {
            method: "POST",
            body: JSON.stringify({
                repeat: newRpeat,
            }),
        })
            .then((response) => response.json())
            .then((task) => {
                currentRepeat.innerHTML = task.repeat;
                formEditRepeat.style.display = "none";
                currentRepeat.style.display = "inline";
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        // Stop form from submitting
        return false;
    };
}


function deleteTask(id) {
    var task = document.getElementById(`task_${id}`);
    var opacity = 1;
    var interval = setInterval(function() {
        if (opacity > 0) {
            opacity -= 0.1;
            task.style.opacity = opacity;
        } else {
            task.style.display = 'none';
            clearInterval(interval);

            fetch(`/tasks/delete_task/${id}`, {
                    method: "DELETE",
                })
                    .then((response) => response.json())
                    .then((result) => {        
                        loadCurrentTaskList();
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
        }
    }, 100);
}


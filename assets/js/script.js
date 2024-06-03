// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

$(document).ready(function () {
    // Handle form submission for adding a new task
    $("#addTaskForm").submit(function (event) {
        event.preventDefault();
        const taskTitle = $("#taskTitle").val();
        const taskDescription = $("#taskDescription").val();
        const taskDeadline = $("#taskDeadline").val();
        const newTask = {
            id: generateTaskId(),
            title: taskTitle,
            description: taskDescription,
            deadline: taskDeadline,
            progress: "Not Yet Started" // Default progress state
        };
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
        $("#addTaskModal").modal("hide");
    });
    $(".task-card").draggable({
        revert: "invalid",
        helper: "clone"
    });
    $(".task-column").droppable({
        accept: ".task-card",
        drop: function (event, ui) {
            const taskId = ui.draggable.attr("id").split("-")[1];
            const targetColumn = $(this).attr("id");
            // Update task's progress state based on the column it's dropped into
            const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));
            taskList[taskIndex].progress = targetColumn;
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        }
    });
    $(".delete-task").click(function (event) {
        const taskId = $(this).closest(".task-card").attr("id").split("-")[1];
        taskList = taskList.filter(task => task.id !== parseInt(taskId));
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    });
});

// Todo: create a function to generate a unique task id
function generateTaskId() {
    const taskId = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // Create a task card element
    const taskCard = $("<div>").addClass("task-card").attr("id", `task-${task.id}`);
    // Add task details to the card
    taskCard.append($("<h3>").text(task.title)); // Assuming title is the appropriate property
    taskCard.append($("<p>").text(task.description)); // Assuming description is the appropriate property
    // Return the created task card
    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const taskListContainer = $("#task-list");
    taskListContainer.empty(); // Clear existing tasks
    const currentDate = new Date();
    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        // Color code tasks based on deadline status
        if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            if (deadlineDate < currentDate) {
                taskCard.addClass("task-overdue");
            } else if (deadlineDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000) {
                taskCard.addClass("task-nearing-deadline");
            }
        }
        taskCard.draggable();
        // Append task card to the appropriate column based on progress state
        if (task.progress === "Not Yet Started") {
            $("#to-do").append(taskCard);
        } else if (task.progress === "In Progress") {
            $("#in-progress").append(taskCard);
        } else if (task.progress === "Completed") {
            $("#done").append(taskCard);
        }
    });

}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const taskName = $("#task-name").val();
    if (taskName.trim() !== "") {
        const newTask = {
            id: generateTaskId(),
            name: taskName
        };
        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
        $("#task-name").val(""); // Clear the input field
    }
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest(".task-card").attr("id").split("-")[1];
    taskList = taskList.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.attr("id").split("-")[1];
    // Update the task status based on where it was dropped
    // For example, you can change the status from "To Do" to "In Progress" or "Done"
    // Update the task in taskList
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#add-task-form").submit(handleAddTask);
    $("#task-list").on("click", ".delete-task", handleDeleteTask);
    $(".status-lane").droppable({
        drop: handleDrop
    });
    $("#due-date").datepicker();
});

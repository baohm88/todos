# Tasks - To Do

by Ha Manh Bao

## Distinctiveness and Complexity

This web app utilizes Django on the back-end and JavaScript on the front-end and enables users to quickly and conveniently create and track list of to-do tasks for themselves. The user-interface is very simple and easy-to-use and mobile-responsive and utilizes lots of Javascript features to make the user experience as smooth and convenient as possible. It's neither an e-commerce site nor a social network site nor a food-ordering app, therefore, it's very distinct from other projects used in this course.

## Contents of each file

This web app includes only 1 app called **todo** with 2 folders and 3 pythons files (urls.py, views.py and models.py) which are utilized by Django to perform CRUD operations in the app.

1. templates folder - which contains all the html files to be rendered to the user.
2. static folder - which contains static files, including:

    - styles.css to style the HTML elements of the app
    - index.js to perform functionality of the app.

3. models.py file contain 2 models:

    - user model which inherits the AbstractUser model
    - Task model which defines the title and other info related to the task to help the user create and track their tasks. This include:
      - the user or creator of the task
      - title of the task
      - the due date of the task or the date on which the task become due
      - the reminder date on which a reminder will be sent to the user's email or alert will be showned to the user when they access the app.
      - the repeat or recurring options, either daily, weekly, monthly or yearly.
      - the importance status
      - the completion status
      - the date on which the task was created

4. urls.py file contains the main urls that the user can visit to perform CRUD operations

5. views.py file contains the functions that fetch and filter data from the Task model and sort them as per the user's request and send them to the frondend.

## How to run the app

1. Go to the main directory and type `python3 manage.py runserver` to start the app.
   
2. Sign up to create an account and log in to start creating and tracking your __Tasks - To Do__.

3. Click the `(⨁)` button on the top right corner to open the create new task menu where the user can enter the task title, due date, reminder date and repeat options of their choice -> click `Add` button to add the task to the list of __Tasks - To Do__.

4. Click the `(↑↓)` button to sort the tasks by __Importance__, __Due date__, __Aphabetically__ or __Creation date__ in ascending or descending order.

5. Click the `(★)` to toggle between __Mark task as important__ and __Remove importance__.

6. Click the `(◯)` to toggle __completion status__ of the task

7. Click the `(🗑)` to delete the __completed__ tasks.

8. Click the buttons `(⌂ All)`, `(☼ Today)` and `(★ Important)` to switch between __All__ tasks, __Today__ tasks or __Important__ tasks.

9. Type anything in the search box on the top to search tasks by title.
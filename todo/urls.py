from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("tasks/", views.create_task, name="create_task"),
    path("tasks/<int:task_id>", views.view_task, name="view_task"),
    # path("tasks/edit_title/<int:task_id>", views.edit_title, name="edit_title"),
    # path("tasks/edit_repeat/<int:task_id>", views.edit_repeat, name="edit_repeat"),
    # path("tasks/edit_due_date/<int:task_id>", views.edit_due_date, name="edit_due_date"),
    # path("tasks/edit_reminder_date/<int:task_id>", views.edit_reminder_date, name="edit_reminder_date"),
    # path("tasks/edit_due_date/<int:task_id>", views.edit_due_date, name="edit_due_date"),
    # path("tasks/delete_task/<int:task_id>", views.delete_task, name="delete_task"),
    path('tasks/<str:task_list>/<str:sort_by>', views.tasks_list, name='tasks_list'),
]

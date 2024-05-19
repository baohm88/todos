from django.contrib import admin
from .models import User, Task
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'first_name', 'last_name')


class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'creator', 'title', 'due_date', 'reminder_date', 'repeat', 'important', 'completed')


admin.site.register(User, UserAdmin)
admin.site.register(Task, TaskAdmin)
from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime

# Create your models here.

class User(AbstractUser):
    pass

class Task(models.Model):
    creator = models.ForeignKey("User", on_delete=models.CASCADE, related_name="author")
    title = models.CharField(max_length=200)
    due_date = models.DateField(blank=True, null=True)
    reminder_date = models.DateField(blank=True, null=True)
    repeat = models.CharField(max_length=100, blank=True, null=True)
    important = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "title": self.title,
            "due_date": self.due_date,
            "reminder_date": self.reminder_date,
            "repeat": self.repeat,
            "important": self.important,
            "completed": self.completed,
            "created_at": self.created_at
        }
    def __str__(self):
        return self.title
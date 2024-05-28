import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

from .models import User, Task


def index(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "todo/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


@login_required
def tasks_list(request, task_list, sort_by='due_date'):
    # query all tasks, order by sort_by
    tasks = Task.objects.filter(creator=request.user).order_by(sort_by). all()

    # filter tasks by task_list
    if task_list == 'today':
        tasks = tasks.filter(due_date=datetime.today())
    elif task_list == 'important':
        tasks = tasks.filter(important=True)
    
    # return requested tasks in JSON
    return JsonResponse([task.serialize() for task in tasks], safe=False)


@csrf_exempt
@login_required
def create_task(request):
    # Create a new task must via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    
    # Get contents of task
    title = data.get('title')
    due_date = data.get('due_date')
    reminder_date = data.get('reminder_date')
    repeat = data.get('repeat')
    
    # Create new task and save
    task = Task(
        creator= request.user,
        title = title,
        due_date = due_date,
        reminder_date = reminder_date,
        repeat = repeat
    )
    task.save()
    return JsonResponse({"message": "Task received."}, status=201)


@csrf_exempt
@login_required
def view_task(request, task_id):

    # Query for requested task
    try:
        task = Task.objects.get(creator=request.user, pk=task_id)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found."}, status=404)

    # Return task contents
    if request.method == "GET":
        return JsonResponse(task.serialize())

    # Update whether email is read or should be archived
    elif request.method == "PUT":
        data = json.loads(request.body)
        
        if data.get("important") is not None:
            task.important = data["important"]
        
        if data.get("completed") is not None:
            task.completed = data["completed"]
        
        task.save()
        return HttpResponse(status=204)


@csrf_exempt
def edit_title(request, task_id):
    if request.method == 'POST':
        data =  json.loads(request.body)
        print(data)
        task = Task.objects.get(pk=task_id)
        if task.title:
            task.title = data['title']
            task.save()
            return JsonResponse({'message': 'New title received', 'title': data['title']})
        else:
            return JsonResponse({"error": "Task not found."}, status=404)
    else:
        return HttpResponseRedirect(reverse('login'))    


@csrf_exempt
def edit_due_date(request, task_id):
    if request.method == 'POST':
        data =  json.loads(request.body)
        print(data)
        task = Task.objects.get(pk=task_id)
        
        if task.due_date:
            task.due_date = data['due_date']
            task.save()
            
            date_string = task.due_date
            date_object = datetime.strptime(date_string, '%Y-%m-%d')
            newDueDate = date_object.strftime('%a, %b %d %Y')

            print(newDueDate)
            return JsonResponse({'message': 'New due date received', 'due_date': newDueDate})
        
        #     return JsonResponse({'message': 'New reminder date received', 'reminder_date': data['reminder_date']})
        # elif task.repeat:
        #     task.repeat = data['repeat']
        #     task.save()
        #     return JsonResponse({'message': 'New repeat received', 'repeat': data['repeat']})
        else:
            return JsonResponse({"error": "Task not found."}, status=404)
        
    else:
        return HttpResponseRedirect(reverse('login'))    


@csrf_exempt
def edit_reminder_date(request, task_id):
    if request.method == 'POST':
        data =  json.loads(request.body)
        print(data)
        task = Task.objects.get(pk=task_id)
        
        if task.due_date:
            task.reminder_date = data['reminder_date']
            task.save()
            
            date_string = task.reminder_date
            date_object = datetime.strptime(date_string, '%Y-%m-%d')
            newReminderDate = date_object.strftime('%a, %b %d %Y')

            print(newReminderDate)
            return JsonResponse({'message': 'New reminder date received', 'reminder_date': newReminderDate})
        
        else:
            return JsonResponse({"error": "Task not found."}, status=404)
        
    else:
        return HttpResponseRedirect(reverse('login'))    


@csrf_exempt
def edit_repeat(request, task_id):
    if request.method == 'POST':
        data =  json.loads(request.body)
        print(data)
        task = Task.objects.get(pk=task_id)
        
        if task.repeat:
            task.repeat = data['repeat']
            task.save()
            return JsonResponse({'message': 'New repeat received', 'repeat': data['repeat']})
        else:
            return JsonResponse({"error": "Task not found."}, status=404)
        
    else:
        return HttpResponseRedirect(reverse('login'))  

@csrf_exempt
def delete_task(request, task_id):
    if request.user.is_authenticated and request.method == 'DELETE':
        task = Task.objects.get(pk=task_id)
        creator =  User.objects.get(pk=request.user.id)
        if task.creator == creator:
            task.delete()
            return JsonResponse({'message': 'Task deleted.'})
    else:
        return HttpResponseRedirect(reverse('login'))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "todo/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "todo/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "todo/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "todo/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "todo/register.html")
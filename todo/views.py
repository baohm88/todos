import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import datetime

from .models import User, Task


def index(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "todo/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


@login_required
def task_list(request, task_list):

    # Filter tasks returned based on mailbox
    if task_list == "today":
        tasks = Task.objects.filter(creator=request.user, due_date=datetime.date.today())
    elif task_list == "important":
        tasks = Task.objects.filter(creator=request.user, important=True)
    elif task_list == "all":
        tasks = Task.objects.filter(creator=request.user)
    else:
        return JsonResponse({"error": "Invalid tasks list."}, status=400)

    # Return tasks in reverse chronologial order
    tasks = tasks.order_by("due_date").all()
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

    # Email must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)



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
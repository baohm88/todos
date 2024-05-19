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
        tasks = Task.objects.filter(creator=request.user)
        return render(request, "todo/index.html", {'tasks': tasks})

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
    tasks = tasks.order_by("-due_date").all()
    return JsonResponse([task.serialize() for task in tasks], safe=False)


@csrf_exempt
@login_required
def create_task(request):
    pass


@csrf_exempt
@login_required
def view_task(request, task_id):
    pass

# @csrf_exempt
# @login_required
# def compose(request):

#     # Composing a new email must be via POST
#     if request.method != "POST":
#         return JsonResponse({"error": "POST request required."}, status=400)

#     # Check recipient emails
#     data = json.loads(request.body)
#     emails = [email.strip() for email in data.get("recipients").split(",")]
#     if emails == [""]:
#         return JsonResponse({
#             "error": "At least one recipient required."
#         }, status=400)

#     # Convert email addresses to users
#     recipients = []
#     for email in emails:
#         try:
#             user = User.objects.get(email=email)
#             recipients.append(user)
#         except User.DoesNotExist:
#             return JsonResponse({
#                 "error": f"User with email {email} does not exist."
#             }, status=400)

#     # Get contents of email
#     subject = data.get("subject", "")
#     body = data.get("body", "")

#     # Create one email for each recipient, plus sender
#     users = set()
#     users.add(request.user)
#     users.update(recipients)
#     for user in users:
#         email = Email(
#             user=user,
#             sender=request.user,
#             subject=subject,
#             body=body,
#             read=user == request.user
#         )
#         email.save()
#         for recipient in recipients:
#             email.recipients.add(recipient)
#         email.save()

#     return JsonResponse({"message": "Email sent successfully."}, status=201)


# @login_required
# def mailbox(request, mailbox):

#     # Filter emails returned based on mailbox
#     if mailbox == "inbox":
#         emails = Email.objects.filter(
#             user=request.user, recipients=request.user, archived=False
#         )
#     elif mailbox == "sent":
#         emails = Email.objects.filter(
#             user=request.user, sender=request.user
#         )
#     elif mailbox == "archive":
#         emails = Email.objects.filter(
#             user=request.user, recipients=request.user, archived=True
#         )
#     else:
#         return JsonResponse({"error": "Invalid mailbox."}, status=400)

#     # Return emails in reverse chronologial order
#     emails = emails.order_by("-timestamp").all()
#     return JsonResponse([email.serialize() for email in emails], safe=False)


# @csrf_exempt
# @login_required
# def email(request, email_id):

#     # Query for requested email
#     try:
#         email = Email.objects.get(user=request.user, pk=email_id)
#     except Email.DoesNotExist:
#         return JsonResponse({"error": "Email not found."}, status=404)

#     # Return email contents
#     if request.method == "GET":
#         return JsonResponse(email.serialize())

#     # Update whether email is read or should be archived
#     elif request.method == "PUT":
#         data = json.loads(request.body)
#         if data.get("read") is not None:
#             email.read = data["read"]
#         if data.get("archived") is not None:
#             email.archived = data["archived"]
#         email.save()
#         return HttpResponse(status=204)

#     # Email must be via GET or PUT
#     else:
#         return JsonResponse({
#             "error": "GET or PUT request required."
#         }, status=400)



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
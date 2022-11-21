from django.shortcuts import render
from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, StreamingHttpResponse
import json

# Toegevoegd 1
# from django.views.decorators.csrf import ensure_csrf_cookie
# @ensure_csrf_cookie

# Toegevoegd 2
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

def get_data_factors(request):
    """Loads table data from json file and sends it"""
    with open("static/data/factors.json", "r") as f:
        out = f.read()
    return HttpResponse(out)

def get_data_ips(request):
    """Loads table data from json file and sends it"""
    with open("static/data/ips.json", "r") as f:
        out = f.read()
    return HttpResponse(out)

# Create your views here.
def base(request):
    """View that serves the standard website"""
    return render(request, "meter/index.html")


def get_data(request):
    """Loads table data from json file and sends it"""
    with open("static/data/control.json", "r") as f:
        out = f.read()
    return HttpResponse(out)


# def get_audio_data(request):
#     """Loads table data from json file and sends it"""
#     with open("static/data/media/".format(request), "r") as f:
#         out = f.read()
#     return HttpResponse(out)

@csrf_exempt
def save_data(request):
    """Receives table data in json format, saves it in .json file"""
    print("[views.py] save data")
    to_json = {}
    for key, value in request.POST.items():
        # Values are strings, turn them into dicts before adding. 
        temp = eval(value)
        to_json[key] = temp

    with open("static/data/control.json", "w") as f:
        json.dump(to_json, f, indent=4)
    return HttpResponse("Saved data")


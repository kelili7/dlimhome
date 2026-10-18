from django.http import JsonResponse


def health_check(request):
    """Return a minimal response for frontend/backend connectivity checks."""
    return JsonResponse({'status': 'ok', 'message': 'Django API is running'})

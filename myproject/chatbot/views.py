from django.shortcuts import render

# Create your views here.
def chatbot_view(request):
    return render(request, 'chatbot/index.html')

from django.http import JsonResponse

def get_bot_reply(request):
    bot_replies = [
        "I apologize, but I don't have the information you're looking for.",
        "I'm sorry, I'm unable to understand. Please select from the given options.",
        # Add more bot replies here...
    ]

    import random
    bot_reply = random.choice(bot_replies)

    return JsonResponse({'bot_reply': bot_reply})

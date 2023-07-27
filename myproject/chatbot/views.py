import os
import json
import time
from django.shortcuts import render
from django.http import JsonResponse
import random

# Function to load cards data from cards.json
def load_cards_data():
    cards_json_path = os.path.join(os.path.dirname(__file__), 'static/chatbot/json/cards.json')
    with open(cards_json_path, 'r') as f:
        cards_data = json.load(f)
    return cards_data

# Create your views here.
def chatbot_view(request):
    return render(request, 'chatbot/index.html')

# bot reply view here
def get_bot_reply(request):
    bot_replies = [
        "I apologize, but I don't have the information you're looking for.",
        "I'm sorry, I'm unable to understand. Please select from the given options.",
        # Add more bot replies here...
    ]

    bot_reply = random.choice(bot_replies)
    
    if bot_reply == "I'm sorry, I'm unable to understand. Please select from the given options.":
        cards_data = load_cards_data()
        parent_cards_content = [card['content'] for card in cards_data['Card'] if card['isParent']]
        return JsonResponse({'bot_reply': bot_reply, 'parent_cards_content': parent_cards_content})
    else:
        return JsonResponse({'bot_reply': bot_reply})

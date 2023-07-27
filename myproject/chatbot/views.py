import os
import json
from django.shortcuts import render
from django.http import JsonResponse
import random



# Create your views here.
def chatbot_view(request):
    return render(request, 'chatbot/index.html')


# Function to load cards data from cards.json
def load_cards_data():
    cards_json_path = os.path.join(os.path.dirname(__file__), 'static/chatbot/json/cards.json')
    with open(cards_json_path, 'r') as f:
        cards_data = json.load(f)
    return cards_data


def get_parent_data(cards_data):
    parent_data = [card for card in cards_data['Card'] if card.get('isParent') is True]
    return parent_data


def get_related_cards(cards_data, option):
    related_options = []
    related_entries = []
    for card in cards_data['Card']:
        if card['Option'] == option:
            related_options = card['related options']
            break

    for card in cards_data['Card']:
        if card['Option'] in related_options:
            related_entries.append(card)

    return related_entries


def get_bot_reply(request):
    bot_replies = [
        "I apologize, but I don't have the information you're looking for.",
        "I'm sorry, I'm unable to understand. Please select from the given options.",
        # Add more bot replies here...
    ]

    bot_reply = random.choice(bot_replies)

    if bot_reply == "I'm sorry, I'm unable to understand. Please select from the given options.":
        cards_data = load_cards_data()  # Assuming you have a function to load cards_data
        parent_data = get_parent_data(cards_data)
        return JsonResponse({'bot_reply': bot_reply, 'parent_data': parent_data})
    else:
        return JsonResponse({'bot_reply': bot_reply})
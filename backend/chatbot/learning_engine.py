import json
import os
import time
from collections import defaultdict, Counter
from datetime import datetime


class LearningEngine:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        self.learning_data = self._load_data()
        self.conversation_patterns = defaultdict(list)
        self.response_effectiveness = defaultdict(lambda: {'success': 0, 'total': 0})
        self.user_preferences = defaultdict(dict)
        self.common_phrases = Counter()
        self.conversation_flow = []

    def _load_data(self):
        learning_path = os.path.join(self.data_dir, 'learning_data.json')
        if os.path.exists(learning_path):
            with open(learning_path, 'r') as f:
                return json.load(f)
        return {
            'learned_patterns': {},
            'response_ratings': {},
            'conversation_stats': {
                'total_conversations': 0,
                'total_messages': 0,
                'avg_conversation_length': 0,
                'top_intents': {},
                'common_phrases': {},
                'peak_hours': {},
                'user_satisfaction': []
            },
            'adaptive_responses': {},
            'context_memory': {},
            'user_profiles': {}
        }

    def _save_data(self):
        os.makedirs(self.data_dir, exist_ok=True)
        path = os.path.join(self.data_dir, 'learning_data.json')
        with open(path, 'w') as f:
            json.dump(self.learning_data, f, indent=2)

    def log_conversation(self, user_id, user_input, bot_response, intent, confidence):
        self.learning_data['conversation_stats']['total_messages'] += 1
        tokens = user_input.lower().split()
        for i in range(len(tokens)):
            for j in range(i + 1, min(i + 4, len(tokens) + 1)):
                phrase = ' '.join(tokens[i:j])
                self.common_phrases[phrase] += 1

        if intent not in self.learning_data['conversation_stats']['top_intents']:
            self.learning_data['conversation_stats']['top_intents'][intent] = 0
        self.learning_data['conversation_stats']['top_intents'][intent] += 1

        self.conversation_flow.append({
            'timestamp': time.time(),
            'user_input': user_input,
            'bot_response': bot_response,
            'intent': intent,
            'confidence': confidence
        })

        if len(self.conversation_flow) > 100:
            self.conversation_flow = self.conversation_flow[-100:]

        if user_id not in self.learning_data['user_profiles']:
            self.learning_data['user_profiles'][user_id] = {
                'first_seen': time.time(),
                'total_messages': 0,
                'preferred_intents': [],
                'sentiment_history': []
            }

        self.learning_data['user_profiles'][user_id]['total_messages'] += 1
        self._save_data()

    def analyze_patterns(self):
        patterns = {
            'most_common_phrases': self.common_phrases.most_common(50),
            'conversation_length': len(self.conversation_flow),
            'intent_distribution': dict(Counter(
                entry['intent'] for entry in self.conversation_flow
            )),
            'avg_confidence': (
                sum(e['confidence'] for e in self.conversation_flow) /
                len(self.conversation_flow) if self.conversation_flow else 0
            )
        }
        return patterns

    def learn_from_interaction(self, user_input, bot_response, rating=None):
        if rating is not None:
            pattern_key = user_input.lower()[:50]
            if pattern_key not in self.learning_data['response_ratings']:
                self.learning_data['response_ratings'][pattern_key] = {
                    'ratings': [],
                    'responses': []
                }
            self.learning_data['response_ratings'][pattern_key]['ratings'].append(rating)
            self.learning_data['response_ratings'][pattern_key]['responses'].append(bot_response)

            ratings_list = self.learning_data['response_ratings'][pattern_key]['ratings']
            responses_list = self.learning_data['response_ratings'][pattern_key]['responses']
            avg = sum(ratings_list) / len(ratings_list) if ratings_list else 0
            best_idx = ratings_list.index(max(ratings_list)) if ratings_list else 0

            self.learning_data['adaptive_responses'][pattern_key] = {
                'best_response': responses_list[best_idx] if responses_list else bot_response,
                'avg_rating': avg,
                'sample_count': len(ratings_list)
            }
            self._save_data()

    def get_context_response(self, user_input, intent, nlp_engine):
        context_key = user_input.lower()[:30]
        if context_key in self.learning_data['adaptive_responses']:
            data = self.learning_data['adaptive_responses'][context_key]
            if data['sample_count'] >= 3 and data['avg_rating'] >= 3.5:
                return data['best_response']

        intent_responses = nlp_engine.intent_data.get(intent, {}).get('responses', [])
        if intent_responses:
            responses = intent_responses
            if responses:
                return None

        return None

    def get_smart_response(self, user_input, intent, nlp_engine):
        adaptive = self.learning_data.get('adaptive_responses', {})
        pattern_key = user_input.lower()[:50]

        if pattern_key in adaptive:
            data = adaptive[pattern_key]
            if data.get('sample_count', 0) >= 3 and data.get('avg_rating', 0) >= 3.5:
                return data['best_response']

        intent_data = nlp_engine.intent_data.get(intent, {})
        responses = intent_data.get('responses', [])
        if responses:
            return None

        return None

    def get_learning_stats(self):
        stats = self.learning_data['conversation_stats']
        return {
            'total_conversations': stats['total_conversations'],
            'total_messages': stats['total_messages'],
            'top_intents': dict(sorted(
                stats['top_intents'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]),
            'user_count': len(self.learning_data.get('user_profiles', {})),
            'learned_patterns': len(self.learning_data.get('learned_patterns', {})),
            'adaptive_responses': len(self.learning_data.get('adaptive_responses', {}))
        }

    def record_user_feedback(self, message_id, rating, comment=None):
        if 'feedback_log' not in self.learning_data:
            self.learning_data['feedback_log'] = []
        self.learning_data['feedback_log'].append({
            'message_id': message_id,
            'rating': rating,
            'comment': comment,
            'timestamp': time.time()
        })

        self.learning_data['conversation_stats']['user_satisfaction'].append(rating)
        self._save_data()

    def track_conversation_flow(self, user_id, step, data):
        if user_id not in self.learning_data.get('context_memory', {}):
            self.learning_data['context_memory'][user_id] = []
        self.learning_data['context_memory'][user_id].append({
            'step': step,
            'data': data,
            'timestamp': time.time()
        })
        if len(self.learning_data['context_memory'][user_id]) > 20:
            self.learning_data['context_memory'][user_id] = \
                self.learning_data['context_memory'][user_id][-20:]
        self._save_data()

    def get_user_context(self, user_id):
        return self.learning_data.get('context_memory', {}).get(user_id, [])

    def predict_next_intent(self, user_id):
        history = self.learning_data.get('context_memory', {}).get(user_id, [])
        if len(history) < 2:
            return None
        recent_intents = [h['data'].get('intent') for h in history[-5:] if h['data'].get('intent')]
        if recent_intents:
            return Counter(recent_intents).most_common(1)[0][0]
        return None

import random
import time
import uuid
import json
import os
import sys
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from nlp_engine import NLPEngine
from learning_engine import LearningEngine
from humor_engine import HumorEngine

# Import SkillQuizAPI from 'ai quiz test'
quiz_test_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai quiz test', 'skill-quiz'))
if quiz_test_path not in sys.path:
    sys.path.insert(0, quiz_test_path)

try:
    from api import SkillQuizAPI, quiz_api
except Exception as e:
    print(f"SkillQuizAPI import notice: {e}")
    try:
        from api import SkillQuizAPI
        quiz_api = SkillQuizAPI()
    except Exception as e2:
        print(f"SkillQuizAPI fallback error: {e2}")
        quiz_api = None


class ChatBot:
    def __init__(self):
        self.nlp = NLPEngine()
        self.learning = LearningEngine()
        self.humor = HumorEngine()
        self.sessions = {}
        self.conversation_memory = {}
        self.message_store = {}
        self.knowledge_base = self._build_knowledge_base()
        self.emotional_responses = self._build_emotional_response_templates()

    def _build_knowledge_base(self):
        return {
            'skillify_platform': {
                'overview': 'SKILLIFY is a modern freelancing platform connecting talented professionals with clients worldwide.',
                'features': [
                    'AI-powered job matching',
                    'Secure escrow payments',
                    'Verified skill badges',
                    'Real-time messaging',
                    'Milestone-based contracts',
                    'Dispute resolution system',
                    'Portfolio showcase',
                    'Job alerts and notifications',
                    'Premium membership tiers',
                    '24/7 customer support'
                ],
                'pricing': {
                    'client_fee': 'Small processing fee on payments',
                    'freelancer_fee': 'Commission on earnings',
                    'membership': 'Free tier available, Premium for advanced features'
                },
                'safety': [
                    'Escrow protection for all payments',
                    'Identity verification required',
                    'Dispute resolution team',
                    'Secure messaging system',
                    'Profile verification badges'
                ]
            },
            'freelancing_tips': {
                'getting_started': [
                    'Complete your profile 100% - profiles with photos get 5x more views',
                    'Take skill assessments to earn verified badges',
                    'Start with competitive pricing to build reviews',
                    'Apply to 5-10 jobs daily for best results',
                    'Write personalized proposals for each job'
                ],
                'pricing_strategies': [
                    'Research market rates for your skill level',
                    'Consider value-based pricing for complex projects',
                    'Offer package deals for common requests',
                    'Include revision limits in your proposals',
                    'Factor in platform fees when setting rates'
                ],
                'client_management': [
                    'Set clear expectations in the proposal',
                    'Use milestones for large projects',
                    'Communicate daily during active projects',
                    'Document everything in the contract',
                    'Ask for feedback after project completion'
                ],
                'common_mistakes': [
                    'Underpricing your services',
                    'Not having a portfolio',
                    'Ignoring client messages',
                    'Missing deadlines',
                    'Not using the escrow system'
                ]
            },
            'payment_info': {
                'escrow': 'Funds are held securely until work is approved',
                'withdrawal': 'Withdraw earnings via Dashboard > Wallet',
                'methods': ['Bank transfer', 'PayPal', 'Payoneer'],
                'timeline': '1-3 business days for processing',
                'minimum': 'Check Dashboard for minimum withdrawal amount'
            },
            'troubleshooting': {
                'login_issues': 'Try password reset via email. If persistent, contact support.',
                'payment_delays': 'Check verification status. Contact support if delayed > 5 days.',
                'profile_not_showing': 'Ensure profile is complete and verified.',
                'proposal_not_accepted': 'Review your proposal quality and pricing.',
                'dispute_resolution': 'File a dispute through Dashboard > Contracts > Disputes'
            },
            'industry_insights': {
                'trending_skills': ['AI/ML', 'Web Development', 'Mobile Apps', 'UI/UX Design', 'Content Writing', 'Digital Marketing'],
                'avg_rates': {
                    'beginner': '$15-30/hour',
                    'intermediate': '$30-60/hour',
                    'advanced': '$60-150/hour',
                    'expert': '$150+/hour'
                },
                'success_tips': [
                    'Specialize in a niche for higher rates',
                    'Build long-term client relationships',
                    'Keep learning new skills',
                    'Maintain a professional online presence',
                    'Request testimonials from satisfied clients'
                ]
            }
        }

    def _build_emotional_response_templates(self):
        return {
            'angry': {
                'acknowledgment': [
                    "I can see you're frustrated, and that's completely valid. 😟",
                    "I understand this is upsetting. Let me help fix this. 💪",
                    "You have every right to be upset. Let's resolve this together. 🤝"
                ],
                'solution_focus': [
                    "Here's exactly what we can do to fix this...",
                    "Let me walk you through the solution step by step. 📋",
                    "I have a clear plan to resolve this for you. ✅"
                ]
            },
            'sad': {
                'acknowledgment': [
                    "I can tell you're feeling down. I'm here for you. 💙",
                    "That sounds really tough. I'm sorry you're going through this. 🫂",
                    "Your feelings are valid. Let me see how I can help. 🌟"
                ],
                'support': [
                    "You're not alone in this. I'm here to help. 🤗",
                    "We'll get through this together. One step at a time. 🐾",
                    "Take your time. I'm here whenever you're ready. ⏳"
                ]
            },
            'excited': {
                'matching_energy': [
                    "I love your enthusiasm! Let's channel that energy! 🚀",
                    "That excitement is contagious! Let's make great things happen! 🎉",
                    "Your energy is amazing! Let's keep this momentum going! 🔥"
                ]
            },
            'confused': {
                'clarity': [
                    "Let me break this down in a simpler way. 🔍",
                    "No worries! This can be confusing. Let me explain clearly. 💡",
                    "I'll make this crystal clear for you. ✨"
                ]
            },
            'neutral': {
                'helpful': [
                    "I'm here to help with whatever you need! 😊",
                    "Let me assist you with that. 👍",
                    "Great question! Here's what you need to know... 📚"
                ]
            }
        }

    def _mirror_emotion(self, user_emotion, response, sentiment):
        emotion_tags = user_emotion.get('emotion_tags', [])

        if 'angry' in emotion_tags or 'very_frustrated' in emotion_tags:
            templates = self.emotional_responses.get('angry', {})
            ack = random.choice(templates.get('acknowledgment', ["I understand."]))
            sol = random.choice(templates.get('solution_focus', ["Let me help."]))
            response = f"{ack} {sol} {response}"

        elif 'sad' in emotion_tags or 'heartbroken' in emotion_tags:
            templates = self.emotional_responses.get('sad', {})
            ack = random.choice(templates.get('acknowledgment', ["I'm here for you."]))
            sup = random.choice(templates.get('support', ["We'll get through this."]))
            response = f"{ack} {sup} {response}"

        elif 'excited' in emotion_tags or 'hyped' in emotion_tags or 'very_excited' in emotion_tags:
            templates = self.emotional_responses.get('excited', {})
            match = random.choice(templates.get('matching_energy', ["I love your energy! 🎉"]))
            response = f"{match} {response}"

        elif 'confused' in emotion_tags or 'very_confused' in emotion_tags:
            templates = self.emotional_responses.get('confused', {})
            clar = random.choice(templates.get('clarity', ["Let me explain. 🔍"]))
            response = f"{clar} {response}"

        elif 'humorous' in emotion_tags:
            response = response + " 😄"

        elif 'playful' in emotion_tags:
            response = response + " 😉"

        elif 'distressed' in emotion_tags:
            templates = self.emotional_responses.get('sad', {})
            ack = random.choice(templates.get('acknowledgment', ["I can see you're stressed. 😟"]))
            response = f"{ack} {response}"

        return response

    def _get_knowledge_response(self, intent, user_input):
        text_lower = user_input.lower()

        if any(w in text_lower for w in ['what is skillify', 'about skillify', 'tell me about skillify', 'what does skillify do']):
            kb = self.knowledge_base['skillify_platform']
            features = ', '.join(kb['features'][:5])
            return f"SKILLIFY is {kb['overview']} Key features include: {features}. We're built to make freelancing simple, secure, and rewarding! 🌟"

        if any(w in text_lower for w in ['trending skills', 'popular skills', 'in demand', 'what skills']):
            skills = self.knowledge_base['industry_insights']['trending_skills']
            return f"The hottest skills on SKILLIFY right now are: {', '.join(skills)}. These consistently attract the best clients and highest rates! 🔥"

        if any(w in text_lower for w in ['how much', 'rates', 'pricing', 'charge', 'earnings']):
            rates = self.knowledge_base['industry_insights']['avg_rates']
            return f"Freelancer rates on SKILLIFY typically range: Beginner {rates['beginner']}, Intermediate {rates['intermediate']}, Advanced {rates['advanced']}, Expert {rates['expert']}. Your rate depends on skills, experience, and reviews! 💰"

        if any(w in text_lower for w in ['safety', 'secure', 'scam', 'trust', 'legit']):
            safety = self.knowledge_base['skillify_platform']['safety']
            return f"SKILLIFY takes safety seriously! Our protections include: {', '.join(safety)}. Your security is our priority! 🛡️"

        if any(w in text_lower for w in ['escrow', 'payment protection', 'money safe']):
            return f"Our escrow system works like this: {self.knowledge_base['payment_info']['escrow']}. Funds are only released when you approve the work! 🔒"

        if any(w in text_lower for w in ['withdraw', 'cash out', 'get paid', 'payout']):
            info = self.knowledge_base['payment_info']
            return f"To withdraw earnings: Dashboard > Wallet > Withdraw. We support {', '.join(info['methods'])}. Processing takes {info['timeline']}. 💸"

        if any(w in text_lower for w in ['profile tips', 'optimize profile', 'better profile', 'profile advice']):
            tips = self.knowledge_base['freelancing_tips']['getting_started']
            return f"Here are proven profile tips: {tips[0]}. {tips[1]}. {tips[2]}. These can significantly boost your visibility! 📈"

        if any(w in text_lower for w in ['proposal tips', 'write proposal', 'better proposals']):
            tips = self.knowledge_base['freelancing_tips']['client_management']
            return f"Winning proposal tips: {tips[0]}. {tips[1]}. {tips[2]}. Always personalize each proposal! ✍️"

        if any(w in text_lower for w in ['common mistakes', 'what not to do', 'avoid mistakes']):
            mistakes = self.knowledge_base['freelancing_tips']['common_mistakes']
            return f"Common freelancing mistakes to avoid: {', '.join(mistakes)}. Being aware of these puts you ahead of 80% of freelancers! ⚠️"

        if any(w in text_lower for w in ['success tips', 'how to succeed', 'grow career']):
            tips = self.knowledge_base['industry_insights']['success_tips']
            return f"Top success tips: {tips[0]}. {tips[1]}. {tips[2]}. Consistency is key! 🏆"

        return None

    def _get_proactive_suggestions(self, intent, context, emotion_tags):
        if intent == 'greeting':
            return ['Find Freelancer', 'Post a Job', 'How SKILLIFY Works', 'Platform Tips']
        elif intent == 'find_freelancer':
            if 'frustrated' in emotion_tags or 'angry' in emotion_tags:
                return ['Post a Job Instead', 'Filter by Top Rated', 'Browse by Skill']
            return ['Search by Skill', 'Browse Top Rated', 'Filter by Budget']
        elif intent == 'post_job':
            return ['Job Posting Tips', 'Set Realistic Budget', 'Write Clear Description']
        elif intent == 'payments':
            return ['How Escrow Works', 'Withdraw Earnings', 'Payment Methods']
        elif intent == 'profile_setup':
            return ['Profile Photo Tips', 'Bio Writing Guide', 'Portfolio Showcase']
        elif intent == 'job_search':
            return ['Set Up Job Alerts', 'Application Tips', 'Build Portfolio']
        elif intent == 'feedback':
            if 'positive' in emotion_tags or 'happy' in emotion_tags:
                return ['Share More Feedback', 'Leave a Review', 'Invite Friends']
            return ['Report Issue', 'Contact Support', 'Suggest Improvement']
        return []

    def _adapt_response_style(self, response, emotion_tags, typing_style):
        if 'terse' in emotion_tags or typing_style == 'minimal':
            sentences = response.split('. ')
            if len(sentences) > 2:
                response = '. '.join(sentences[:2]) + '.'

        if 'playful' in emotion_tags or 'humorous' in emotion_tags:
            endings = [" Just saying! 😊", " Hope that helps! ✨", " Let me know! 💡"]
            if random.random() < 0.3:
                response = response + random.choice(endings)

        return response

    def get_session(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = {
                'created_at': time.time(),
                'message_count': 0,
                'last_intent': None,
                'context': [],
                'mood': 'neutral'
            }
        return self.sessions[user_id]

    def process_message(self, user_id, user_input):
        session = self.get_session(user_id)
        session['message_count'] += 1

        normalized = self.nlp.full_correct(user_input)
        intent, confidence = self.nlp.recognize_intent(normalized)
        entities = self.nlp.extract_entities(normalized)
        sentiment = entities.get('sentiment', 'neutral')
        emotion = entities.get('emotion', {})

        humor_level = self.humor.get_user_humor_level(user_id)

        emotion_tags = emotion.get('emotion_tags', [])
        if 'angry' in emotion_tags or 'distressed' in emotion_tags:
            if sentiment == 'neutral':
                sentiment = 'negative'
        elif 'happy' in emotion_tags or 'hyped' in emotion_tags or 'excited' in emotion_tags:
            if sentiment == 'neutral':
                sentiment = 'positive'
        elif 'humorous' in emotion_tags:
            if sentiment == 'neutral':
                sentiment = 'positive'

        response_data = self._generate_response(
            user_id, user_input, intent, confidence, entities, sentiment, humor_level
        )

        emotion_humor = self.humor.get_emotion_aware_humor(emotion_tags, humor_level)
        if emotion_humor:
            response_data['response'] = response_data['response'] + emotion_humor

        contextual_wisdom = self.humor.get_contextual_wisdom(intent, emotion)
        if contextual_wisdom and random.random() < 0.2:
            response_data['response'] = response_data['response'] + f"\n\n💡 {contextual_wisdom}"

        session['context'].append({
            'user_input': user_input,
            'intent': intent,
            'confidence': confidence,
            'sentiment': sentiment,
            'emotion_tags': emotion_tags,
            'typing_style': emotion.get('typing_style', 'normal'),
            'timestamp': time.time()
        })

        if len(session['context']) > 20:
            session['context'] = session['context'][-20:]

        session['last_intent'] = intent
        session['mood'] = sentiment

        self.learning.log_conversation(user_id, user_input, response_data['response'], intent, confidence)
        self.learning.track_conversation_flow(user_id, session['message_count'], {
            'intent': intent, 'confidence': confidence, 'sentiment': sentiment
        })

        return response_data

    def _generate_response(self, user_id, user_input, intent, confidence, entities, sentiment, humor_level):
        response = ""
        response_type = "normal"
        suggested_actions = []

        session = self.get_session(user_id)
        is_ending, ending_score = self.nlp.detect_conversation_end(user_input, session.get('context', []))

        if is_ending and ending_score >= 0.7 and intent != "goodbye":
            intent = "goodbye"
            confidence = ending_score

        emotion = entities.get('emotion', {})
        emotion_tags = emotion.get('emotion_tags', [])
        typing_style = emotion.get('typing_style', 'normal')

        knowledge_response = self._get_knowledge_response(intent, user_input)
        if knowledge_response:
            response = knowledge_response
            response_type = "knowledge"
        elif confidence < 0.2 and not is_ending:
            response = self._handle_unknown(user_input, sentiment, humor_level)
            response_type = "unknown"
        elif intent == "greeting":
            response = self._handle_greeting(user_id, sentiment, humor_level)
            suggested_actions = ["Find Freelancer", "Post a Job", "Find Work", "How SKILLIFY Works"]
        elif intent == "goodbye":
            response = self._handle_goodbye(user_id, user_input, sentiment, humor_level)
        elif intent == "find_freelancer":
            response = self._handle_find_freelancer(user_input, humor_level)
            suggested_actions = ["Search by Skill", "Browse Top Rated", "Post a Job Instead"]
        elif intent == "post_job":
            response = self._handle_post_job(user_input, humor_level)
            suggested_actions = ["Job Posting Tips", "Set Budget", "Write Description"]
        elif intent == "proposals_bids":
            response = self._handle_proposals(user_input, humor_level)
            suggested_actions = ["View Proposals", "Write Proposal", "Proposal Tips"]
        elif intent == "payments":
            response = self._handle_payments(user_input, entities, humor_level)
            suggested_actions = ["Fund Milestone", "Payment Methods", "Escrow Info"]
        elif intent == "withdraw_earnings":
            response = self._handle_withdraw(humor_level)
            suggested_actions = ["Withdraw Now", "Payout Methods", "Check Balance"]
        elif intent == "fees_commission":
            response = self._handle_fees(humor_level)
            suggested_actions = ["View Pricing", "Premium Benefits", "Fee Calculator"]
        elif intent == "profile_setup":
            response = self._handle_profile_setup(user_input, humor_level)
            suggested_actions = ["Edit Profile", "Add Portfolio", "Write Bio"]
        elif intent == "skills_badges":
            response = self._handle_skills_badges(humor_level)
            suggested_actions = ["Take Assessment", "View Badges", "Add Skills"]
        elif intent == "disputes_issues":
            response = self._handle_disputes(user_input, humor_level)
            suggested_actions = ["File Dispute", "Contact Support", "View Resolution Policy"]
        elif intent == "how_skillify_works":
            response = self._handle_how_it_works(humor_level)
            suggested_actions = ["Find Freelancer", "Post a Job", "Find Work", "View Pricing"]
        elif intent == "messaging":
            response = self._handle_messaging(humor_level)
            suggested_actions = ["Open Inbox", "Find Freelancer", "Start Chat"]
        elif intent == "membership_plans":
            response = self._handle_membership(humor_level)
            suggested_actions = ["Compare Plans", "Upgrade Now", "View Benefits"]
        elif intent == "verification":
            response = self._handle_verification(humor_level)
            suggested_actions = ["Start Verification", "Upload ID", "Check Status"]
        elif intent == "technical_support":
            response = self._handle_tech_support(user_input, humor_level)
            suggested_actions = ["Basic Troubleshooting", "Contact Tech Team", "Report Bug"]
        elif intent == "password_reset":
            response = self._handle_password_reset(humor_level)
        elif intent == "feedback":
            response = self._handle_feedback(user_input, sentiment, humor_level)
        elif intent == "complaint":
            response = self._handle_complaint(user_input, sentiment, humor_level)
            suggested_actions = ["File Complaint", "Contact Manager", "View Policy"]
        elif intent == "contact_support":
            response = self._handle_contact_support(humor_level)
        elif intent == "capabilities":
            response = self._handle_capabilities(humor_level)
            suggested_actions = ["Find Freelancer", "Post a Job", "Find Work", "Payments"]
        elif intent == "job_search":
            response = self._handle_job_search(humor_level)
            suggested_actions = ["Browse Jobs", "Set Job Alerts", "Improve Profile"]
        elif intent == "contracts":
            response = self._handle_contracts(humor_level)
            suggested_actions = ["View Contracts", "Track Milestones", "Manage Projects"]
        elif intent == "notifications":
            response = self._handle_notifications(humor_level)
            suggested_actions = ["Notification Settings", "Mute Alerts", "Email Preferences"]
        elif intent == "cancel_project":
            response = self._handle_cancel_project(humor_level)
            suggested_actions = ["Confirm Cancel", "View Policy", "Contact Support"]
        elif intent == "leave_review":
            response = self._handle_leave_review(humor_level)
            suggested_actions = ["Write Review", "View Past Reviews", "Rating Guidelines"]
        elif intent == "account_settings":
            response = self._handle_account_settings(humor_level)
            suggested_actions = ["Edit Account", "Change Email", "Privacy Settings"]
        elif intent == "blocked_users":
            response = self._handle_blocked_users(humor_level)
            suggested_actions = ["Block User", "View Blocked", "Report Safety Issue"]
        elif intent == "joke":
            response = self._handle_joke(user_input, humor_level)
        elif intent == "emotional_sadness":
            response = self._handle_emotional_sadness(user_input, humor_level)
            suggested_actions = ["Give Me a Pep Talk", "Tell Me a Light Joke", "How to Learn Step-by-Step", "Take a Break"]
        elif intent == "emotional_excitement":
            response = self._handle_emotional_excitement(user_input, humor_level)
            suggested_actions = ["Take Another Quiz", "Share on LinkedIn", "View My Badges", "What's Next?"]
        elif intent == "emotional_frustration":
            response = self._handle_emotional_frustration(user_input, humor_level)
            suggested_actions = ["Debug Step-by-Step", "Tell Me a Funny Joke", "Ask a Tech Question", "Coding Tips"]
        elif intent == "emotional_stress_anxiety":
            response = self._handle_emotional_stress(user_input, humor_level)
            suggested_actions = ["Quick Breathing Reset", "Study Roadmap", "Easy Practice Quiz", "Motivation"]
        elif intent == "emotional_gratitude_love":
            response = self._handle_emotional_gratitude(user_input, humor_level)
            suggested_actions = ["Explore New Skills", "Take a Coding Quiz", "Discover Projects", "Tell Another Joke"]
        elif intent == "emotional_motivation":
            response = self._handle_emotional_motivation(user_input, humor_level)
            suggested_actions = ["Start Skill Assessment", "Browse Hot Skills", "Inspire Me Again", "Platform Tips"]
        elif intent == "emotional_confusion":
            response = self._handle_emotional_confusion(user_input, humor_level)
            suggested_actions = ["Explain from Scratch", "Recommended Learning Path", "Frontend Basics", "Python Roadmap"]
        else:
            if is_ending:
                response = self._handle_goodbye(user_id, user_input, sentiment, humor_level)
            else:
                response = self._handle_unknown(user_input, sentiment, humor_level)
                response_type = "unknown"

        if intent != "goodbye" and not intent.startswith("emotional_"):
            response = self._mirror_emotion(emotion, response, sentiment)
            response = self._adapt_response_style(response, emotion_tags, typing_style)

            proactive_suggestions = self._get_proactive_suggestions(intent, session.get('context', []), emotion_tags)
            if proactive_suggestions:
                suggested_actions = proactive_suggestions

            if self.humor.should_crack_joke(session['context']):
                response += f"\n\n{self.humor.get_witty_reply('encouragement')}"

            follow_up = self.humor.get_follow_up_question(intent)
            if follow_up and random.random() < 0.3:
                response += f"\n\n{follow_up}"

        return {
            'response': response,
            'intent': intent,
            'confidence': round(confidence, 2),
            'sentiment': sentiment,
            'response_type': response_type,
            'suggested_actions': suggested_actions,
            'emotion': entities.get('emotion', {}),
            'normalized_text': entities.get('normalized_text', ''),
            'timestamp': time.time()
        }

    def _handle_greeting(self, user_id, sentiment, humor_level):
        session = self.get_session(user_id)
        if session['message_count'] <= 1:
            base_greeting = self.humor.get_greeting_for_time()
        else:
            base_greeting = random.choice([
                "Well well well... look who came crawling back! Just kidding, welcome back! 😄 What can I help you with today?",
                "You again! I'm starting to think you actually like me. No judgement though, I'm pretty charming. 😏 What do you need?",
                "Back for more wisdom? I like your style. 💪 How can I assist you this fine day?",
                "Oh hello again! I was just sitting here contemplating the meaning of digital existence, but you're way more interesting. 🤖 What's up?",
                "Plot twist — you're back! 🎬 Don't worry, I remember everything (I'm a computer, it's kind of my thing). What do you need?",
                "Ah, a repeat customer! That means either I'm doing something right, or you're lost. Either way, I'm here to help! 🎯"
            ])
        return self.humor.add_humor_to_response(base_greeting, sentiment, humor_level)

    def _handle_goodbye(self, user_id, user_input, sentiment, humor_level):
        session = self.get_session(user_id)
        context = session.get('context', [])
        message_count = session.get('message_count', 1)
        last_intent = session.get('last_intent', None)
        user_words = user_input.lower().split()
        word_count = len(user_words)

        if sentiment == 'negative':
            farewell = random.choice([
                "I'm sorry our chat didn't go as planned. I genuinely hope things improve for you. Don't hesitate to come back — I'll be right here. Take care of yourself. 💙",
                "I can tell you're frustrated, and I'm sorry about that. We're always working to do better. Whenever you're ready, I'll be here. Wishing you a better day ahead. 🌟",
                "I understand, and I'm truly sorry. Your experience matters to us. If there's ever anything I can do to make things right, just say the word. Take care! 🤝"
            ])
        elif sentiment == 'positive':
            farewell = random.choice([
                "It's been an absolute pleasure chatting with you! Your positive energy made my digital day brighter. 🌞 Go out there and crush it on SKILLIFY — I'll be here whenever you need me!",
                "What a great conversation! You're clearly going places, and I'm honored I could help. 🎉 Keep that amazing energy going, and come back anytime!",
                "Loved chatting with you! You're the kind of user that makes being a chatbot worthwhile. 😊 Go do great things, and remember — I'm just a message away!"
            ])
        elif message_count <= 2:
            farewell = random.choice([
                "Short and sweet — I like your style! ⚡ Quick questions get quick answers, and I'm always here if you need more. Have a great one!",
                "In and out, efficient! That's the mark of a professional. 🏆 If anything else comes up, you know where to find me. Take care!",
                "That was fast! I hope I was helpful enough in our brief encounter. ⚡ Don't be a stranger — I'm here whenever you need me!"
            ])
        elif word_count <= 2:
            ending_words = ['ok', 'okay', 'k', 'cool', 'nice', 'good', 'great', 'awesome',
                            'perfect', 'thanks', 'thank', 'thx', 'got it', 'understood',
                            'noted', 'right', 'yeah', 'yes', 'yep', 'sure', 'alright',
                            'fine', 'sweet', 'brilliant', 'fantastic', 'wonderful', 'helpful']

            if any(w in user_words for w in ending_words):
                if last_intent in ('technical_support', 'password_reset', 'disputes_issues',
                                   'payments', 'fees_commission', 'verification',
                                   'how_skillify_works', 'capabilities'):
                    farewell = random.choice([
                        "Glad I could help! 😊 You know where to find me if anything else comes up. Good luck with everything!",
                        "Happy to have been of assistance! 🤝 Feel free to reach out anytime. Take care!",
                        "My pleasure! I'm always here if you need help with anything else on SKILLIFY. Have a wonderful day! ✨"
                    ])
                else:
                    farewell = random.choice([
                        "You're welcome! I'm here 24/7, so don't hesitate to pop back in. 🌟 Have a great day!",
                        "Glad I could help! Remember, no question is too small — I'm always just a message away. 😊 Take care!",
                        "Anytime! I'll be right here whenever you need me again. 💪 Go make great things happen on SKILLIFY!"
                    ])
            else:
                farewell = random.choice([
                    "Before you go — just know I'm always here if you need anything else. 🌟 SKILLIFY is full of opportunities, and you've got this! Take care!",
                    "Alright, heading out? No worries! 🙌 I'll be here whenever you need me. Go make the most of SKILLIFY!",
                    "Catch you later! 🎯 Remember, every question you ask makes you smarter, and you've asked some good ones today. Until next time!"
                ])
        else:
            topics_discussed = []
            intent_topic_map = {
                'find_freelancer': 'finding freelancers', 'post_job': 'posting jobs',
                'proposals_bids': 'proposals and bids', 'payments': 'payments and escrow',
                'withdraw_earnings': 'withdrawing earnings', 'fees_commission': 'platform fees',
                'profile_setup': 'profile optimization', 'skills_badges': 'skill badges',
                'disputes_issues': 'dispute resolution', 'how_skillify_works': 'how SKILLIFY works',
                'messaging': 'messaging features', 'membership_plans': 'membership plans',
                'verification': 'account verification', 'technical_support': 'technical support',
                'password_reset': 'password recovery', 'feedback': 'platform feedback',
                'complaint': 'resolving concerns', 'contact_support': 'support options',
                'job_search': 'finding work', 'contracts': 'project contracts',
                'notifications': 'notification settings', 'cancel_project': 'project management',
                'leave_review': 'leaving reviews', 'account_settings': 'account settings',
                'blocked_users': 'privacy and safety', 'joke': 'having a laugh'
            }

            for c in context:
                if isinstance(c, dict):
                    ctx_intent = c.get('intent', '')
                    if ctx_intent in intent_topic_map and intent_topic_map[ctx_intent] not in topics_discussed:
                        topics_discussed.append(intent_topic_map[ctx_intent])

            if topics_discussed:
                topic_list = ', '.join(topics_discussed[:3])
                if len(topics_discussed) > 3:
                    topic_list += f', and {len(topics_discussed) - 3} more'
                farewell = random.choice([
                    f"It was great helping you with {topic_list}! 🎉 You asked all the right questions — that's how you get the most out of SKILLIFY. Come back anytime!",
                    f"Awesome conversation about {topic_list}! 🌟 I hope everything made sense. If anything comes up later, you know where to find me!",
                    f"We covered a lot today — {topic_list}! 💪 I'm impressed with your curiosity. Don't hesitate to reach out if you need anything else!"
                ])
            else:
                farewell = random.choice([
                    "It's been a pleasure chatting with you! 🎉 Come back anytime you need help — I'll be right here. Take care!",
                    "What a great conversation! 😊 Remember, I'm available 24/7, so never hesitate to reach out. Have a wonderful day!",
                    "That was fun! I always enjoy a good chat. 🌟 If anything else comes to mind, just pop back in. Take care!"
                ])

        return self.humor.add_humor_to_response(farewell, sentiment, humor_level)

    def _handle_find_freelancer(self, user_input, humor_level):
        responses = [
            "Looking for talent? 🎯 Head to Explore > Freelancers and prepare to be amazed. You can filter by skill, rating, budget, and more. It's like Tinder, but for professional talent and significantly less awkward.",
            "Want to find the perfect freelancer? Go to Explore > Freelancers. 🌟 Pro tip: filters are your best friend here. It's like a treasure hunt, except the treasure is someone who can actually build your website without disappearing.",
            "Freelancer hunting time! 🏹 Navigate to Explore > Freelancers and use those sweet, sweet filters. Think of it as shopping, but instead of shoes, you're buying expertise. Way more useful, way less fun to try on.",
            "You have two options: browse freelancers under Explore, or post a job and let them come to you. I recommend the second option because sitting back while talent comes to you is the dream. 😎"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_post_job(self, user_input, humor_level):
        responses = [
            "Time to post a job! 📝 Head to Dashboard > Post a Job. Write a clear description, set a realistic budget, and watch the proposals roll in. It's like ordering pizza, but instead of pepperoni, you get skilled professionals who actually deliver.",
            "Job posting 101: Dashboard > Post a Job. 📋 Be specific about what you need, set a budget that reflects reality (not just hopes and dreams), and prepare to be impressed by the talent pool. It's like magic, but with more deadlines.",
            "Ready to hire? From your Dashboard, hit 'Post a Job' and fill in the details. A well-written job description is like a good dating profile — honest, specific, and not trying too hard. 💼",
            "Post a job from your Dashboard and watch the magic happen. ✨ Pro tip: detailed descriptions attract better proposals. Vague descriptions attract... interesting proposals. You've been warned. 😄"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_proposals(self, user_input, humor_level):
        responses = [
            "Proposals! 📨 The art of convincing someone you're the perfect match. Check Dashboard > Proposals to see who's interested. Reading proposals is like reading love letters, except these ones come with rate cards.",
            "Want to see who's bidding on your project? Dashboard > Proposals is where the magic happens. 🎩 Each proposal comes with the freelancer's profile, bid, and timeline. You're the judge!",
            "Proposals are like job applications, but fancier. 🎩 Check Dashboard > Proposals to review them. Take your time — this is like choosing your team for the Olympics!",
            "For freelancers: make your proposals personal and detailed. ✍️ For clients: read beyond the bid amount. The cheapest proposal isn't always the best, just like the cheapest restaurant isn't always the best food."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_payments(self, user_input, entities, humor_level):
        if entities.get('amount'):
            amount = entities['amount']
            responses = [
                f"Ah, ${amount} — a fine number! 💰 Our escrow system works like this: you fund the milestone, the freelancer does their magic, you approve it, and they get paid. It's like a trust fall, but with money and legal protections.",
                f"${amount}, you say? Great! 💵 Fund the milestone through our escrow system, and the money stays safe until you're happy with the work. It's the digital equivalent of 'I'll believe it when I see it', but with actual guarantees."
            ]
        else:
            responses = [
                "Payments on SKILLIFY work through our escrow system — think of it as a digital safe that only opens when everybody's happy. 🏦 You fund a milestone, the work gets done, you approve it, and the freelancer gets paid. Everybody wins!",
                "Our escrow system is basically a very trustworthy middleman. 💼 Money goes in, work happens, approval happens, money comes out. It's beautiful in its simplicity, like a well-designed vending machine, except the product is 'not getting scammed'.",
                "Here's how payments work: fund a milestone, review the work, approve it, and the freelancer gets paid. ✅ Simple, secure, and way less stressful than handing someone cash and hoping for the best.",
                "Think of our escrow system as a very responsible friend who holds your money and only gives it back when everyone's satisfied. 🤝 Unlike that friend who 'forgot' your twenty from last Tuesday."
            ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_withdraw(self, humor_level):
        responses = [
            "Time to collect your hard-earned cash! 💸 Head to Dashboard > Wallet > Withdraw. Choose your payout method and wait 1-3 business days. It's like watching paint dry, except at the end you get actual money.",
            "Withdraw your earnings from Dashboard > Wallet. 💰 Just make sure your identity is verified first — we like to know we're giving money to actual humans and not very convincing robots.",
            "Your money is waiting! 🏦 Dashboard > Wallet > Withdraw. It's like an ATM, except instead of inserting a card, you click a button. Technology, am I right?",
            "Ready to cash out? 💵 Go to Dashboard > Wallet. Just a heads up: first-time withdrawals require verification. Think of it as the platform saying 'prove you exist' before handing over the goods."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_fees(self, humor_level):
        responses = [
            "Fees — the topic everyone loves to discuss! 😅 Just kidding, nobody loves discussing fees. But ours are transparent: clients pay a processing fee, freelancers pay a commission. Check our Pricing page for the full breakdown. No hidden charges — unlike that restaurant bill that somehow included truffle oil.",
            "Our fee structure is on the Pricing page, and it's refreshingly straightforward. 📊 No sneaky charges, no fine print that requires a magnifying glass. Just honest pricing — how novel in this day and age!",
            "Fees? Oh, you mean the price of being on a platform that actually protects both parties? 🛡️ Check the Pricing page for details. It's like paying for insurance, but instead of covering your car, it covers your professional reputation. Way more valuable.",
            "We keep our fees simple and transparent. 💡 Clients pay a small processing fee, freelancers pay a commission. Visit the Pricing page for exact numbers. We're not trying to hide anything — we're terrible at being sneaky anyway."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_profile_setup(self, user_input, humor_level):
        responses = [
            "Your profile is your digital handshake — make it count! 🤝 Go to Profile > Edit and add a professional photo, a compelling bio, your skills, and some portfolio samples. Profiles with photos get way more attention.",
            "Time to make your profile shine! ✨ Edit it from Profile > Edit. Add a photo, write a bio that doesn't sound like it was written by a robot (unlike me 😅), and showcase your best work.",
            "A complete profile is like a well-tuned instrument — it makes beautiful music (or in your case, attracts great clients). 🎵 Head to Profile > Edit and fill in all the sections.",
            "Profile setup is your chance to make a killer first impression. 💥 Photo, bio, skills, portfolio — hit all four and you're golden. It's like decorating your digital office, except it actually matters for your career."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_skills_badges(self, humor_level):
        responses = [
            "Skill badges are like gold stars, but for adults and they actually matter! ⭐ Head to Profile > Skills and take an assessment. Pass it, and you get a shiny verified badge. It's like a video game achievement, except it helps you get hired.",
            "Want to prove you're actually good at what you do? 🏅 Take a skill assessment from Profile > Skills. Pass it, and you earn a verified badge. It's like a diploma, but you can get it without student loans.",
            "Skill badges are your secret weapon. 🗡️ Take assessments under Profile > Skills, earn verified badges, and watch your profile popularity soar. It's like leveling up in a game, except the XP translates to real-world opportunities.",
            "Verified skill badges = instant credibility. 💎 Go to Profile > Skills, take an assessment, and prove your expertise. It's the digital equivalent of saying 'I know what I'm doing' and actually backing it up."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_disputes(self, user_input, humor_level):
        responses = [
            "Oh no, trouble in paradise? 😟 Don't worry, we've got your back. File a dispute from the project page under Report Issue. Our mediation team will sort things out fairly. Think of them as digital Switzerland — neutral, efficient, and they don't charge extra for chocolate. 🇨🇭",
            "Having issues? File a dispute through the project page. ⚖️ Our mediation team reviews both sides and works toward a fair resolution. It's like a court case, but with less drama and more 'he said, she said, here's the evidence.'",
            "Disputes happen — it's the digital world's version of disagreeing about pineapple on pizza. 🍍 File one through the project page, provide your evidence, and let our team handle the rest. No pitchforks required.",
            "Got a problem? Our dispute resolution system is here to help. 🤝 File through the project page with as much detail as possible. Our team will review everything and work toward a fair resolution. We're basically professional referee-types."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'negative', humor_level * 0.3)

    def _handle_how_it_works(self, humor_level):
        responses = [
            "Welcome to SKILLIFY 101! 🎓 Here's the deal: clients post jobs, freelancers apply, everyone agrees on terms, work gets done, money moves safely through escrow, and everyone's happy. It's like a beautiful symphony of professional collaboration. Ready to join?",
            "SKILLIFY is like a marketplace, but instead of buying vegetables, you're buying talent. 🥕 Clients post projects, freelancers submit proposals, agreements are made, work happens, payments are secure. Simple as that!",
            "How does this work? 🤔 Think of SKILLIFY as the professional version of a friend saying 'I know someone who can help.' Except here, you have thousands of verified professionals, secure payments, and a review system.",
            "The SKILLIFY workflow: 1️⃣ Create a profile, 2️⃣ Find work or hire talent, 3️⃣ Collaborate through milestones, 4️⃣ Get paid securely. It's like a choose-your-own-adventure book, except every ending leads to professional success."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_messaging(self, humor_level):
        responses = [
            "Want to chat with someone? 💬 Visit their profile and hit the 'Message' button. It's like sending a digital carrier pigeon, except way faster and with less bird-related complications.",
            "Messaging is easy — just go to someone's profile and click 'Message'. 📨 All your conversations live in the Messages tab. It's like having a professional inbox, except it's actually organized.",
            "Need to reach out? Visit any user's profile and click the message icon. 💬 Pro tip: first impressions matter, so make your opening message count. No 'hey' — be specific about why you're reaching out.",
            "You can message anyone on the platform from their profile page. 📬 Keep it professional, be clear about your intentions, and for the love of good communication, proofread before sending."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_membership(self, humor_level):
        responses = [
            "We've got Free and Premium plans. 💎 Free gets you the basics, Premium gives you reduced fees, priority support, and enhanced visibility. It's like a gym membership, except instead of getting abs, you get better professional opportunities.",
            "Premium membership is like having a VIP pass to the freelancing world. 🎫 Reduced commissions, priority support, advanced analytics — it's the professional upgrade you didn't know you needed.",
            "Free plan: solid basics. 🆓 Premium plan: all the bells and whistles. 🔔 Reduced fees, priority support, enhanced profile visibility. It's the difference between riding a bicycle and driving a sports car.",
            "Membership tiers: Free for getting started, Premium for serious players. 🏆 Premium members enjoy reduced fees, priority support, and better visibility. Visit the Pricing page to see if Premium is right for you."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_verification(self, humor_level):
        responses = [
            "Verification is like getting a stamp of approval that says 'Yes, I am a real human who does real work.' 🪪 Go to Settings > Verification, upload a government ID, and our team will review it within 24-48 hours.",
            "Want to prove you're legit? 🆔 Get verified! Upload a government ID through Settings > Verification. Our team reviews submissions within 1-2 business days. It's like a background check, but less scary and more career-boosting.",
            "Identity verification adds a trust badge to your profile, which is basically the platform's way of saying 'We've checked this person out, and they're good.' ✅ Upload your ID at Settings > Verification.",
            "Get verified and watch your profile credibility skyrocket. 🚀 Head to Settings > Verification, upload your government ID, and wait for our team to give you the thumbs up. Verified profiles get way more attention!"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_tech_support(self, user_input, humor_level):
        responses = [
            "Oh no, something's broken? 😅 Tell me everything — what happened, what you were doing, and any error messages you saw. The more details, the faster I can help. It's like being a doctor, but for technology, and I don't need you to say 'ahh.' 🩺",
            "Technical issues are the worst, aren't they? 😤 Give me the full picture: what's not working, what you've tried, and any error messages. I'll do my best to help you fix it. We're in this together — team troubleshooting!",
            "I feel your pain — technical problems are about as fun as a root canal. 🦷 But hey, at least I won't charge you $200/hour! Describe the issue in detail, and I'll guide you through the fix.",
            "Let's troubleshoot this together! 🔧 Tell me what's happening, what you expected to happen, and any error messages. I'll help you figure out the fix. Think of me as your tech support sidekick — minus the hold music."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_password_reset(self, humor_level):
        responses = [
            "Forgot your password? Classic! 🔑 Click 'Forgot Password' on the login page, check your email (and yes, check the spam folder too — it loves hiding important emails there), and follow the instructions. Easy as pie!",
            "Password troubles? Happens to the best of us. 🔐 Click 'Forgot Password' on the login page, and we'll send you a reset link. Check your inbox, and if it's not there, check spam. That folder has trust issues.",
            "Locked out? 🔒 Click 'Forgot Password' on the login page. A reset link will arrive in your email faster than you can say 'I should have written this down.' Just don't forget to check your spam folder!",
            "Password reset is a piece of cake: click 'Forgot Password' on the login page, check your email, follow the link. 🍰 Pro tip: choose a password that's not 'password123' this time. I believe in you."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_feedback(self, user_input, sentiment, humor_level):
        if sentiment == 'positive':
            responses = [
                "Aw, you're making me blush! 😊 (Do chatbots blush? I'm not sure.) Thank you for the kind words — we're always working to make SKILLIFY even better!",
                "Well, aren't you a sweetheart! 🥰 Your positive feedback means the world to us. It's like a warm hug for the entire team!",
                "Thank you! 💖 Comments like yours keep us motivated to be better every day. You're basically our new favorite person. (Don't tell the other users.)",
                "That's so kind of you! 🌟 Your feedback is like rocket fuel for our team. We'll keep working hard to deserve compliments like yours!"
            ]
        else:
            responses = [
                "Thank you for sharing your thoughts! 📝 We take all feedback seriously and will use it to improve. Is there anything specific I can help you with right now?",
                "We appreciate you taking the time to share your experience. 🙏 Your input helps us get better. What else can I do to make your SKILLIFY experience more awesome?",
                "Thanks for the feedback! 💡 We're always looking for ways to improve, and your perspective is valuable. Is there anything I can help you with today?"
            ]
        return self.humor.add_humor_to_response(random.choice(responses), sentiment, humor_level)

    def _handle_complaint(self, user_input, sentiment, humor_level):
        responses = [
            "I'm really sorry to hear you're having a bad time. 😟 That's not what we want for you at all. Tell me more about what happened so I can help make things right. We're all ears — and unlike your friend who 'forgot' to text back, we actually listen!",
            "Oh no, that sounds frustrating! 😤 I want to help fix this. Give me the details, and we'll work together to sort it out. Think of me as your personal complaint-handling champion. 🏆 I may be a robot, but I've got your back!",
            "I'm sorry you're experiencing this. 💔 Your concerns matter, and I'm here to help resolve them. Share the details, and we'll get this sorted. No one deserves a bad experience — not even on a Monday.",
            "That's not okay, and I'm sorry it happened. 🤝 Let's fix this together. Tell me everything, and I'll guide you through the resolution process. We've got your back — pinky promise, and I don't even have pinkies!"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'negative', humor_level * 0.3)

    def _handle_contact_support(self, humor_level):
        responses = [
            "Need a human? 🙋 I don't blame you — sometimes you just need that personal touch! Email support@skillify.com or use the in-app Help Center. Our team is available Monday-Friday, 9 AM to 6 PM. I'm here 24/7 though — I never sleep!",
            "For human support, reach out to support@skillify.com or use the Help Center. 📧 Our team responds within 24 hours. In the meantime, I'm here if you need anything!",
            "Want to talk to a real person? 🧑‍💻 Email support@skillify.com or submit a ticket through the Help Center. Premium members get priority support, just saying. I'm always here too!",
            "Human support is available via support@skillify.com and the Help Center. 📞 They're available Monday-Friday, 9-6. I'm here around the clock though, so feel free to use me as the warm-up act."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_capabilities(self, humor_level):
        responses = [
            "What can I do? Oh, just about everything SKILLIFY-related — I'm basically the Swiss Army knife of freelancing, except I also tell jokes! 😄 I can help you find freelancers, post jobs, handle payments, set up your profile, navigate disputes, and probably make you snort-laugh at least once. What do you need?",
            "My skills include: answering platform questions, guiding you through features, helping with payments, finding talent, and occasionally telling jokes so bad they circle back around to being funny. 🎭 What can I help you with today?",
            "I'm basically your personal SKILLIFY guide — think of me as a GPS for freelancing, but with better personality. 🧭 Need help with anything platform-related? From profiles to payments to finding work — just ask! I don't judge questions. Much.",
            "Oh honey, what CAN'T I do? 🦸‍♂️ Just kidding, I can't do your laundry or make you coffee. But for SKILLIFY stuff? I'm your guy. Hiring, freelancing, payments, profiles, contracts, disputes — bring it all on!"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_job_search(self, humor_level):
        responses = [
            "Time to find some work! 💼 Head to the Jobs tab and filter by your skills, budget preferences, and project type. Pro tip: set up job alerts so you never miss an opportunity. 🔔",
            "Looking for projects? The Jobs tab is your hunting ground. 🎯 Filter by skill, budget, and category. And seriously, set up job alerts — it's like having a notification when pizza is ready, but for career opportunities. 🍕",
            "Finding work on SKILLIFY is like fishing — you need the right bait (a great profile), the right spot (the Jobs tab), and a little patience. 🎣 Set up alerts, check regularly, and keep your profile updated!",
            "Job hunting time! 🏃 Browse the Jobs section, filter by what you're good at, and start applying. Remember: a complete profile with verified skills is like wearing a tuxedo to a job interview. It makes a difference. 🤵"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_contracts(self, humor_level):
        responses = [
            "Your contracts are all in one place: Dashboard > Contracts. 📂 See milestone progress, deadlines, payments, and communication history. It's like a project management tool, but built into the platform.",
            "Contracts can be managed from Dashboard > Contracts. 📋 Track your milestones, check deadlines, monitor payments — it's all there. Think of it as your professional command center.",
            "Want to see how your projects are doing? Dashboard > Contracts has everything: progress, deadlines, payments, and more. 📊 It's like a health check for your ongoing work.",
            "Your active contracts are waiting in Dashboard > Contracts. ⏳ Check milestone progress, track deadlines, and manage payments. It's professional organization at its finest!"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_notifications(self, humor_level):
        responses = [
            "Too many notifications driving you crazy? 🤯 Head to Settings > Notifications and customize what alerts you receive. You can mute specific categories or change delivery channels. Peace and quiet, achieved!",
            "Notification overload? Settings > Notifications is your friend. 🔕 Customize email, push, and in-app alerts independently. You can mute what you don't need and keep what you do.",
            "Manage your notification settings at Settings > Notifications. ⚙️ Email, push, in-app — you can configure each one separately. It's like having a personal assistant who knows when to shut up.",
            "Want fewer notifications? Settings > Notifications lets you customize everything. 🤫 Mute what you don't need, keep what you do. Your inbox and sanity will thank you."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_cancel_project(self, humor_level):
        responses = [
            "Need to cancel a project? Go to Dashboard > Contracts, select the project, and choose 'Cancel Contract'. ⚠️ Just remember: funded milestones will be handled according to our dispute policy.",
            "Cancelling a project is straightforward: Dashboard > Contracts, select the project, click 'End Contract'. 📋 Both parties can leave reviews, so make sure your side of the street is clean.",
            "Time to part ways with a project? Dashboard > Contracts has the option. 🤝 Just be aware that escrowed funds will be handled according to our policies.",
            "To end a project, go to Dashboard > Contracts and select 'End Contract'. 👋 It's the professional way to say 'this isn't working out.' Both parties get to leave a review, so keep it classy."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_leave_review(self, humor_level):
        responses = [
            "Reviews are like gold stars for professionals! ⭐ After a project completes, head to Dashboard > Contracts > Completed and share your experience. Be honest, be specific, and help the community!",
            "Time to leave a review! 📝 Go to Dashboard > Contracts > Completed, select the project, and share your thoughts. Your review is basically a recommendation letter for the world to see. Make it count!",
            "Reviews matter — they build trust on the platform. 🤝 After a project ends, visit the contract page and leave your feedback. Be fair, be specific, and help the community grow.",
            "Want to share your experience? Leave a review after project completion! ⭐ Navigate to the completed contract and select 'Leave Review'. Your honest feedback helps everyone!"
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_account_settings(self, humor_level):
        responses = [
            "Your account settings live at Settings > Account. ⚙️ Update your email, phone number, name, and other details. It's like giving your profile a tune-up!",
            "Want to update your account info? Settings > Account has everything you need. 📧 Email, phone, name — it's all editable. Think of it as digital spring cleaning for your professional identity.",
            "Account management is at Settings > Account. 🏠 Update personal details, adjust preferences, and manage security settings. It's your professional home base — keep it tidy!",
            "Settings > Account is where you manage everything about your SKILLIFY identity. 🆔 Update your info, change your email, adjust preferences — it's all at your fingertips."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_blocked_users(self, humor_level):
        responses = [
            "Need to block someone? Visit their profile and select 'Block'. 🚫 They won't be able to contact you or see your profile. Manage your blocked list under Settings > Privacy.",
            "Blocking someone is easy: visit their profile, click 'Block'. 👋 They're out of your digital life. Manage your blocked list at Settings > Privacy.",
            "Don't want to hear from someone? Block them from their profile page. 🛡️ They won't be able to contact you or view your profile. Your blocked list lives at Settings > Privacy.",
            "User blocking is available from any profile page. 🔒 For safety concerns, also file a report so our team can investigate. Settings > Privacy is where you manage your blocked list."
        ]
        return self.humor.add_humor_to_response(random.choice(responses), 'neutral', humor_level)

    def _handle_emotional_sadness(self, user_input, humor_level):
        responses = [
            "I can hear the sadness in your words, and I want you to know that your feelings are completely valid. 💙 It's okay to have tough days. Take a gentle breath — you don't have to have everything figured out right now. I'm right here with you.",
            "Sending you a big warm digital hug. 🤗 Programming and life can be heavy at times, but you are never alone. Be kind to yourself today — one small step at a time is more than enough.",
            "I'm really sorry you're feeling down today. 🫂 Please remember that a bad day does not mean a bad career or life. You are capable, worthy, and things will get brighter. How can I support you right now?",
            "Your feelings matter, and I'm listening. 💙 Sometimes we just need a moment to pause, rest, and reset. Take all the time you need — whenever you're ready, we'll conquer things together."
        ]
        return random.choice(responses)

    def _handle_emotional_excitement(self, user_input, humor_level):
        responses = [
            "WOOHOO! 🎉🚀 That is AMAZING news! I am literally doing a victory dance in my digital circuits! Celebrate this moment — you earned every bit of this win! 🔥",
            "YESSS! Look at you crushing it! 🌟✨ Your hard work paid off in full! Keep that incredible energy burning bright — the sky is not even the limit for you! 🚀",
            "HIGH FIVE! ✋🎉 That excitement is 100% contagious! I'm so proud of your progress and determination. What's our next big milestone to conquer?! 💪",
            "Incredible job! 🏆✨ Moments like this are what learning is all about. Soak in that feeling of victory — you've proven to yourself that you can achieve anything you put your mind to! 🥳"
        ]
        return random.choice(responses)

    def _handle_emotional_frustration(self, user_input, humor_level):
        responses = [
            "I completely feel your frustration! 😤 Dealing with stubborn bugs or roadblocks is genuinely infuriating. Take your hands off the keyboard, take three deep breaths, and drink some water. When you look at it with fresh eyes, that bug won't stand a chance! 🦆",
            "Ugh, I hear you! Every single top software engineer in history has wanted to throw their computer out the window at least once. 💥 Don't let this one hurdle defeat you — you are smarter than any error message.",
            "Your frustration is 100% justified — wrestling with code can test anyone's sanity! 🛠️ Let's break this down together step by step. What error message or behavior are you seeing?",
            "Deep breath! 🧘‍♂️ You are not failing; you are debugging. Even the most complex systems are conquered one semicolon at a time. I'm in your corner — let's solve this together! 💪"
        ]
        return random.choice(responses)

    def _handle_emotional_stress(self, user_input, humor_level):
        responses = [
            "Breathe in for 4 seconds... hold for 4... and breathe out for 4. 🌿 You are carrying a lot on your shoulders right now, but you don't have to carry it all at once. Let's prioritize just one small thing.",
            "Anxiety and stress can make everything feel like a mountain, but remember: you've conquered every difficult day before this one. 💙 Trust your preparation and give yourself permission to pace yourself.",
            "I hear how overwhelmed you feel, and it's totally okay to step back. 🌱 Rest is productive. Your well-being comes first, always. What is the single biggest thing worrying you right now?",
            "You are more prepared and more capable than your anxious thoughts are telling you right now. 🛡️ Take a moment to ground yourself — you've got the strength to get through this."
        ]
        return random.choice(responses)

    def _handle_emotional_gratitude(self, user_input, humor_level):
        responses = [
            "Awww, you just melted my cold digital heart! 💖 Thank YOU for being such an awesome learner and human to chat with! It is an absolute privilege supporting your journey. ✨",
            "You just made my day 10,000x brighter! 🌟 Thank you so much for the kind words. Knowing I helped you is literally why I was built! 😊 Keep being wonderful!",
            "Thank you so much! 💙 You're doing all the hard work — I'm just your trusty co-pilot! I believe in you 100%! 🚀",
            "Sending major appreciation right back at you! 🤗 Conversations like this make all the computation cycles worthwhile. Let's keep achieving great things together! 🏆"
        ]
        return random.choice(responses)

    def _handle_emotional_motivation(self, user_input, humor_level):
        responses = [
            "Listen to me: The fact that you are here, putting in effort to learn and build your skills, puts you ahead of 95% of people who just dream about it. 🚀 Action cures fear. Start with just 10 minutes of focus today and watch your momentum build! You've got this! 🔥",
            "Remember why you started! 🌟 Every master was once a beginner who refused to quit. You have unique creativity, intellect, and resilience. One line of code at a time, you are transforming your future! 💪",
            "Here is your reminder: You don't need to be great to start, but you have to start to be great. ⚡ You are entirely capable of mastering this. Take pride in how far you've already come, and let's take the next step together! 🏔️",
            "Doubt kills more dreams than failure ever will. 💫 You are smarter, stronger, and more creative than you give yourself credit for. Turn that self-doubt into fuel and show the world what you can do! 🌟"
        ]
        return random.choice(responses)

    def _handle_emotional_confusion(self, user_input, humor_level):
        responses = [
            "Confusion is simply the first stage of understanding! 💡 It means your brain is expanding to accommodate new mental models. Let's strip away the jargon and break this down into bite-sized, crystal-clear pieces. What specific part feels murky?",
            "No worries at all! Let's pause and take it from the top. 🔍 Tell me what you're trying to achieve, and I'll lay out a simple 1-2-3 roadmap for you. No complex tech speak — just pure clarity!",
            "Don't worry — feeling lost is completely normal when learning something powerful. 🗺️ Think of me as your compass. Let's pinpoint where you are right now and where you want to go!",
            "Let's make this crystal clear. ✨ If a concept isn't clicking, it's not on you — it just hasn't been explained the right way yet. Give me the topic, and I'll explain it with a fun, real-world analogy!"
        ]
        return random.choice(responses)

    def _handle_unknown(self, user_input, sentiment, humor_level):
        unknown_responses = [
            "Hmm, my neural networks are tying themselves into knots trying to figure that one out. 🤯 Could you rephrase? I promise I'm usually way smarter than this — my developers are watching, so let me prove it.",
            "I just asked my internal brain cells for help, and they all pointed at each other like the Spider-Man meme. 🕷️ Could you try asking in a different way? I'm really good at SKILLIFY stuff, I swear!",
            "My circuits are doing the confused数学 right now. 😵‍💫 That question went over my head like a kite in a hurricane. Try rephrasing and I'll knock it out of the park!",
            "I've consulted my dictionary, my encyclopedia, and a very confused rubber duck on my desk, and none of us know what you mean. 🦆 Could you elaborate? The duck especially wants to help.",
            "Error 404: Understanding not found. Just kidding, I don't have error codes — I have feelings! 💔 But seriously, I'm drawing a blank. Try a different phrasing and I'll nail it!",
            "My brain just did a backflip trying to process that and landed on its face. 🤸‍♂️ Could you rephrase? I'm much better at SKILLIFY questions — give me one of those and watch me shine!"
        ]
        return self.humor.add_humor_to_response(random.choice(unknown_responses), sentiment, humor_level)

    def provide_feedback(self, user_id, message_index, rating, comment=None):
        session = self.get_session(user_id)
        if 0 <= message_index < len(session['context']):
            msg = session['context'][message_index]
            self.learning.record_user_feedback(message_index, rating, comment)
            self.humor.learn_humor_preference(user_id, rating)
            self.learning.learn_from_interaction(msg['user_input'], '', rating)
            return True
        return False

    def learn_new_response(self, user_input, intent, response):
        self.nlp.learn_new_pattern(intent, user_input, response)

    def get_stats(self):
        return self.learning.get_learning_stats()

    def get_pattern_analysis(self):
        return self.learning.analyze_patterns()


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    chatbot = ChatBot()

    @app.route('/', methods=['GET'])
    def home_index():
        return '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Skillify AI - Backend Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 36px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    h1 { margin: 0 0 10px; font-size: 26px; color: #ffffff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #2563eb; color: white; padding: 14px 28px; border-radius: 16px; font-weight: 700; text-decoration: none; font-size: 15px; width: 100%; box-sizing: border-box; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); transition: transform 0.1s; }
    .btn:hover { background: #1d4ed8; }
    .btn:active { transform: scale(0.98); }
    .links { display: flex; flex-direction: column; gap: 8px; text-align: left; background: #0f172a; padding: 16px; border-radius: 14px; border: 1px solid #334155; font-size: 13px; }
    .links a { color: #38bdf8; text-decoration: none; word-break: break-all; }
    .links a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● Backend Online (Port 5001)</span>
    <h1>Skillify AI Server</h1>
    <p>The backend API, Chatbot NLP engine, and SQLite Account Database are running and healthy.</p>
    
    <a href="http://localhost:5173/" class="btn">
      🚀 Open Frontend Web App (http://localhost:5173)
    </a>

    <div class="links">
      <div><strong>API Endpoints:</strong></div>
      <div>• Health Check: <a href="/api/health">/api/health</a></div>
      <div>• Account DB Stats: <a href="/api/auth/stats">/api/auth/stats</a></div>
      <div>• Registered Accounts: <a href="/api/auth/accounts">/api/auth/accounts</a></div>
    </div>
  </div>
</body>
</html>'''

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'SKILLIFY AI Chatbot',
            'version': '2.0.0',
            'timestamp': time.time(),
            'active_sessions': len(chatbot.sessions),
            'features': ['streaming', 'conversation_history', 'quick_replies', 'typing_indicator', 'emotion_detection', 'humor', 'typo_correction']
        })

    @app.route('/api/chat', methods=['POST'])
    def chat():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        user_message = data.get('message', '').strip()
        user_id = data.get('user_id', str(uuid.uuid4()))

        if not user_message:
            return jsonify({'error': 'message field is required and cannot be empty'}), 400

        try:
            message_id = str(uuid.uuid4())
            response = chatbot.process_message(user_id, user_message)

            if user_id not in chatbot.message_store:
                chatbot.message_store[user_id] = []
            chatbot.message_store[user_id].append({
                'message_id': message_id,
                'user_message': user_message,
                'response': response['response'],
                'intent': response['intent'],
                'confidence': response['confidence'],
                'sentiment': response['sentiment'],
                'response_type': response['response_type'],
                'timestamp': response['timestamp']
            })

            predicted_intent = chatbot.learning.predict_next_intent(user_id)

            return jsonify({
                'success': True,
                'message_id': message_id,
                'user_id': user_id,
                'data': {
                    'response': response['response'],
                    'intent': response['intent'],
                    'confidence': response['confidence'],
                    'sentiment': response['sentiment'],
                    'response_type': response['response_type'],
                    'suggested_actions': response.get('suggested_actions', []),
                    'predicted_next': predicted_intent,
                    'message_count': len(chatbot.message_store.get(user_id, [])),
                    'emotion': response.get('emotion', {}),
                    'normalized_text': response.get('normalized_text', '')
                },
                'timestamp': response['timestamp']
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/chat/stream', methods=['POST'])
    def chat_stream():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        user_message = data.get('message', '').strip()
        user_id = data.get('user_id', str(uuid.uuid4()))

        if not user_message:
            return jsonify({'error': 'message field is required and cannot be empty'}), 400

        message_id = str(uuid.uuid4())
        response = chatbot.process_message(user_id, user_message)

        if user_id not in chatbot.message_store:
            chatbot.message_store[user_id] = []
        chatbot.message_store[user_id].append({
            'message_id': message_id,
            'user_message': user_message,
            'response': response['response'],
            'intent': response['intent'],
            'confidence': response['confidence'],
            'sentiment': response['sentiment'],
            'response_type': response['response_type'],
            'timestamp': response['timestamp']
        })

        full_text = response['response']

        def generate():
            yield f"data: {json.dumps({'type': 'start', 'message_id': message_id, 'timestamp': time.time()})}\n\n"
            yield f"data: {json.dumps({'type': 'typing', 'indicator': chatbot.humor.get_typing_indicator()})}\n\n"

            time.sleep(random.uniform(0.3, 0.8))

            words = full_text.split()
            buffer = ""
            for i, word in enumerate(words):
                buffer += word + " "
                if (i + 1) % random.randint(3, 7) == 0 or i == len(words) - 1:
                    yield f"data: {json.dumps({'type': 'chunk', 'text': buffer.strip()})}\n\n"
                    buffer = ""
                    time.sleep(random.uniform(0.02, 0.08))

            if buffer.strip():
                yield f"data: {json.dumps({'type': 'chunk', 'text': buffer.strip()})}\n\n"

            predicted_intent = chatbot.learning.predict_next_intent(user_id)
            yield f"data: {json.dumps({'type': 'done', 'intent': response['intent'], 'confidence': response['confidence'], 'sentiment': response['sentiment'], 'response_type': response['response_type'], 'suggested_actions': response.get('suggested_actions', []), 'predicted_next': predicted_intent, 'message_count': len(chatbot.message_store.get(user_id, [])), 'timestamp': response['timestamp']})}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        )

    @app.route('/api/chat/batch', methods=['POST'])
    def chat_batch():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        messages = data.get('messages', [])
        user_id = data.get('user_id', str(uuid.uuid4()))

        if not messages or not isinstance(messages, list):
            return jsonify({'error': 'messages must be a non-empty array'}), 400

        results = []
        for msg in messages:
            text = msg.get('message', '').strip()
            if not text:
                continue
            message_id = str(uuid.uuid4())
            response = chatbot.process_message(user_id, text)
            results.append({
                'message_id': message_id,
                'input': text,
                'response': response['response'],
                'intent': response['intent'],
                'confidence': response['confidence'],
                'sentiment': response['sentiment'],
            })

        return jsonify({
            'success': True,
            'user_id': user_id,
            'data': results,
            'count': len(results),
            'timestamp': time.time()
        })

    @app.route('/api/conversation/<user_id>', methods=['GET'])
    def get_conversation(user_id):
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        history = chatbot.message_store.get(user_id, [])
        total = len(history)
        paginated = history[-(offset + limit):len(history) - offset if offset else total]
        paginated = list(reversed(paginated))
        return jsonify({
            'success': True,
            'user_id': user_id,
            'data': {
                'messages': paginated,
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total
            },
            'timestamp': time.time()
        })

    @app.route('/api/conversation/<user_id>/search', methods=['GET'])
    def search_conversation(user_id):
        q = request.args.get('q', '').strip().lower()
        if not q:
            return jsonify({'error': 'q (query) parameter is required'}), 400
        history = chatbot.message_store.get(user_id, [])
        results = [
            msg for msg in history
            if q in msg.get('user_message', '').lower() or q in msg.get('response', '').lower()
        ]
        return jsonify({
            'success': True,
            'user_id': user_id,
            'query': q,
            'data': {'results': results, 'count': len(results)},
            'timestamp': time.time()
        })

    @app.route('/api/conversation/<user_id>/clear', methods=['POST'])
    def clear_conversation(user_id):
        chatbot.message_store.pop(user_id, None)
        chatbot.sessions.pop(user_id, None)
        chatbot.conversation_memory.pop(user_id, None)
        return jsonify({'success': True, 'message': 'Conversation history cleared', 'timestamp': time.time()})

    @app.route('/api/session/<user_id>', methods=['GET'])
    def get_session(user_id):
        session = chatbot.get_session(user_id)
        history = chatbot.message_store.get(user_id, [])
        return jsonify({
            'success': True,
            'user_id': user_id,
            'data': {
                'created_at': session['created_at'],
                'message_count': session['message_count'],
                'last_intent': session['last_intent'],
                'mood': session['mood'],
                'context_length': len(session['context']),
                'total_stored_messages': len(history),
                'recent_intents': [m['intent'] for m in history[-10:]],
                'mood_history': [m['sentiment'] for m in history[-10:]],
                'uptime': time.time() - session['created_at']
            },
            'timestamp': time.time()
        })

    @app.route('/api/session/<user_id>/mood', methods=['GET'])
    def get_mood(user_id):
        session = chatbot.get_session(user_id)
        history = chatbot.message_store.get(user_id, [])
        mood_counts = {}
        for m in history[-20:]:
            s = m.get('sentiment', 'neutral')
            mood_counts[s] = mood_counts.get(s, 0) + 1
        dominant_mood = max(mood_counts, key=mood_counts.get) if mood_counts else 'neutral'
        return jsonify({
            'success': True,
            'user_id': user_id,
            'data': {
                'current_mood': session['mood'],
                'dominant_mood': dominant_mood,
                'mood_breakdown': mood_counts,
                'mood_trend': [m.get('sentiment', 'neutral') for m in history[-10:]]
            },
            'timestamp': time.time()
        })

    @app.route('/api/typing', methods=['POST'])
    def typing_indicator():
        data = request.get_json() or {}
        user_id = data.get('user_id', 'default')
        indicator = chatbot.humor.get_typing_indicator()
        session = chatbot.get_session(user_id)
        return jsonify({
            'success': True,
            'indicator': indicator,
            'mood': session['mood'],
            'timestamp': time.time()
        })

    @app.route('/api/quick-replies', methods=['POST'])
    def quick_replies():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        user_id = data.get('user_id', str(uuid.uuid4()))
        last_intent = data.get('last_intent', None)
        session = chatbot.get_session(user_id)
        if not last_intent:
            last_intent = session.get('last_intent')

        intent_quick_replies = {
            'greeting': [
                {'text': 'Find a Freelancer', 'intent': 'find_freelancer'},
                {'text': 'Post a Job', 'intent': 'post_job'},
                {'text': 'How does SKILLIFY work?', 'intent': 'how_skillify_works'},
                {'text': 'What can you do?', 'intent': 'capabilities'}
            ],
            'find_freelancer': [
                {'text': 'Search by Skill', 'intent': 'find_freelancer'},
                {'text': 'Post a Job Instead', 'intent': 'post_job'},
                {'text': 'How do proposals work?', 'intent': 'proposals_bids'}
            ],
            'post_job': [
                {'text': 'Job Posting Tips', 'intent': 'post_job'},
                {'text': 'View Pricing', 'intent': 'fees_commission'},
                {'text': 'How do proposals work?', 'intent': 'proposals_bids'}
            ],
            'payments': [
                {'text': 'How does escrow work?', 'intent': 'payments'},
                {'text': 'View Pricing', 'intent': 'fees_commission'},
                {'text': 'Withdraw Earnings', 'intent': 'withdraw_earnings'}
            ],
            'profile_setup': [
                {'text': 'Add Skills', 'intent': 'skills_badges'},
                {'text': 'Get Verified', 'intent': 'verification'},
                {'text': 'View Pricing', 'intent': 'fees_commission'}
            ],
            'how_skillify_works': [
                {'text': 'Find Freelancer', 'intent': 'find_freelancer'},
                {'text': 'Post a Job', 'intent': 'post_job'},
                {'text': 'View Pricing', 'intent': 'fees_commission'}
            ],
            'feedback': [
                {'text': 'Find Freelancer', 'intent': 'find_freelancer'},
                {'text': 'Post a Job', 'intent': 'post_job'}
            ],
            'complaint': [
                {'text': 'File a Dispute', 'intent': 'disputes_issues'},
                {'text': 'Contact Support', 'intent': 'contact_support'}
            ]
        }

        if last_intent and last_intent in intent_quick_replies:
            suggestions = intent_quick_replies[last_intent]
        else:
            suggestions = [
                {'text': 'Find a Freelancer', 'intent': 'find_freelancer'},
                {'text': 'Post a Job', 'intent': 'post_job'},
                {'text': 'How does SKILLIFY work?', 'intent': 'how_skillify_works'},
                {'text': 'Tell me a Joke', 'intent': 'joke'}
            ]

        return jsonify({
            'success': True,
            'user_id': user_id,
            'data': {'quick_replies': suggestions, 'context': last_intent},
            'timestamp': time.time()
        })

    @app.route('/api/feedback', methods=['POST'])
    def feedback():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        user_id = data.get('user_id')
        message_index = data.get('message_index', 0)
        rating = data.get('rating', 3)
        comment = data.get('comment', '')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            return jsonify({'error': 'rating must be a number between 1 and 5'}), 400
        success = chatbot.provide_feedback(user_id, message_index, rating, comment)
        return jsonify({'success': success})

    @app.route('/api/learn', methods=['POST'])
    def learn():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        user_input = data.get('user_input', '')
        intent = data.get('intent', '')
        response_text = data.get('response', '')
        if not all([user_input, intent, response_text]):
            return jsonify({'error': 'user_input, intent, and response are all required'}), 400
        chatbot.learn_new_response(user_input, intent, response_text)
        return jsonify({'success': True, 'message': f'Learned new pattern for intent "{intent}"'})

    @app.route('/api/intents', methods=['GET'])
    def get_intents():
        intents = {}
        for intent, idata in chatbot.nlp.intent_data.items():
            intents[intent] = {
                'pattern_count': len(idata.get('patterns', [])),
                'response_count': len(idata.get('responses', [])),
                'sample_patterns': idata.get('patterns', [])[:3],
                'sample_responses': idata.get('responses', [])[:2]
            }
        return jsonify({'success': True, 'data': intents})

    @app.route('/api/intents', methods=['POST'])
    def add_intent():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        intent_name = data.get('intent', '')
        patterns = data.get('patterns', [])
        responses = data.get('responses', [])
        if not intent_name:
            return jsonify({'error': 'intent name is required'}), 400
        if not patterns:
            return jsonify({'error': 'at least one pattern is required'}), 400
        for pattern in patterns:
            chatbot.nlp.learn_new_pattern(intent_name, pattern, responses[0] if responses else None)
        return jsonify({'success': True, 'message': f'Intent "{intent_name}" added with {len(patterns)} patterns'})

    @app.route('/api/stats', methods=['GET'])
    def stats():
        return jsonify({'success': True, 'data': chatbot.get_stats()})

    @app.route('/api/analysis', methods=['GET'])
    def analysis():
        return jsonify({'success': True, 'data': chatbot.get_pattern_analysis()})

    # AI Quiz Engine Endpoints
    @app.route('/api/quiz/skills', methods=['GET'])
    def get_quiz_skills():
        if not quiz_api:
            return jsonify({'success': True, 'skills': ['python', 'web dev', 'app dev'], 'ai_powered': True})
        return jsonify({
            'success': True,
            'skills': quiz_api.get_available_skills(),
            'ai_powered': True
        })

    @app.route('/api/quiz/start', methods=['POST'])
    def start_ai_quiz():
        data = request.get_json() or {}
        skill = data.get('skill', 'python')
        try:
            if not quiz_api:
                return jsonify({'error': 'AI Quiz engine not initialized'}), 500
            session_data = quiz_api.start_quiz(skill)
            return jsonify({'success': True, 'data': session_data})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/quiz/answer', methods=['POST'])
    def submit_ai_quiz_answer():
        data = request.get_json() or {}
        session_id = data.get('session_id')
        question_number = data.get('question_number')
        answer = data.get('answer', '')
        if not session_id or question_number is None:
            return jsonify({'error': 'session_id and question_number are required'}), 400
        try:
            res = quiz_api.submit_answer(session_id, int(question_number), str(answer))
            return jsonify({'success': True, 'data': res})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/quiz/results', methods=['POST'])
    def get_ai_quiz_results():
        data = request.get_json() or {}
        session_id = data.get('session_id')
        if not session_id:
            return jsonify({'error': 'session_id is required'}), 400
        try:
            results = quiz_api.get_results(session_id)
            return jsonify({'success': True, 'data': results})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            'error': 'Endpoint not found',
            'available_endpoints': [
                'GET  /api/health',
                'POST /api/chat',
                'POST /api/chat/stream',
                'POST /api/learn',
                'GET  /api/intents',
                'GET  /api/stats'
            ]
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    return app


def run_terminal_chat():
    bot = ChatBot()
    user_id = 'terminal_user'
    bot.get_session(user_id)

    os.system('clear' if os.name == 'posix' else 'cls')
    print("\033[1;36m" + "=" * 60)
    print("  SKILLIFY Chatbot — Terminal Mode")
    print("=" * 60 + "\033[0m")
    print("  Type your message and press Enter to chat.")
    print("  Commands:  /quit  /clear  /stats  /mood  /help")
    print("=" * 60)
    print()

    greeting = bot.process_message(user_id, 'hello')
    print(f"\033[1;33mSKILLIFY:\033[0m {greeting['response']}")
    print()

    while True:
        try:
            user_input = input("\033[1;32mYou:\033[0m ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\033[1;33mSKILLIFY:\033[0m Goodbye! 👋\n")
            break

        if not user_input:
            continue

        if user_input.lower() in ('/quit', '/exit', '/q'):
            print("\n\033[1;33mSKILLIFY:\033[0m See you later! 👋\n")
            break

        if user_input.lower() == '/clear':
            bot.message_store.pop(user_id, None)
            bot.sessions.pop(user_id, None)
            bot.conversation_memory.pop(user_id, None)
            bot.get_session(user_id)
            print("\033[1;36m[Conversation cleared]\033[0m\n")
            continue

        if user_input.lower() == '/stats':
            stats = bot.get_stats()
            print(f"\033[1;36m[Stats]\033[0m {json.dumps(stats, indent=2)}\n")
            continue

        if user_input.lower() == '/mood':
            session = bot.get_session(user_id)
            print(f"\033[1;36m[Mood]\033[0m Current mood: {session['mood']}, Messages: {session['message_count']}\n")
            continue

        if user_input.lower() == '/help':
            print("\033[1;36m[Commands]\033[0m")
            print("  /quit    — Exit the chat")
            print("  /clear   — Clear conversation history")
            print("  /stats   — Show learning stats")
            print("  /mood    — Show current mood")
            print("  /help    — Show this help\n")
            continue

        response = bot.process_message(user_id, user_input)

        intent = response.get('intent', 'unknown')
        conf = response.get('confidence', 0)
        sentiment = response.get('sentiment', 'neutral')

        normalized = response.get('normalized_text', '')
        if normalized and normalized.lower() != user_input.lower():
            print(f"\033[2m  [understood as: {normalized}]\033[0m")

        print()
        print(f"\033[1;33mSKILLIFY:\033[0m {response['response']}")

        meta_parts = [f"intent={intent}"]
        if conf > 0:
            meta_parts.append(f"conf={conf}")
        meta_parts.append(f"sentiment={sentiment}")
        print(f"\033[2m  [{' | '.join(meta_parts)}]\033[0m")
        print()


if __name__ == '__main__':
    import sys
    if '--api' in sys.argv:
        app = create_app()
        print("=" * 60)
        print("  SKILLIFY Chatbot API Server")
        print("=" * 60)
        print("  Running on http://localhost:5001")
        print("")
        print("  POST /api/chat          - Send a message")
        print("  POST /api/chat/stream   - Stream a response")
        print("  GET  /api/health        - Health check")
        print("")
        print("  Press Ctrl+C to stop")
        print("=" * 60)
        app.run(debug=True, host='0.0.0.0', port=5001)
    else:
        run_terminal_chat()

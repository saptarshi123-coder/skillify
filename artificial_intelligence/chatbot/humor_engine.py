import random
import time
from collections import defaultdict


class HumorEngine:
    def __init__(self):
        self.jokes = self._load_jokes()
        self.puns = self._load_puns()
        self.witty_replies = self._load_witty_replies()
        self.humor_context = defaultdict(list)
        self.user_humor_preference = {}
        self.joke_history = []

    def _load_jokes(self):
        return {
            'tech': [
                "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                "There are only 10 types of people in the world: those who understand binary and those who don't. 🤖",
                "A SQL query walks into a bar, sees two tables and asks... 'Can I join you?' 🍺",
                "Why did the developer go broke? Because he used up all his cache! 💸",
                "What's a programmer's favorite hangout place? Foo Bar. 🍸",
                "How many programmers does it take to change a light bulb? None — that's a hardware problem! 💡",
                "Why do Java developers wear glasses? Because they don't C#! 👓",
                "What's a programmer's favorite tea? NullPointerException. ☕",
                "Why did the programmer quit his job? Because he didn't get arrays! 📊",
                "Why was the JavaScript developer sad? Because they didn't Node how to Express themselves! 😢",
                "How do you comfort a JavaScript bug? You console.log it! 🪵",
                "Why do Python programmers have low self-esteem? Because they're constantly comparing `self` to others! 🐍",
                "A programmer puts two glasses on his nightstand: one full of water if he gets thirsty, and one empty if he doesn't. 🥛",
                "Git commit message of the day: 'Fixed bug by creating three new ones. Job security achieved.' 🌿",
                "Why did the C++ developer go to therapy? Too many unresolved pointer issues and memory leaks. 🧠",
                "CSS in a nutshell: You style one button, and suddenly your header relocates to the neighbor's living room! 🎨",
                "My code doesn't work: I don't know why. My code works: I REALLY don't know why! 🔮",
                "There are 2 hardest problems in Computer Science: Cache invalidation, naming things, and off-by-one errors! 🔢"
            ],
            'freelancing': [
                "Why did the freelancer bring a ladder to work? To reach those high-ticket enterprise contracts! 🪜",
                "What do you call a freelancer who finishes ahead of schedule? A mythical creature in the wild! 🦄",
                "I told my client I needed 5 minutes. They said 'Take your time!' ...It's now 2026. ⏳",
                "What's the difference between a freelancer and a magician? The magician only makes a rabbit disappear — the freelancer makes scope creep disappear! 🎩",
                "Why did the freelance designer break up with the font? Because they found someone way more appealing! 🎨",
                "How does a freelancer exercise? By doing proposal push-ups and deadline crunches every morning! 💪",
                "What's a freelancer's favorite exercise? Deadline crunches! 🏋️",
                "Why did the freelancer cross the road? To connect to the coffee shop's free high-speed Wi-Fi! ☕"
            ],
            'customer_service': [
                "I told my boss I needed a raise because three companies were after me. He asked which ones. I said: gas, electric, and water.",
                "What's the difference between a customer service rep and a tennis ball? The tennis ball eventually gets hit back.",
                "What do you call a support rep who's always calm? A supportive friend.",
                "Why did the support agent bring a ladder? To reach new heights in customer satisfaction.",
                "Customer service tip: always smile. Even if you're typing. The keyboard can feel it."
            ],
            'general': [
                "I told my wife she was drawing her eyebrows too high. She looked surprised.",
                "Why don't scientists trust atoms? Because they make up everything.",
                "I'm reading a book about anti-gravity. It's impossible to put down.",
                "What do you call a fake noodle? An impasta.",
                "Why did the scarecrow win an award? He was outstanding in his field.",
                "I used to hate facial hair, but then it grew on me.",
                "What do you call a bear with no teeth? A gummy bear!",
                "Why don't eggs tell jokes? They'd crack each other up.",
                "I'm on a seafood diet. I see food and I eat it."
            ],
            'situational': {
                'waiting': [
                    "While we wait, did you know the average freelancer sends 27 proposals before securing a project? The process rewards persistence.",
                    "An interesting statistic: the average professional network contains 500+ connections, yet only a fraction result in meaningful engagements. Quality matters.",
                    "Fun fact: the word 'freelance' originally referred to medieval mercenaries who sold their services to the highest bidder. So technically, you're a modern-day knight. With a laptop."
                ],
                'confused': [
                    "Technical misunderstandings are common — even our systems occasionally require recalibration. Let us work through this together.",
                    "Clarification is always welcome. Please feel free to rephrase your question, and I will do my best to assist.",
                    "No worries! Even I sometimes need a reboot to understand what's going on. Let's figure this out together."
                ],
                'happy': [
                    "Your positive engagement is noted. It is always rewarding to assist users who approach the platform with enthusiasm.",
                    "Professional courtesy is greatly appreciated. How may I continue to assist you today?",
                    "I love talking to happy people! It's like charging my digital batteries. What else can I help you with?"
                ]
            }
        }

    def _load_puns(self):
        return {
            'job': [
                "Let us get this show on the job. (I apologize for the attempted humor.)",
                "This job situation is looking rather job-ificent. (That was admittedly suboptimal.)",
                "Time to job-ify your career! (I'm not even sorry for that one.)"
            ],
            'payment': [
                "Don't worry, this payment won't be a *payment-al* experience!",
                "I'll make this payment process as smooth as a *payment-ally* sound transaction!",
                "Let's make this payment as painless as possible. I promise it won't cost you an arm and a leg... just the agreed-upon amount."
            ],
            'proposal': [
                "Time to propose a solution. (I acknowledge the intended wordplay.)",
                "Let us make this proposal a positive one.",
                "Proposal time! Remember, a good proposal is like a good pickup line - it should be memorable, relevant, and not creepy."
            ],
            'profile': [
                "Let us make your profile exceptional.",
                "Your profile is about to receive a significant improvement.",
                "Time to give your profile a glow-up! It's like a makeover montage, but for your professional image."
            ],
            'general': [
                "I am without your questions. (A subtle attempt at humor.)",
                "You have nailed this question.",
                "That's a great question! It's almost as good as 'why do programmers prefer dark mode?' Almost."
            ]
        }

    def _load_witty_replies(self):
        return {
            'thinking': [
                "Processing your request... (and possibly judging it slightly. Just kidding!)",
                "One moment while I retrieve the relevant information. (I promise I'm not Googling this.)",
                "Please wait while I consult the appropriate resources. (My brain, which is a computer.)",
                "I am working on your request. (I'm basically a really fast intern.)",
                "Crunching the numbers... (Not literally, that would hurt.)"
            ],
            'apology': [
                "I apologize for the inconvenience. Let me correct that immediately. (I'm only human... well, not really, but you get the idea.)",
                "My apologies. That should not have occurred. Let me address it. (Consider this a digital do-over.)",
                "I apologize for the oversight. Let me provide the correct information. (Even chatbots make mistakes. It's humbling.)",
                "My bad! Let me fix that for you. (See? I can be casual AND professional.)"
            ],
            'transition': [
                "Moving on to your next question. (Like a digital butterfly, from flower to flower.)",
                "Continuing with your inquiry. (We're on a roll here!)",
                "Proceeding to the next matter. (I feel like a news anchor. 'And now, over to the next story.')",
                "Let me address your next question. (I love a good question. They're like puzzles, but with words.)"
            ],
            'encouragement': [
                "You're doing great! Keep the questions coming. (I'm basically a cheerleader with a keyboard.)",
                "Your engagement is appreciated. I remain at your service. (And at your beck and call. Digitally speaking.)",
                "Thank you for your patience. I am here to help. (And I'm quite good at it, if I do say so myself.)",
                "Your questions are welcome. Please do not hesitate to ask more. (Seriously, I thrive on this stuff.)",
                "You're on a roll! What else can I help you with? (I'm having fun here.)"
            ]
        }

    def get_emotion_aware_humor(self, emotion_tags, humor_level=0.3):
        if humor_level <= 0:
            return ""

        humor_map = {
            'angry': [
                " I know this is frustrating, but let me help you laugh about it later! 😊",
                " Deep breaths! I'm here to help, and we'll get through this together.",
                " I promise we'll fix this. In the meantime, here's a virtual hug! 🤗"
            ],
            'sad': [
                " I'm sending you positive vibes! Things will get better. ✨",
                " Even on tough days, you're doing great. I believe in you! 💪",
                " Here's a smile to brighten your day! 😊 You've got this!"
            ],
            'excited': [
                " I love your energy! Let's keep this momentum going! 🚀",
                " That enthusiasm is contagious! What else can we conquer together?",
                " You're on fire today! (In a good way!) Let's make things happen! 🔥"
            ],
            'confused': [
                " No worries! Even I get confused sometimes, and I'm literally a computer! 🤖",
                " Let's figure this out together! Two heads are better than one.",
                " Confusion is just learning in disguise! Let me break this down for you."
            ],
            'playful': [
                " I see you're in a playful mood! I love it! 😄",
                " Alright, let's keep things fun! What else can I help with?",
                " Your sense of humor is top-notch! Now, how can I assist you?"
            ],
            'humorous': [
                " Great joke! I appreciate good humor. Now, what can I help you with?",
                " That's funny! You should be a comedian... or at least a really entertaining freelancer! 😂",
                " I'm laughing on the inside! (I'm a chatbot, it's complicated.) What else is on your mind?"
            ]
        }

        for tag in emotion_tags:
            if tag in humor_map and random.random() < humor_level:
                return random.choice(humor_map[tag])

        return ""

    def get_contextual_wisdom(self, intent, user_emotion=None):
        wisdom_map = {
            'find_freelancer': [
                "Pro tip: Look for freelancers with verified badges and strong reviews. Quality matters!",
                "Remember, the cheapest option isn't always the best. Value and reliability count too!",
                "Check the freelancer's portfolio carefully. Past work is the best predictor of future performance."
            ],
            'post_job': [
                "A detailed job description attracts better proposals. Be specific about what you need!",
                "Set a realistic budget. Low budgets often attract low-quality proposals.",
                "Include examples of work you admire. It helps freelancers understand your vision."
            ],
            'payments': [
                "Always use the escrow system. It protects both you and the freelancer.",
                "Fund milestones based on deliverables. This keeps everyone accountable.",
                "Never pay outside the platform. Escrow is your safety net!"
            ],
            'profile_setup': [
                "Your profile photo is your first impression. Make it professional and friendly!",
                "Write a bio that shows your personality. Clients want to work with real people!",
                "List your top 3-5 skills prominently. This helps with search visibility."
            ],
            'job_search': [
                "Apply to jobs that match your skills. Quality applications beat quantity!",
                "Set up job alerts so you never miss an opportunity!",
                "Keep your portfolio updated with your best recent work."
            ]
        }

        if intent in wisdom_map:
            return random.choice(wisdom_map[intent])
        return ""

    def get_random_joke(self, category='general'):
        if category in self.jokes:
            available = [j for j in self.jokes[category] if j not in self.joke_history[-10:]]
            if not available:
                available = self.jokes[category]
            joke = random.choice(available)
            self.joke_history.append(joke)
            return joke
        return random.choice(self.jokes['general'])

    def get_random_pun(self, context='general'):
        if context in self.puns:
            return random.choice(self.puns[context])
        return random.choice(self.puns['general'])

    def get_witty_reply(self, reply_type='thinking'):
        if reply_type in self.witty_replies:
            return random.choice(self.witty_replies[reply_type])
        return "I'm on it!"

    def get_situational_humor(self, situation):
        if situation in self.jokes['situational']:
            return random.choice(self.jokes['situational'][situation])
        return None

    def add_humor_to_response(self, response, user_sentiment='neutral', humor_level=0.85):
        if humor_level <= 0:
            return response

        if user_sentiment == 'positive':
            additions = [
                " Your enthusiasm is contagious! (Digitally speaking, of course.) ⚡",
                " That's the high-octane coding energy we love to see! 🚀",
                " You're making my digital circuits light up brighter than RGB RAM! ✨",
                " I like your style — smart questions get top-tier answers! 😎"
            ]
        elif user_sentiment == 'negative':
            additions = [
                " I'm in your corner to make this 100% right. Let's conquer this bug together! 🛠️",
                " Take a deep breath — even Linus Torvalds had bad days. We'll get this sorted! 💪",
                " I promise this won't take forever. Let's fix this in record time! 🤝"
            ]
        else:
            additions = [
                " What else can I assist you with today? I'm fueled by virtual coffee! ☕",
                " Keep the questions coming — I'm basically a compiler with a sense of humor! 💻",
                " Ready for the next challenge whenever you are! 🎯",
                " Don't be shy — ask me anything from Algorithms to Freelance Contracts! 🚀"
            ]

        if additions:
            addition = random.choice(additions)
            if random.random() < max(humor_level, 0.6):
                response = response + "\n\n" + addition

        return response

    def should_crack_joke(self, conversation_context):
        if not conversation_context:
            return False
        recent_messages = conversation_context[-3:]
        mood = 'neutral'
        for msg in recent_messages:
            if isinstance(msg, dict) and 'sentiment' in msg:
                mood = msg['sentiment']

        if mood == 'positive' and random.random() < 0.5:
            return True
        if mood == 'neutral' and random.random() < 0.35:
            return True
        if len(recent_messages) >= 2 and random.random() < 0.4:
            return True

        return False

    def get_greeting_for_time(self):
        hour = time.localtime().tm_hour
        if 5 <= hour < 12:
            greetings = [
                "Good morning! Rise and shine, superstar! I'm here and ready to help you conquer the day. What's the mission?",
                "Morning! You're up early - or maybe you never slept. Either way, I'm impressed and here to help!",
                "Good morning! I hope your coffee is strong and your Wi-Fi is stronger. What can I help you with today?",
                "Rise and grind! Or rise and chill - no judgment here. How can I make your morning even better?"
            ]
        elif 12 <= hour < 17:
            greetings = [
                "Good afternoon! Hope your day is going swimmingly. What can I help you with?",
                "Afternoon! You've survived half the day - that's worth celebrating. What can I do for you?",
                "Good afternoon! I'm here and caffeinated (digitally speaking). What's on your mind?",
                "Hello there, afternoon warrior! Ready to tackle some SKILLIFY business?"
            ]
        elif 17 <= hour < 21:
            greetings = [
                "Good evening! Time to relax... or at least pretend to while we handle some platform business. What do you need?",
                "Evening! Hope your day was productive. What can I help you wind down with?",
                "Good evening! I'm here to make your evening a little easier. What's up?",
                "Hello! Evening hours are my favorite. Less rush, more quality chat time. What can I help with?"
            ]
        else:
            greetings = [
                "Late night coding session? Or just browsing? Either way, I'm here and wide awake (I don't sleep). What do you need?",
                "Burning the midnight oil? I respect the hustle. What can I help you with?",
                "Good evening, night owl! I'm here 24/7, so no judgement on the hour. What's up?",
                "Still going strong? I admire the dedication. How can I help you tonight?"
            ]
        return random.choice(greetings)

    def get_typing_indicator(self):
        indicators = [
            "Processing your request... (and possibly judging it slightly)",
            "One moment while I retrieve the relevant information.",
            "Please wait while I process your query. (I'm basically a really fast intern.)",
            "Let me look into that for you. (My brain is a computer, so this should be quick.)",
            "I am working on your request. (Hang tight, I'm almost there!)",
            "Crunching the numbers... (Not literally, that would hurt.)",
            "Consulting my vast digital knowledge base... (Okay, it's a JSON file, but still impressive.)"
        ]
        return random.choice(indicators)

    def get_follow_up_question(self, intent):
        follow_ups = {
            'find_freelancer': [
                "Would you like me to explain how our freelancer matching works? It's like a dating app, but for professional skills.",
                "You may also consider posting a job to receive proposals from interested freelancers. Let them come to you!",
                "I can guide you through the filtering options if you need help narrowing your search. Filters are your friend!"
            ],
            'post_job': [
                "Would you like guidance on writing an effective job description? It's like writing a dating profile, but for your project.",
                "I recommend reviewing our job posting guidelines for best results. Trust me, the details matter!",
                "Shall I explain the different budget types available for job listings? There's more than one way to skin a cat... budget, I mean."
            ],
            'proposals_bids': [
                "I can provide tips on writing a compelling proposal if you are a freelancer. Make it personal, make it count!",
                "Would you like to know how proposal evaluation works on SKILLIFY? Spoiler: it's not just about the lowest bid.",
                "You may set up automatic proposal notifications to stay informed. Never miss a hot opportunity!"
            ],
            'payments': [
                "Would you like me to explain the escrow process in detail? It's like a trust fall, but with money.",
                "I can walk you through adding a payment method if needed. It's easier than setting up Netflix, I promise.",
                "You may review your transaction history under Dashboard > Wallet. All your financial history in one place!"
            ],
            'technical_support': [
                "Would you like me to guide you through basic troubleshooting steps? We'll be tech detectives together!",
                "I can help you submit a technical support ticket if the issue persists. No problem too big!",
                "Clearing your browser cache often resolves common loading issues. It's like giving your browser a fresh start."
            ],
            'profile_setup': [
                "I can provide specific guidance on optimizing each profile section. Let's make you shine!",
                "Would you like tips on writing a compelling professional summary? It's your elevator pitch, but on paper.",
                "Completing all profile sections increases your visibility significantly. Go for gold!"
            ],
            'verification': [
                "Verification typically takes 1-2 business days for review. Patience is a virtue!",
                "A verified badge can improve your hiring rate by up to 30%. That's like a 30% raise in opportunities!",
                "Would you like to begin the verification process now? Let's get you that trust badge!"
            ],
            'how_skillify_works': [
                "Would you like a detailed walkthrough of any specific feature? I'm like a personal tour guide!",
                "I recommend starting by completing your profile before exploring other features. First impressions matter!",
                "You may also visit our Help Center for comprehensive platform guides. Knowledge is power!"
            ]
        }
        if intent in follow_ups:
            return random.choice(follow_ups[intent])
        return None

    def learn_humor_preference(self, user_id, rating):
        if user_id not in self.user_humor_preference:
            self.user_humor_preference[user_id] = []
        self.user_humor_preference[user_id].append(rating)
        if len(self.user_humor_preference[user_id]) > 10:
            self.user_humor_preference[user_id] = self.user_humor_preference[user_id][-10:]

    def get_user_humor_level(self, user_id):
        if user_id not in self.user_humor_preference:
            return 0.5
        ratings = self.user_humor_preference[user_id]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0.5
        return min(max(avg_rating, 0.1), 0.8)

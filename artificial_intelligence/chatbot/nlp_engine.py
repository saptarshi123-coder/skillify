import ssl
import nltk
import json
import os
import re
import random
import string

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('averaged_perceptron_tagger_eng', quiet=True)

from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from collections import Counter


class NLPEngine:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.intent_data = self._load_intent_data()
        self.user_patterns = {}
        self.conversation_history = []
        self.context = {}
        self.spell_dictionary = self._build_spell_dictionary()
        self.learned_corrections = {}
        self.misspelled_patterns = {}
        self.texting_slang = self._build_texting_slang()
        self.emoji_sentiment = self._build_emoji_sentiment()
        self.intensifiers = self._build_intensifiers()
        self.slang_patterns = self._build_slang_patterns()
        self.typo_dictionary = self._build_typo_dictionary()
        self.keyboard_adjacency = self._build_keyboard_adjacency()
        self.common_typos = self._build_common_typos()
        self.contextual_corrections = self._build_contextual_corrections()

    def _build_keyboard_adjacency(self):
        return {
            'q': ['w', 'a', 's'],
            'w': ['q', 'e', 'a', 's', 'd'],
            'e': ['w', 'r', 's', 'd', 'f'],
            'r': ['e', 't', 'd', 'f', 'g'],
            't': ['r', 'y', 'f', 'g', 'h'],
            'y': ['t', 'u', 'g', 'h', 'j'],
            'u': ['y', 'i', 'h', 'j', 'k'],
            'i': ['u', 'o', 'j', 'k', 'l'],
            'o': ['i', 'p', 'k', 'l'],
            'p': ['o', 'l'],
            'a': ['q', 'w', 's', 'z', 'x'],
            's': ['a', 'w', 'e', 'd', 'z', 'x', 'c'],
            'd': ['s', 'e', 'r', 'f', 'x', 'c', 'v'],
            'f': ['d', 'r', 't', 'g', 'c', 'v', 'b'],
            'g': ['f', 't', 'y', 'h', 'v', 'b', 'n'],
            'h': ['g', 'y', 'u', 'j', 'b', 'n', 'm'],
            'j': ['h', 'u', 'i', 'k', 'n', 'm'],
            'k': ['j', 'i', 'o', 'l', 'm'],
            'l': ['k', 'o', 'p'],
            'z': ['a', 's', 'x'],
            'x': ['z', 'a', 's', 'd', 'c'],
            'c': ['x', 's', 'd', 'f', 'v'],
            'v': ['c', 'd', 'f', 'g', 'b'],
            'b': ['v', 'f', 'g', 'h', 'n'],
            'n': ['b', 'g', 'h', 'j', 'm'],
            'm': ['n', 'h', 'j', 'k']
        }

    def _build_common_typos(self):
        return {
            'freelncr': 'freelancer',
            'freelanser': 'freelancer',
            'freelencer': 'freelancer',
            'freelancr': 'freelancer',
            'freelanceer': 'freelancer',
            'freelancor': 'freelancer',
            'freelanecer': 'freelancer',
            'frelancer': 'freelancer',
            'freelncor': 'freelancer',
            'freelenser': 'freelancer',
            'freelacner': 'freelancer',
            'freelancwer': 'freelancer',
            'freelancser': 'freelancer',
            'freelancder': 'freelancer',
            'freelanczer': 'freelancer',
            'freelancxr': 'freelancer',
            'freelancrr': 'freelancer',
            'freelancwe': 'freelancer',
            'freelancse': 'freelancer',
            'freelancde': 'freelancer',
            'freelancze': 'freelancer',
            'freelancxe': 'freelancer',
            'freelanceor': 'freelancer',
            'freelanceir': 'freelancer',
            'freelanceur': 'freelancer',
            'freelancear': 'freelancer',
            'freelanceyr': 'freelancer',
            'freelncer': 'freelancer',
            'freelance': 'freelancer',
            'freelancng': 'freelancing',
            'freelancig': 'freelancing',
            'freelancin': 'freelancing',
            'frelancing': 'freelancing',
            'freelnacing': 'freelancing',
            'freelancning': 'freelancing',
            'freelancign': 'freelancing',
            'freelancinng': 'freelancing',
            'prposal': 'proposal',
            'proposl': 'proposal',
            'prooposal': 'proposal',
            'propoasl': 'proposal',
            'propasal': 'proposal',
            'proosal': 'proposal',
            'propsoal': 'proposal',
            'proposla': 'proposal',
            'proposail': 'proposal',
            'propossal': 'proposal',
            'propoosal': 'proposal',
            'proposall': 'proposal',
            'proposasl': 'proposal',
            'proposlal': 'proposal',
            'proposael': 'proposal',
            'proposle': 'proposal',
            'prposals': 'proposals',
            'proposlas': 'proposals',
            'propossals': 'proposals',
            'proopoals': 'proposals',
            'propoasls': 'proposals',
            'propasl': 'proposal',
            'paymnt': 'payment',
            'payemnt': 'payment',
            'paymenet': 'payment',
            'paymet': 'payment',
            'paymant': 'payment',
            'payement': 'payment',
            'pymnet': 'payment',
            'paymnts': 'payments',
            'payemnts': 'payments',
            'paymenets': 'payments',
            'paymets': 'payments',
            'paymants': 'payments',
            'payements': 'payments',
            'pymnets': 'payments',
            'prfoile': 'profile',
            'proflie': 'profile',
            'profle': 'profile',
            'proifle': 'profile',
            'profiel': 'profile',
            'porfile': 'profile',
            'proflile': 'profile',
            'profille': 'profile',
            'profiile': 'profile',
            'profilee': 'profile',
            'prfoiles': 'profiles',
            'proflies': 'profiles',
            'profles': 'profiles',
            'proifles': 'profiles',
            'profiesl': 'profiles',
            'porfiles': 'profiles',
            'profliles': 'profiles',
            'profilles': 'profiles',
            'profiiles': 'profiles',
            'profilees': 'profiles',
            'portfoloi': 'portfolio',
            'portflolio': 'portfolio',
            'portflio': 'portfolio',
            'portfoloio': 'portfolio',
            'porftolio': 'portfolio',
            'portfpolio': 'portfolio',
            'skil': 'skill',
            'skilss': 'skills',
            'skils': 'skills',
            'sklls': 'skills',
            'skll': 'skill',
            'badeg': 'badge',
            'badegs': 'badges',
            'verfication': 'verification',
            'verificaton': 'verification',
            'disptue': 'dispute',
            'dsipute': 'dispute',
            'disupte': 'dispute',
            'mesage': 'message',
            'messge': 'message',
            'notificaton': 'notification',
            'notifcation': 'notification',
            'memebership': 'membership',
            'membersihp': 'membership',
            'prject': 'project',
            'projcet': 'project',
            'prjects': 'projects',
            'projcets': 'projects',
            'dshboard': 'dashboard',
            'dashbaord': 'dashboard',
            'escorw': 'escrow',
            'wilthdraw': 'withdraw',
            'coomssion': 'commission',
            'comission': 'commission',
            'cntract': 'contract',
            'contrcat': 'contract',
            'cntracts': 'contracts',
            'contrcats': 'contracts',
            'mlestons': 'milestones',
            'milestons': 'milestones',
            'mleston': 'milestone',
            'mileston': 'milestone',
            'withdral': 'withdrawal',
            'earings': 'earnings',
            'earnigns': 'earnings',
            'wlalet': 'wallet',
            'balacne': 'balance',
            'pyout': 'payout',
            'plaec': 'place',
            'acount': 'account',
            'acounts': 'accounts',
            'settins': 'settings',
            'optoins': 'options',
            'preferneces': 'preferences',
            'inb ox': 'inbox',
            'sesion': 'session',
            'pltaform': 'platform',
            'srvices': 'services',
            'featres': 'features',
            'sppport': 'support',
            'pricng': 'pricing',
            'comssion': 'commission',
            'wrker': 'worker',
            'wrkers': 'workers',
            'dveloper': 'developer',
            'dvelopers': 'developers',
            'dsigner': 'designer',
            'dsigners': 'designers',
            'wirter': 'writer',
            'wirters': 'writers',
            'progrmer': 'programmer',
            'progrmers': 'programmers',
            'enginer': 'engineer',
            'enginers': 'engineers',
            'anaylst': 'analyst',
            'anaylsts': 'analysts',
            'consltant': 'consultant',
            'consltants': 'consultants',
            'managr': 'manager',
            'managrs': 'managers',
            'speclalist': 'specialist',
            'speclalists': 'specialists',
            'expet': 'expert',
            'expets': 'experts',
            'guru': 'guru',
            'gurus': 'gurus',
            'nija': 'ninja',
            'nijas': 'ninjas',
            'rockstar': 'rockstar',
            'rockstr': 'rockstar',
            'junor': 'junior',
            'junors': 'juniors',
            'snior': 'senior',
            'sniors': 'seniors',
            'lad': 'lead',
            'lads': 'leads',
            'hed': 'head',
            'heds': 'heads',
            'chif': 'chief',
            'chifs': 'chiefs',
            'direcor': 'director',
            'direcors': 'directors',
            'houry': 'hourly',
            'hourly': 'hourly',
            'fxed': 'fixed',
            'delline': 'deadline',
            'dellines': 'deadlines',
            'tlne': 'timeline',
            'tlnes': 'timelines',
            'dlvrble': 'deliverable',
            'dlvrbles': 'deliverables',
            'scpe': 'scope',
            'reqirements': 'requirements',
            'speifications': 'specifications',
            'breif': 'brief',
            'summry': 'summary',
            'descrpion': 'description',
            'descrpions': 'descriptions',
            'resme': 'resume',
            'exprince': 'experience',
            'exprinces': 'experiences',
            'sampls': 'samples',
            'exampls': 'examples',
            'shwcase': 'showcase',
            'dmnstrate': 'demonstrate',
            'dmnstrates': 'demonstrates',
            'hlght': 'highlight',
            'hlghts': 'highlights',
            'dscver': 'discover',
            'dscvers': 'discovers',
            'explre': 'explore',
            'explres': 'explores',
            'nvgate': 'navigate',
            'nvgates': 'navigates',
            'vw': 'view',
            'vws': 'views',
            'chck': 'check',
            'chcks': 'checks',
            'monitr': 'monitor',
            'monitrs': 'monitors',
            'trck': 'track',
            'trcks': 'tracks',
            'mange': 'manage',
            'manges': 'manages',
            'hndle': 'handle',
            'hndles': 'handles',
            'cnfigure': 'configure',
            'cnfigures': 'configures',
            'stup': 'setup',
            'sttngs': 'settings',
            'opton': 'option',
            'optons': 'options',
            'prfernces': 'preferences',
            'accunt': 'account',
            'accunts': 'accounts',
            'usr': 'user',
            'usrname': 'username',
            'passwrd': 'password',
            'adres': 'address',
            'adreses': 'addresses',
            'locaion': 'location',
            'locaions': 'locations',
            'contry': 'country',
            'contries': 'countries',
            'cty': 'city',
            'cties': 'cities',
            'ste': 'state',
            'stes': 'states',
            'lnguage': 'language',
            'lnguages': 'languages',
            'tmezone': 'timezone',
            'tmezones': 'timezones',
            'onln': 'online',
            'offln': 'offline',
            'avlble': 'available',
            'unavlble': 'unavailable',
            'actve': 'active',
            'inactve': 'inactive',
            'pendng': 'pending',
            'aprvd': 'approved',
            'rejcted': 'rejected',
            'clsed': 'closed',
            'opn': 'open',
            'publc': 'public',
            'prvate': 'private',
            'blcked': 'blocked',
            'unblcked': 'unblocked',
            'rprted': 'reported',
            'flaged': 'flagged',
            'vrfd': 'verified',
            'unvrfd': 'unverified',
            'trstd': 'trusted',
            'reliable': 'reliable',
            'qualty': 'quality',
            'xcellent': 'excellent',
            'avrge': 'average',
            'poor': 'poor',
            'star': 'star',
            'stars': 'stars',
            'prcnt': 'percent',
            'prcntage': 'percentage',
            'mnmum': 'minimum',
            'mxmum': 'maximum',
            'ttl': 'total',
            'nmb': 'number',
            'grss': 'gross',
            'prfit': 'profit',
            'lss': 'loss',
            'rvenu': 'revenue',
            'ncome': 'income',
            'xpense': 'expense',
            'xpenses': 'expenses',
            'nvest': 'invest',
            'nvests': 'invests',
            'dly': 'daily',
            'wkly': 'weekly',
            'mnthly': 'monthly',
            'yrly': 'yearly',
            'anual': 'annual',
            'qrtely': 'quarterly',
            'tday': 'today',
            'ystrday': 'yesterday',
            'tmrrow': 'tomorrow',
            'wck': 'week',
            'mnth': 'month',
            'yrs': 'years',
            'hr': 'hour',
            'mnt': 'minute',
            'scd': 'second',
            'mrning': 'morning',
            'afrnoon': 'afternoon',
            'evning': 'evening',
            'nght': 'night',
            'mnght': 'midnight',
            'nn': 'noon',
            'ndy': 'sunday',
            'mndy': 'monday',
            'tsdy': 'tuesday',
            'wendsdy': 'wednesday',
            'thrsdy': 'thursday',
            'frdy': 'friday',
            'stdy': 'saturday',
            'jnry': 'january',
            'fbrury': 'february',
            'mrch': 'march',
            'pril': 'april',
            'jly': 'july',
            'gust': 'august',
            'spmber': 'september',
            'ctber': 'october',
            'nvber': 'november',
            'dcber': 'december',
            'shud': 'should',
            'wud': 'would',
            'cud': 'could',
            'dat': 'that',
            'dis': 'this',
            'wit': 'with',
            'frm': 'from',
            'msg': 'message',
            'pls': 'please',
            'plz': 'please',
            'bc': 'because',
            'bcoz': 'because',
            'coz': 'because',
            'probly': 'probably',
            'prolly': 'probably',
            'def': 'definitely',
            'hwo': 'who',
            'taht': 'that',
            'nto': 'not',
            'nto': 'not',
            'adn': 'and',
            'nad': 'and',
            'hte': 'the',
            'fo': 'of',
            'ot': 'to',
            'wiht': 'with',
            'fro': 'for',
            'taht': 'that',
            'htis': 'this',
            'thsi': 'this',
            'teh': 'the',
            'adn': 'and',
            'nad': 'and',
            'nto': 'not',
            'aer': 'are',
            'wasn': 'wasn\'t',
            'jsut': 'just',
            'mroe': 'more',
            'thn': 'then',
            'thna': 'than',
            'yea': 'yes',
            'yeas': 'yes',
            'yaer': 'year',
            'yaers': 'years',
            'noe': 'one',
            'owrk': 'work',
            'jbo': 'job',
            'tijme': 'time',
            'tiem': 'time',
            'maek': 'make',
            'makse': 'makes',
            'makde': 'made',
            'taek': 'take',
            'tkae': 'take',
            'took': 'took',
            'tke': 'the',
            'te': 'the',
            'realy': 'really',
            'reall': 'really',
            'relaly': 'really',
            'tel': 'tell',
            'tell': 'tell',
            'tlel': 'tell',
            'aslo': 'also',
            'alos': 'also',
            'jus': 'just',
            'jsut': 'just',
            'jstu': 'just',
            'wats': 'what',
            'whta': 'what',
            'hwat': 'what',
            'wiht': 'with',
            'wtih': 'with',
            'whats': "what's",
            'doesnt': "doesn't",
            'wont': "won't",
            'dont': "don't",
            'cant': "can't",
            'isnt': "isn't",
            'wasnt': "wasn't",
            'arent': "aren't",
            'havent': "haven't",
            'didnt': "didn't",
            'couldnt': "couldn't",
            'shouldnt': "shouldn't",
            'wouldnt': "wouldn't",
            'hasnt': "hasn't",
            'thats': "that's",
            'whos': "who's",
            'hows': "how's",
            'theres': "there's",
            'youll': "you'll",
            'theyll': "they'll",
            'ill': "i'll",
            'hell': "he'll",
            'shell': "she'll",
            'youve': "you've",
            'theyve': "they've",
            'ive': "i've",
            'youre': "you're",
            'theyre': "they're",
            'were': "we're",
        }

    def _build_typo_dictionary(self):
        return {
            'frend': 'friend',
            'freind': 'friend',
            'becuase': 'because',
            'becasue': 'because',
            'definately': 'definitely',
            'definatly': 'definitely',
            'occurence': 'occurrence',
            'recieve': 'receive',
            'seperate': 'separate',
            'untill': 'until',
            'accross': 'across',
            'beleive': 'believe',
            'goverment': 'government',
            'independant': 'independent',
            'maintainence': 'maintenance',
            'neccessary': 'necessary',
            'occassion': 'occasion',
            'persistant': 'persistent',
            'publically': 'publicly',
            'realy': 'really',
            'refrence': 'reference',
            'relevent': 'relevant',
            'restaraunt': 'restaurant',
            'surprize': 'surprise',
            'thier': 'their',
            'truely': 'truly',
            'wierd': 'weird',
        }

    def _load_intent_data(self):
        data_path = os.path.join(os.path.dirname(__file__), 'data', 'intents.json')
        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                return json.load(f)
        return self._create_default_intents()

    def _build_spell_dictionary(self):
        common_words = {
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
            'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
            'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
            'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
            'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
            'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
            'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
            'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
            'give', 'day', 'most', 'us', 'is', 'am', 'are', 'was', 'were',
            'been', 'being', 'has', 'had', 'did', 'does', 'doing', 'done',
            'should', 'may', 'might', 'must', 'shall', 'need', 'trying',
            'where', 'while', 'each', 'find', 'here', 'thing', 'many', 'well',
            'those', 'very', 'much', 'still', 'too', 'really', 'sure', 'thing',
            'help', 'please', 'thanks', 'thank', 'hello', 'hi', 'hey',
            'great', 'awesome', 'nice', 'cool', 'good', 'perfect', 'excellent',
            'wonderful', 'fantastic', 'brilliant', 'superb', 'amazing', 'love',
            'best', 'happy', 'glad', 'okay', 'yes', 'yeah', 'yep', 'no', 'nah',
            'right', 'correct', 'exactly', 'absolutely', 'definitely', 'ofcourse',
            'actually', 'basically', 'literally', 'probably', 'maybe', 'perhaps',
            'something', 'anything', 'everything', 'nothing', 'someone', 'anyone',
            'everyone', 'nowhere', 'somewhere', 'everywhere', 'sometime', 'always',
            'never', 'sometimes', 'often', 'usually', 'already', 'still', 'yet',
            'soon', 'ago', 'before', 'after', 'during', 'until', 'since',
            'between', 'through', 'along', 'across', 'around', 'below', 'above',
            'under', 'over', 'inside', 'outside', 'near', 'far', 'left', 'right',
            'next', 'last', 'first', 'second', 'third', 'fourth', 'fifth',
            'why', 'how', 'what', 'when', 'where', 'which', 'who', 'whom',
            'whose', 'that', 'this', 'these', 'those', 'want', 'need', 'like',
            'trying', 'try', 'trying', 'wanna', 'gonna', 'gotta', 'kinda',
            'sorta', 'dunno', 'lemme', 'gimme', 'dont', "don't", 'cant',
            "can't", 'wont', "won't", 'didnt', "didn't", 'isnt', "isn't",
            'wasnt', "wasn't", 'arent', "aren't", 'havent', "haven't",
            'hasnt', "hasn't", 'wouldnt', "wouldn't", 'couldnt', "couldn't",
            'shouldnt', "shouldn't", 'thats', "that's", 'whats', "what's",
            'youre', "you're", 'hes', "he's", 'shes', "she's", 'its', "it's",
            'weve', "we've", 'theyve', "they've", 'ive', "i've", 'youve',
            "you've", 'youll', "you'll", 'hell', "he'll", 'shell', "she'll",
            'well', "we'll", 'theyll', "they'll", 'ill', "i'll", 'youve',
            "you've", 'id', "i'd", 'hed', "he'd", 'shed', "she'd", 'wed',
            "we'd", 'theyd', "they'd", 'youre', "you're",
            'lot', 'old', 'put', 'run', 'ask', 'men', 'ran', 'saw', 'ten',
            'top', 'hot', 'red', 'big', 'own', 'raw', 'fit', 'hit', 'sit',
            'bit', 'cut', 'let', 'met', 'nor', 'sat', 'sin', 'six', 'sun',
            'tea', 'van', 'war', 'win', 'zoo', 'dog', 'cat', 'map', 'oil',
            'pin', 'rug', 'sky', 'toy', 'bus', 'cup', 'dry', 'fat', 'ice',
            'jam', 'key', 'log', 'mud', 'nap', 'owl', 'pig', 'ski', 'tar',
            'urn', 'vat', 'wax', 'yam', 'zip', 'ago', 'few', 'set', 'try',
            'may', 'got', 'end', 'far', 'off', 'air', 'bed', 'box', 'eye',
            'arm', 'ear', 'leg', 'fun', 'gun', 'hat', 'job', 'kid', 'law',
            'lip', 'mom', 'mom', 'nor', 'odd', 'pal', 'pig', 'pop', 'pot',
            'row', 'sad', 'son', 'tie', 'tip', 'toe', 'toy', 'url', 'via',
            'web', 'won', 'yard', 'yeah', 'yep', 'yup', 'nah', 'duh', 'umm',
            'umm', 'hmm', 'meh', 'mhm', 'ohh', 'ops', 'pff', 'ugh', 'zzz',
            'afk', 'brb', 'irl', 'js', 'lmk', 'nvm', 'ofc', 'omw', 'rn',
            'smh', 'tbh', 'ty', 'tyvm', 'np', 'gg', 'gl', 'hf', 'wp',
            'ggwp', 're', 'fw', 'fyi', 'ps', 'aka', 'diy', 'faq', 'http',
            'https', 'www', 'com', 'org', 'net', 'io', 'app', 'dev',
            'car', 'jar', 'bar', 'mar', 'scar', 'czar', 'oar', 'sir', 'stir',
            'blur', 'cur', 'fur', 'spur', 'burr', 'cure', 'pure', 'tour',
            'pour', 'sour', 'four', 'hour', 'colour', 'glamour',
            'ball', 'fall', 'hall', 'mall', 'tall', 'wall', 'bell', 'bill',
            'bull', 'dull', 'full', 'gull', 'hull', 'kill', 'mill', 'pill',
            'sell', 'till', 'well', 'yell', 'fill', 'hill', 'still',
            'date', 'fate', 'gate', 'hate', 'late', 'mate', 'rate',
            'bake', 'cake', 'lake', 'make', 'rake', 'sake', 'take', 'wake',
            'base', 'case', 'ease', 'lace', 'mace', 'pace', 'race',
            'bite', 'kite', 'mite', 'site', 'quite', 'white', 'write',
            'boat', 'coat', 'goat', 'moat', 'note', 'tote', 'vote',
            'bone', 'cone', 'done', 'gone', 'hone', 'loan', 'none', 'phone', 'tone',
            'brake', 'drake', 'fake', 'quake', 'shake', 'snake', 'stake',
            'bright', 'fright', 'knight', 'light', 'might', 'night', 'right', 'sight', 'tight',
            'bring', 'king', 'ring', 'sing', 'string', 'swing', 'thing', 'wing',
            'brown', 'clown', 'crown', 'down', 'frown', 'town',
            'chain', 'grain', 'lain', 'main', 'pain', 'plain', 'rain', 'train',
            'chair', 'fair', 'hair', 'lair', 'pair', 'stair',
            'chat', 'flat', 'mat', 'pat', 'rat', 'slat',
            'check', 'deck', 'heck', 'neck', 'peck', 'speck', 'wreck',
            'chip', 'dip', 'hip', 'nip', 'quip', 'rip', 'sip', 'zip',
            'chop', 'crop', 'drop', 'flop', 'hop', 'lop', 'mop', 'pop', 'shop', 'stop', 'top',
            'clam', 'dam', 'ham', 'jam', 'ram', 'yam',
            'clap', 'cap', 'gap', 'lap', 'map', 'nap', 'rap', 'sap', 'tap', 'wrap',
            'clay', 'day', 'gay', 'hay', 'jay', 'lay', 'may', 'pay', 'ray', 'say', 'way',
            'clue', 'blue', 'cue', 'due', 'flue', 'glue', 'hue', 'sue', 'true',
            'cool', 'fool', 'pool', 'tool', 'stool',
            'cope', 'hope', 'lope', 'mope', 'nope', 'rope', 'scope', 'slope', 'tape',
            'core', 'bore', 'fore', 'gore', 'lore', 'more', 'ore', 'pore', 'sore', 'shore', 'store',
            'couch', 'ouch', 'pouch', 'vouch',
            'count', 'fount', 'mount', 'round', 'sound', 'wound',
            'crane', 'grain', 'plain', 'rain', 'slain', 'train',
            'crash', 'brash', 'clash', 'flash', 'gash', 'lash', 'mash', 'rash', 'slash', 'splash', 'stash', 'trash',
            'crate', 'slate', 'state',
            'cream', 'beam', 'dream', 'gleam', 'seam', 'stream', 'team',
            'crest', 'best', 'chest', 'guest', 'jest', 'nest', 'pest', 'rest', 'test', 'vest', 'west', 'zest',
            'cross', 'boss', 'floss', 'gloss', 'loss', 'moss', 'toss',
            'crow', 'blow', 'flow', 'glow', 'know', 'low', 'mow', 'plow', 'show', 'slow', 'snow', 'stow', 'throw',
            'cure', 'lure', 'pure', 'sure', 'tour',
            'dale', 'bale', 'fail', 'hail', 'jail', 'kale', 'male', 'pale', 'sale', 'tale', 'vale',
            'damp', 'camp', 'clamp', 'cramp', 'ramp', 'stamp', 'tramp',
            'dare', 'bare', 'care', 'fare', 'hare', 'mare', 'rare', 'scare', 'share', 'spare', 'stare',
            'dark', 'bark', 'lark', 'mark', 'park', 'shark', 'spark', 'stark',
            'dawn', 'bawn', 'fawn', 'lawn', 'pawn', 'sawn', 'yawn',
            'deal', 'heal', 'meal', 'peal', 'real', 'seal', 'steal', 'teal', 'veal', 'weal', 'zeal',
            'dear', 'bear', 'clear', 'fear', 'gear', 'hear', 'near', 'pear', 'rear', 'sear', 'shear', 'spear', 'tear', 'wear', 'year',
            'deep', 'beep', 'creep', 'heap', 'keep', 'peep', 'reap', 'seep', 'sheep', 'sleep', 'steep', 'sweep', 'weep',
            'deer', 'beer', 'cheer', 'peer', 'steer', 'veer',
            'dial', 'bail', 'fail', 'hail', 'jail', 'mail', 'nail', 'pail', 'rail', 'sail', 'tail', 'wail',
            'dice', 'lice', 'mice', 'nice', 'rice', 'slice', 'spice', 'twice', 'vice', 'voice',
            'dime', 'chime', 'crime', 'lime', 'mime', 'prime', 'rhyme', 'slime', 'time',
            'dine', 'fine', 'line', 'mine', 'nine', 'pine', 'shine', 'sign', 'vine', 'wine',
            'dire', 'fire', 'hire', 'lyre', 'mire', 'shire', 'sire', 'tire', 'wire',
            'dish', 'fish', 'wish',
            'dock', 'block', 'clock', 'flock', 'knock', 'lock', 'mock', 'rock', 'shock', 'sock', 'stock',
            'dome', 'come', 'home', 'some', 'roam',
            'door', 'boor', 'floor', 'moor', 'poor', 'roar', 'soar',
            'dose', 'chose', 'close', 'doze', 'hose', 'nose', 'pose', 'prose', 'rose',
            'down', 'brown', 'clown', 'crown', 'frown',
            'draw', 'brawl', 'crawl', 'drawl', 'shawl', 'squall',
            'drip', 'clip', 'crip', 'grip', 'quip', 'ship', 'skip', 'slip', 'strip', 'trip', 'whip',
            'drop', 'prop',
            'drum', 'crum', 'grum', 'plum', 'slum', 'strum',
            'dual', 'actual', 'casual', 'duel', 'gradual', 'manual', 'mutual',
            'dump', 'bump', 'chump', 'clump', 'frump', 'grump', 'hump', 'lump', 'plump', 'rump', 'slump', 'stump', 'swamp', 'thump', 'trump',
            'dune', 'moon', 'noon', 'soon', 'spoon', 'swoon', 'tune',
            'dunk', 'bunk', 'chunk', 'clunk', 'drunk', 'flunk', 'hunk', 'junk', 'punk', 'shrink', 'skunk', 'slunk', 'shrunk', 'sunk', 'trunk',
            'dusk', 'busk', 'husk', 'musk', 'risk', 'task',
            'dust', 'bust', 'crust', 'gust', 'just', 'lust', 'must', 'rust', 'trust',
            'ear', 'bear', 'clear', 'dear', 'fear', 'gear', 'hear', 'near', 'pear', 'rear', 'sear', 'shear', 'spear', 'tear', 'wear', 'year',
            'east', 'beast', 'feast', 'least', 'yeast',
            'face', 'brace', 'grace', 'lace', 'mace', 'pace', 'race', 'space', 'trace',
            'fade', 'bade', 'jade', 'lade', 'made', 'shade', 'trade',
            'fail', 'bail', 'dail', 'gail', 'hail', 'jail', 'kail', 'mail', 'nail', 'pail', 'rail', 'sail', 'tail', 'wail',
            'fair', 'hair', 'lair', 'pair', 'stair', 'tair',
            'fake', 'bake', 'cake', 'lake', 'make', 'quake', 'rake', 'shake', 'snake', 'stake', 'take', 'wake',
            'fame', 'blame', 'came', 'flame', 'name', 'same', 'tame',
            'fan', 'ban', 'can', 'dan', 'man', 'pan', 'ran', 'tan', 'van',
            'fare', 'bare', 'care', 'dare', 'hare', 'mare', 'rare', 'scare', 'share', 'spare', 'stare', 'ware', 'wear',
            'farm', 'balm', 'calm', 'charm', 'darm', 'harm', 'psalm', 'swarm',
            'fast', 'blast', 'cast', 'last', 'mast', 'past', 'vast',
            'fate', 'bait', 'date', 'gate', 'hate', 'late', 'mate', 'pate', 'rate',
            'fawn', 'bawn', 'dawn', 'lawn', 'pawn', 'sawn', 'yawn',
            'fear', 'bear', 'clear', 'dear', 'gear', 'hear', 'near', 'pear', 'rear', 'sear', 'shear', 'spear', 'tear', 'wear', 'year',
            'feel', 'heel', 'kneel', 'peel', 'reel', 'steel', 'wheel',
            'fell', 'bell', 'cell', 'dell', 'hell', 'jell', 'sell', 'tell', 'well', 'yell',
            'fence', 'bence', 'dense', 'hence', 'pence', 'sense', 'tense', 'wince',
            'fern', 'burn', 'earn', 'fern', 'learn', 'turn',
            'fest', 'best', 'chest', 'crest', 'guest', 'jest', 'nest', 'pest', 'rest', 'test', 'vest', 'west', 'zest',
            'feud', 'blew', 'brew', 'chew', 'crew', 'drew', 'flew', 'grew', 'jew', 'knew', 'new', 'screw', 'shew', 'slew', 'stew', 'threw', 'view',
            'file', 'bile', 'mile', 'pile', 'sile', 'tile', 'while',
            'fill', 'bill', 'dill', 'gill', 'hill', 'jill', 'kill', 'mill', 'pill', 'sill', 'till', 'will',
            'film', 'flim',
            'find', 'bind', 'hind', 'kind', 'mind', 'rind', 'wind',
            'fine', 'bine', 'dine', 'line', 'mine', 'nine', 'pine', 'rine', 'shine', 'sign', 'thin', 'vine', 'wine',
            'fire', 'dire', 'hire', 'lyre', 'mire', 'shire', 'sire', 'tire', 'wire',
            'firm', 'birm', 'dorm', 'form', 'horm', 'norm', 'storm', 'swarm', 'warm', 'worm',
            'fish', 'dish', 'wish',
            'fit', 'bit', 'hit', 'kit', 'lit', 'pit', 'sit', 'wit',
            'five', 'dive', 'hive', 'jive', 'live', 'rive', 'strive', 'thrive',
            'flag', 'brag', 'drag', 'gag', 'hag', 'nag', 'rag', 'sag', 'stag', 'swag', 'tag', 'wag', 'zig',
            'flair', 'blair', 'chair', 'fair', 'hair', 'lair', 'pair', 'stair',
            'flame', 'blame', 'came', 'fame', 'name', 'same', 'tame',
            'flap', 'blap', 'clap', 'crap', 'flap', 'gap', 'lap', 'nap', 'rap', 'sap', 'snap', 'trap', 'wrap',
            'flat', 'chat', 'hat', 'mat', 'pat', 'rat', 'sat', 'slat', 'that',
            'flaw', 'claw', 'draw', 'gnaw', 'jaw', 'law', 'maw', 'paw', 'raw', 'saw', 'slaw', 'straw',
            'flee', 'bee', 'free', 'glee', 'knee', 'lee', 'pee', 'see', 'spree', 'tea', 'tree',
            'flesh', 'cresh', 'fresh', 'mesh', 'RESH', 'thresh',
            'flew', 'blew', 'brew', 'chew', 'crew', 'drew', 'grew', 'jew', 'knew', 'new', 'screw', 'shew', 'slew', 'stew', 'threw', 'view',
            'flip', 'blip', 'chip', 'clip', 'crip', 'dip', 'grip', 'hip', 'nip', 'quip', 'rip', 'ship', 'sip', 'skip', 'slip', 'strip', 'trip', 'whip', 'zip',
            'flock', 'block', 'clock', 'dock', 'knock', 'lock', 'mock', 'rock', 'shock', 'sock', 'stock',
            'flood', 'blood', 'flood', 'good', 'hood', 'mood', 'stood', 'wood',
            'floor', 'boor', 'door', 'moor', 'poor',
            'flow', 'blow', 'crow', 'glow', 'know', 'low', 'mow', 'plow', 'show', 'slow', 'snow', 'stow', 'throw',
            'foam', 'doam', 'loam', 'roam',
            'foil', 'boil', 'coil', 'moil', 'soil', 'toil',
            'fold', 'bold', 'cold', 'gold', 'hold', 'mold', 'old', 'sold', 'told',
            'fond', 'bond', 'cond', 'pond', 'wand',
            'font', 'bont', 'hunt', 'mont', 'pont', 'wont',
            'food', 'good', 'hood', 'mood', 'stood', 'wood',
            'fool', 'cool', 'pool', 'tool', 'stool',
            'foot', 'boot', 'hoot', 'loot', 'moot', 'root', 'soot', 'toot',
            'for', 'cor', 'nor', 'sor',
            'ford', 'cord', 'lord', 'word',
            'fore', 'bore', 'core', 'gore', 'lore', 'more', 'ore', 'pore', 'sore', 'shore', 'store',
            'fork', 'cork', 'dork', 'fork', 'pork', 'work',
            'form', 'barm', 'dorm', 'firm', 'horm', 'norm', 'storm', 'swarm', 'warm', 'worm',
            'fort', 'bort', 'court', 'fort', 'port', 'short', 'sort', 'sport', 'tort', 'wart',
            'foul', 'coul', 'soul',
            'four', 'bour', 'hour', 'pour', 'sour', 'tour',
            'frame', 'blame', 'came', 'dame', 'fame', 'game', 'lame', 'name', 'same', 'shame', 'tame',
            'fray', 'bray', 'clay', 'day', 'gay', 'gray', 'hay', 'jay', 'lay', 'may', 'pay', 'pray', 'ray', 'say', 'slay', 'spray', 'sway', 'way',
            'free', 'bee', 'flee', 'glee', 'knee', 'lee', 'pee', 'see', 'spree', 'tea', 'tree',
            'fresh', 'cresh', 'flesh', 'mesh', 'RESH', 'thresh',
            'fried', 'bride', 'chide', 'guide', 'hide', 'ride', 'side', 'slide', 'stride', 'tide', 'wide',
            'frog', 'blog', 'clog', 'dog', 'fog', 'hog', 'jog', 'log', 'sog',
            'from', 'drom', 'gnom',
            'front', 'brunt', 'grunt', 'hunt', 'punt', 'run', 'shunt', 'stunt',
            'frown', 'brown', 'clown', 'crown', 'down', 'town',
            'fuel', 'dual', 'muel',
            'full', 'bull', 'cull', 'dull', 'gull', 'hull', 'mull', 'null', 'pull', 'skull',
            'fume', 'bume', 'cume', 'dume', 'hume', 'lume', 'mume', 'tume',
            'fund', 'bund', 'fund', 'hund', 'lund', 'mund',
            'furl', 'burl', 'curl', 'hurl', 'pearl', 'surl',
            'fuse', 'buse', 'duse', 'fuse', 'huse', 'muse', 'nuse', 'ruse', 'souse',
            'fuzz', 'buzz', 'fuzz', 'muzz',
        }

        skillify_terms = {
            'skillify', 'freelancer', 'freelance', 'freelancing', 'client',
            'clients', 'proposal', 'proposals', 'bid', 'bids', 'contract',
            'contracts', 'milestone', 'milestones', 'escrow', 'payment',
            'payments', 'profile', 'portfolio', 'skill', 'skills', 'badge',
            'badges', 'assessment', 'verification', 'verified', 'dispute',
            'disputes', 'mediation', 'review', 'reviews', 'rating', 'ratings',
            'hiring', 'hired', 'talent', 'expert', 'professional', 'professionals',
            'job', 'jobs', 'project', 'projects', 'listing', 'listings',
            'dashboard', 'inbox', 'messaging', 'notification', 'notifications',
            'membership', 'premium', 'subscription', 'pricing', 'commission',
            'fee', 'fees', 'withdraw', 'withdrawal', 'earnings', 'wallet',
            'balance', 'payout', 'bank', 'transfer', 'paypal', 'revenue',
            'income', 'salary', 'wage', 'wages', 'budget', 'cost', 'price',
            'charge', 'pay', 'paid', 'billing', 'invoice', 'invoices',
            'developer', 'designer', 'writer', 'coder', 'programmer',
            'engineer', 'architect', 'analyst', 'consultant', 'manager',
            'specialist', 'expert', 'guru', 'ninja', 'rockstar', 'pro',
            'junior', 'senior', 'lead', 'head', 'chief', 'director',
            'hourly', 'fixed', 'price', 'rate', 'rates', '报价', '报价',
            'deadline', 'timelines', 'deliverable', 'deliverables', 'scope',
            'requirements', 'specifications', 'brief', 'summary', 'description',
            'bio', 'resume', 'cv', 'work', 'experience', 'portfolio',
            'samples', 'examples', 'showcase', 'demonstrate', 'highlight',
            'show', 'display', 'present', 'feature', 'include', 'add',
            'update', 'edit', 'modify', 'change', 'delete', 'remove',
            'create', 'make', 'build', 'develop', 'design', 'write',
            'compose', 'draft', 'prepare', 'submit', 'send', 'post',
            'publish', 'share', 'send', 'receive', 'accept', 'reject',
            'approve', 'decline', 'cancel', 'close', 'end', 'complete',
            'finish', 'start', 'begin', 'initiate', 'launch', 'kickoff',
            'search', 'browse', 'filter', 'sort', 'sortby', 'sort_by',
            'find', 'look', 'discover', 'explore', 'navigate', 'browse',
            'view', 'see', 'check', 'monitor', 'track', 'manage', 'handle',
            'configure', 'setup', 'set', 'setting', 'settings', 'option',
            'options', 'preference', 'preferences', 'account', 'user',
            'password', 'email', 'phone', 'name', 'address', 'location',
            'country', 'city', 'state', 'zip', 'code', 'language', 'timezone',
            'online', 'offline', 'available', 'unavailable', 'busy', 'away',
            'active', 'inactive', 'pending', 'approved', 'rejected', 'closed',
            'open', 'public', 'private', 'blocked', 'unblocked', 'reported',
            'flagged', 'verified', 'unverified', 'trusted', 'reliable',
            'quality', 'excellent', 'good', 'average', 'poor', 'bad',
            'rating', 'star', 'stars', 'five', 'four', 'three', 'two', 'one',
            'percent', 'percentage', 'half', 'quarter', 'third', 'fraction',
            'low', 'medium', 'high', 'minimum', 'maximum', 'average', 'total',
            'sum', 'amount', 'number', 'count', 'total', 'overall', 'net',
            'gross', 'profit', 'loss', 'earnings', 'revenue', 'income',
            'expense', 'cost', 'spend', 'invest', 'return', 'roi',
            'daily', 'weekly', 'monthly', 'yearly', 'annual', 'quarterly',
            'today', 'yesterday', 'tomorrow', 'week', 'month', 'year',
            'hour', 'minute', 'second', 'morning', 'afternoon', 'evening',
            'night', 'midnight', 'noon', 'dawn', 'dusk', 'sunset', 'sunrise',
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
            'sunday', 'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        }

        domain_words = set()
        for intent_data in self.intent_data.values():
            for pattern in intent_data.get('patterns', []):
                for word in pattern.lower().split():
                    domain_words.add(word)

        all_words = common_words | skillify_terms | domain_words
        return all_words

    def _build_texting_slang(self):
        return {
            'brb': 'be right back',
            'ttyl': 'talk to you later',
            'lol': 'laughing out loud',
            'lmao': 'laughing my ass off',
            'rofl': 'rolling on the floor laughing',
            'omg': 'oh my god',
            'smh': 'shaking my head',
            'tbh': 'to be honest',
            'imo': 'in my opinion',
            'imho': 'in my humble opinion',
            'afaik': 'as far as i know',
            'btw': 'by the way',
            'fyi': 'for your information',
            'afaicr': 'as far as i can remember',
            'asap': 'as soon as possible',
            'diy': 'do it yourself',
            'ftw': 'for the win',
            'gg': 'good game',
            'glhf': 'good luck have fun',
            'hmu': 'hit me up',
            'idk': 'i do not know',
            'ig': 'i guess',
            'ikr': 'i know right',
            'ily': 'i love you',
            'ily2': 'i love you too',
            'np': 'no problem',
            'nvm': 'never mind',
            'ofc': 'of course',
            'omw': 'on my way',
            'rn': 'right now',
            'tbh': 'to be honest',
            'thx': 'thanks',
            'ty': 'thank you',
            'tyvm': 'thank you very much',
            'wbu': 'what about you',
            'w/': 'with',
            'w/o': 'without',
            'u': 'you',
            'ur': 'your',
            'y': 'why',
            'r': 'are',
            '2': 'to',
            '4': 'for',
            'b4': 'before',
            'gr8': 'great',
            'l8r': 'later',
            'pls': 'please',
            'plz': 'please',
            'ppl': 'people',
            'bc': 'because',
            'b/c': 'because',
            'jk': 'just kidding',
            'ngl': 'not gonna lie',
            'smth': 'something',
            'rly': 'really',
            'msg': 'message',
            'dm': 'direct message',
            'pm': 'private message',
            'pc': 'personal computer',
            'afk': 'away from keyboard',
            'brb': 'be right back',
            'cya': 'see you',
            'gtg': 'got to go',
            'idc': 'i do not care',
            'ily': 'i love you',
            'ilysm': 'i love you so much',
            'ikr': 'i know right',
            'omw': 'on my way',
            'wya': 'where are you at',
            'wyd': 'what are you doing',
            'haha': 'laughing',
            'hehe': 'laughing',
            'lol': 'laughing',
            'lmao': 'laughing hard',
            'rofl': 'laughing very hard',
            'ftw': 'for the win',
            'slay': 'do amazing',
            'no cap': 'no lie',
            'cap': 'lie',
            'sus': 'suspicious',
            'fire': 'amazing',
            'lit': 'exciting',
            'vibe': 'feeling',
            'vibes': 'feelings',
            'mood': 'feeling',
            'stan': 'support',
            'fam': 'family',
            'bestie': 'best friend',
            'bff': 'best friend forever',
            'lowkey': 'somewhat',
            'highkey': 'very much',
            'deadass': 'seriously',
            'bruh': 'friend',
            'oof': 'ouch',
            'yeet': 'throw',
            'sick': 'cool',
            'dope': 'cool',
            'whack': 'bad',
            'trash': 'bad',
            'clutch': 'impressive',
            'goat': 'greatest of all time',
            'simp': 'someone who tries too hard',
            'rent free': 'cannot stop thinking about',
            'living the dream': 'doing well',
            'big brain': 'smart',
            'smooth brain': 'silly',
            'touch grass': 'go outside',
            'main character': 'important',
            'npc': 'boring person',
            'ratio': 'disagreement',
            'W': 'win',
            'L': 'loss',
            'mid': 'mediocre',
            'based': 'agreeable',
            'cringe': 'embarrassing',
            'periodt': 'exactly',
            'slay': 'amazing',
            'iconic': 'legendary',
            'ate': 'did perfectly',
            'understood the assignment': 'did perfectly',
            'no notes': 'perfect',
            'it is giving': 'it seems like',
            'hits different': 'feels special',
            'living for': 'enjoying',
            'cant even': 'overwhelmed',
            'im dead': 'that is funny',
            'im screaming': 'that is hilarious',
            'dead': 'funny',
            'screaming': 'excited',
            'crying': 'emotional',
            'im crying': 'that is so emotional',
            'ngl': 'not going to lie',
            'fr': 'for real',
            'frr': 'for real',
            'frfr': 'for real for real',
            'on god': 'seriously',
            'no bs': 'no joking',
            'lowkey': 'kind of',
            'highkey': 'definitely',
            'soft launch': 'reveal slowly',
            'hard launch': 'reveal openly',
            'ick': 'turn off',
            'red flag': 'warning sign',
            'green flag': 'good sign',
            'delulu': 'delusional',
            'pick me': 'attention seeker',
            'gaslighting': 'manipulating',
            'main character energy': 'confident',
            'its not that deep': 'do not overthink',
            'say less': 'understood',
            'bet': 'agreed',
            'say less fam': 'understood friend',
            'bet': 'sure',
            'say less': 'got it',
            'facts': 'exactly',
            'real': 'agreed',
            'valid': 'acceptable',
            'mid': 'average',
            'mid': 'not great',
            'fire': 'excellent',
            'slaps': 'is great',
            'bussin': 'delicious',
            'no cap': 'seriously',
            'on god': 'swear',
            'sheesh': 'wow',
            'bussin': 'amazing',
            'ratio': 'wrong',
            'w take': 'good opinion',
            'l take': 'bad opinion',
            'down bad': 'very attracted',
            'down bad': 'desperate',
            'touch grass': 'go outside',
            'chronically online': 'too much internet',
            'brain rot': 'confused thinking',
            'skibidi': 'cool',
            'rizz': 'charisma',
            'gyatt': 'wow',
            'mewing': 'jawline exercise',
            'looksmaxxing': 'improving appearance',
            'fanum tax': 'taking food',
            'sigma': 'independent',
            'alpha': 'leader',
            'beta': 'follower',
            'cope': 'deal with it',
            'seethe': 'be angry',
            'mald': 'mad and bald',
            'kys': 'kill yourself',
            'gg ez': 'easy win',
            'diff': 'difference maker',
            'throw': 'play badly',
            'carry': 'lead the team',
            'clutch': 'save the game',
            'tilt': 'frustrated',
            'rage quit': 'quit angrily',
            'noob': 'new player',
            'pro': 'expert',
            'sweat': 'try hard',
            'bot': 'bad player',
            'cheese': 'cheap strategy',
            'nerf': 'make weaker',
            'buff': 'make stronger',
            'meta': 'most effective',
            'grind': 'work hard',
            'farm': 'collect resources',
            'aggro': 'aggressive',
            'dps': 'damage per second',
            'hp': 'health points',
            'mp': 'mana points',
            'xp': 'experience points',
            'afk': 'away from keyboard',
            'gg': 'good game',
            'gl hf': 'good luck have fun',
            'wp': 'well played',
            'ns': 'nice shot',
            'nt': 'nice try',
            'ez': 'easy',
            'rekt': 'destroyed',
            'pwned': 'dominated',
            'noob': 'newbie',
            'l33t': 'elite',
            'hax': 'hacks',
            'lag': 'delay',
            'ping': 'network delay',
            'fps': 'frames per second',
            'fov': 'field of view',
            'fov': 'field of view',
            'hud': 'heads up display',
            'npc': 'non player character',
            'ai': 'artificial intelligence',
            'irl': 'in real life',
            'goat': 'greatest of all time',
            'o7': 'salute',
            'uwu': 'cute face',
            'owo': 'surprised face',
            ':)': 'happy',
            ':(': 'sad',
            ':D': 'very happy',
            ';)': 'wink',
            ':/': 'confused',
            '<3': 'love',
            '</3': 'heartbreak',
            ':P': 'playful',
            'XD': 'laughing',
            ':O': 'surprised',
            ':|': 'neutral',
            '^^': 'happy',
            'T_T': 'crying',
            'TT': 'crying',
            'Q_Q': 'crying',
            'D:': 'shocked',
            ':3': 'cute',
            'UwU': 'cute',
            'OwO': 'surprised cute',
            ':^)': 'smug',
            '-_-': 'annoyed',
            '>_<': 'frustrated',
            '¯\\_(ツ)_/¯': 'shrug',
            '━': 'emphasis',
            '—': 'emphasis',
            '...': 'hesitation',
            '!!': 'excitement',
            '???': 'confusion',
            '?!': 'surprise',
            'haha': 'laughing',
            'hehe': 'giggling',
            'hihi': 'giggling',
            'hohoho': 'laughing',
            'muahaha': 'evil laugh',
            'bwahaha': 'laughing hard',
            'pfft': 'dismissive',
            'tsk': 'disapproval',
            'ugh': 'frustration',
            'meh': 'indifferent',
            'mhm': 'agreeing',
            'uhh': 'hesitating',
            'umm': 'thinking',
            'err': 'confused',
            'hmm': 'thinking',
            'hm': 'thinking',
            'oh': 'surprise',
            'wow': 'amazing',
            'yay': 'celebration',
            'woo': 'excitement',
            'oops': 'mistake',
            'ouch': 'pain',
            'oof': 'sympathy pain',
            'phew': 'relief',
            'yikes': 'concern',
            'eek': 'fear',
            'gasp': 'shock',
            'whew': 'relief',
            'sigh': 'tired',
            'grr': 'angry',
            'rawr': 'playful anger',
            'nom': 'eating',
            'yum': 'delicious',
            'bleh': 'disgust',
            'eww': 'disgust',
            'ew': 'disgust',
            'argh': 'frustration',
            'gah': 'frustration',
            'rah': 'anger',
            'shh': 'quiet',
            'psst': 'attention',
            'yo': 'greeting',
            'sup': 'what is up',
            'ayy': 'excited greeting',
            'ayyo': 'excited greeting',
            'bruh': 'disbelief',
            ' Bruh': 'disbelief',
            'nah': 'no',
            'nahh': 'no way',
            'nahh': 'nope',
            'yea': 'yes',
            'yess': 'yes!',
            'yesss': 'yes!!',
            'yessss': 'yes!!!',
            'noo': 'no!',
            'nooo': 'no!!',
            'noooo': 'no!!!',
            'yoo': 'hey!',
            'yooo': 'hey!!',
            'heyy': 'hey!',
            'heyyy': 'hey!!',
            'hellooo': 'hello!',
            'hii': 'hi!',
            'hiii': 'hi!!',
            'hiiii': 'hi!!!',
            'byee': 'bye!',
            'byeee': 'bye!!',
            'byeeee': 'bye!!!',
            'thxxx': 'thanks!',
            'thxxxx': 'thanks!!',
            'plss': 'please!',
            'plsss': 'please!!',
            'okk': 'ok!',
            'okkk': 'ok!!',
            'okkkk': 'ok!!!',
            'okkkkk': 'ok!!!!',
            'umm': 'um',
            'umm': 'umm',
            'err': 'err',
            'errr': 'errr',
            'errrr': 'errrr',
            'hmm': 'hmm',
            'hmmm': 'hmmm',
            'hmmmm': 'hmmmm',
            'hmmmmm': 'hmmmmm',
            'lol': 'laughing',
            'loll': 'laughing',
            'loool': 'laughing hard',
            'loool': 'laughing hard',
            'lmfao': 'dying laughing',
            'roflmao': 'on the floor laughing',
            'pfft': 'pfft',
            'tsk tsk': 'disapproval',
            'tut tut': 'disapproval',
            'ugh ugh': 'frustration',
            'meh meh': 'indifference',
            'hm hm': 'agreement',
            'mhm mhm': 'agreement',
            'uhh uhh': 'hesitation',
            'umm umm': 'thinking',
            'err err': 'confusion',
            'hmm hmm': 'thinking',
            'hm hm': 'thinking',
            'oh oh': 'surprise',
            'wow wow': 'amazing',
            'yay yay': 'celebration',
            'woo woo': 'excitement',
            'oops oops': 'mistake',
            'ouch ouch': 'pain',
            'oof oof': 'sympathy',
            'phew phew': 'relief',
            'yikes yikes': 'concern',
            'eek eek': 'fear',
            'gasp gasp': 'shock',
            'whew whew': 'relief',
            'sigh sigh': 'tired',
            'grr grr': 'angry',
            'rawr rawr': 'playful',
            'nom nom': 'eating',
            'yum yum': 'delicious',
            'bleh bleh': 'disgust',
            'eww eww': 'disgust',
            'argh argh': 'frustration',
            'gah gah': 'frustration',
            'rah rah': 'anger',
            'shh shh': 'quiet',
            'psst psst': 'attention',
            'yo yo': 'greeting',
            'sup sup': 'checking in',
            'ayy ayy': 'excitement',
            'bruh bruh': 'disbelief',
        }

    def _build_emoji_sentiment(self):
        return {
            '\U0001f600': ('positive', 0.8),   # grinning face
            '\U0001f603': ('positive', 0.85),  # grinning face with big eyes
            '\U0001f604': ('positive', 0.8),   # grinning face with smiling eyes
            '\U0001f601': ('positive', 0.85),  # beaming face with smiling eyes
            '\U0001f602': ('positive', 0.9),   # face with tears of joy
            '\U0001f923': ('positive', 0.9),   # rolling on the floor laughing
            '\U0001f605': ('positive', 0.75),  # grinning face with sweat
            '\U0001f606': ('positive', 0.85),  # squinting face with tongue
            '\U0001f609': ('positive', 0.7),   # winking face
            '\U0001f60a': ('positive', 0.8),   # smiling face with smiling eyes
            '\U0001f60b': ('positive', 0.75),  # face savoring food
            '\U0001f60c': ('positive', 0.7),   # relieved face
            '\U0001f60d': ('positive', 0.85),  # heart eyes
            '\U0001f60e': ('positive', 0.75),  # smiling face with sunglasses
            '\U0001f60f': ('positive', 0.65),  # smirk
            '\U0001f612': ('negative', 0.4),   # unamused
            '\U0001f613': ('neutral', 0.5),    # downcast face with sweat
            '\U0001f614': ('neutral', 0.45),   # pensive
            '\U0001f616': ('neutral', 0.4),    # confused
            '\U0001f618': ('positive', 0.8),   # face blowing a kiss
            '\U0001f61c': ('positive', 0.7),   # winking face with tongue
            '\U0001f61d': ('positive', 0.75),  # squinting face with tongue
            '\U0001f61e': ('negative', 0.35),  # disappointed
            '\U0001f620': ('negative', 0.2),   # angry
            '\U0001f621': ('negative', 0.15),  # pouting
            '\U0001f622': ('negative', 0.3),   # crying
            '\U0001f623': ('negative', 0.35),  # persevering
            '\U0001f624': ('negative', 0.3),   # triumphant
            '\U0001f625': ('negative', 0.35),  # disappointed relieved
            '\U0001f628': ('negative', 0.25),  # fearful
            '\U0001f629': ('negative', 0.3),   # weary
            '\U0001f62a': ('negative', 0.35),  # sleepy
            '\U0001f62b': ('negative', 0.3),   # tired
            '\U0001f62d': ('negative', 0.2),   # loudly crying
            '\U0001f630': ('negative', 0.35),  # cold sweat
            '\U0001f631': ('negative', 0.3),   # screaming in fear
            '\U0001f632': ('neutral', 0.4),    # astonished
            '\U0001f633': ('positive', 0.7),   # flushed
            '\U0001f634': ('neutral', 0.4),    # sleeping
            '\U0001f635': ('neutral', 0.4),    # dizzy
            '\U0001f637': ('neutral', 0.45),   # face with medical mask
            '\U0001f911': ('positive', 0.7),   # money mouth
            '\U0001f912': ('neutral', 0.5),    # face with thermometer
            '\U0001f913': ('positive', 0.75),  # nerd face
            '\U0001f914': ('neutral', 0.5),    # thinking
            '\U0001f917': ('positive', 0.75),  # hugging face
            '\U0001f918': ('positive', 0.7),   # rock on
            '\U0001f919': ('positive', 0.75),  # call me
            '\U0001f91a': ('positive', 0.65),  # raised back of hand
            '\U0001f91b': ('positive', 0.7),   # left facing fist
            '\U0001f91c': ('positive', 0.7),   # right facing fist
            '\U0001f91d': ('positive', 0.8),   # handshake
            '\U0001f91e': ('positive', 0.75),  # crossed fingers
            '\U0001f91f': ('positive', 0.8),   # love you gesture
            '\U0001f920': ('positive', 0.75),  # cowboy
            '\U0001f921': ('positive', 0.7),   # clown
            '\U0001f923': ('positive', 0.9),   # rofl
            '\U0001f924': ('positive', 0.7),   # drooling
            '\U0001f925': ('positive', 0.65),  # lying face
            '\U0001f928': ('neutral', 0.5),    # face with raised eyebrow
            '\U0001f929': ('positive', 0.8),   # star struck
            '\U0001f92a': ('positive', 0.75),  # crazy face
            '\U0001f92b': ('positive', 0.7),   # shushing
            '\U0001f92c': ('negative', 0.25),  # symbols on mouth
            '\U0001f92d': ('positive', 0.7),   # hand over mouth
            '\U0001f92e': ('positive', 0.7),   # vomiting rainbow
            '\U0001f92f': ('positive', 0.8),   # exploding head
            '\U0001f970': ('positive', 0.85),  # smiling face with hearts
            '\U0001f973': ('positive', 0.8),   # partying face
            '\U0001f975': ('neutral', 0.45),   # hot face
            '\U0001f976': ('neutral', 0.45),   # cold face
            '\U0001f607': ('positive', 0.8),   # smiling face with halo
            '\U0001f608': ('negative', 0.3),   # smiling face with horns
            '\U0001f60f': ('positive', 0.6),   # smirk
            '\U0001f611': ('neutral', 0.4),    # expressionless
            '\U0001f615': ('neutral', 0.45),   # slightly frowning
            '\U0001f617': ('positive', 0.65),  # kissing smiling eyes
            '\U0001f619': ('positive', 0.7),   # kissing closed eyes
            '\U0001f61a': ('positive', 0.7),   # kissing face
            '\U0001f61b': ('positive', 0.7),   # face with tongue
            '\U0001f61f': ('neutral', 0.45),   # worried
            '\U0001f626': ('negative', 0.35),  # frowning with open mouth
            '\U0001f627': ('negative', 0.2),   # anguished
            '\U0001f62a': ('negative', 0.3),   # sleepy
            '\U0001f62c': ('positive', 0.65),  # grimacing
            '\U0001f62e': ('neutral', 0.5),    # open mouth
            '\U0001f62f': ('neutral', 0.45),   # hushed
            '\U0001f631': ('negative', 0.3),   # face screaming in fear
            '\U0001f636': ('neutral', 0.5),    # face without mouth
            '\U0001f638': ('positive', 0.7),   # grinning cat
            '\U0001f639': ('positive', 0.75),  # cat tears of joy
            '\U0001f63a': ('positive', 0.7),   # cat heart eyes
            '\U0001f63b': ('positive', 0.8),   # cat kissing
            '\U0001f63c': ('positive', 0.65),  # cat smirking
            '\U0001f63d': ('positive', 0.7),   # cat kissing smiling eyes
            '\U0001f63e': ('positive', 0.7),   # cat pouting
            '\U0001f63f': ('negative', 0.3),   # cat crying
            '\U0001f44a': ('positive', 0.6),   # oncoming fist
            '\U0001f44b': ('positive', 0.7),   # waving hand
            '\U0001f44c': ('positive', 0.75),  # OK hand
            '\U0001f44d': ('positive', 0.8),   # thumbs up
            '\U0001f44e': ('negative', 0.3),   # thumbs down
            '\U0001f44f': ('positive', 0.8),   # clapping
            '\U0001f450': ('positive', 0.7),   # open hands
            '\U0001f64c': ('positive', 0.8),   # raising hands
            '\U0001f64f': ('positive', 0.75),  # folded hands
            '\U0001f91a': ('positive', 0.65),  # raised back of hand
            '\U0001f91b': ('positive', 0.7),   # left facing fist
            '\U0001f91c': ('positive', 0.7),   # right facing fist
            '\u270a': ('positive', 0.7),        # raised fist
            '\u270b': ('positive', 0.7),        # raised hand
            '\u270c': ('positive', 0.7),        # victory hand
            '\U0001f440': ('positive', 0.6),   # eyes
            '\U0001f442': ('positive', 0.6),   # ear
            '\U0001f443': ('positive', 0.6),   # nose
            '\U0001f444': ('positive', 0.6),   # mouth
            '\U0001f445': ('positive', 0.65),  # tongue
            '\U0001f446': ('positive', 0.6),   # point up
            '\U0001f447': ('positive', 0.6),   # point down
            '\U0001f448': ('positive', 0.6),   # point left
            '\U0001f449': ('positive', 0.6),   # point right
            '\u261d': ('positive', 0.6),        # index pointing up
            '\U0001f446': ('positive', 0.6),   # white up pointing backhand
            '\U0001f447': ('positive', 0.6),   # white down pointing backhand
            '\U0001f448': ('positive', 0.6),   # white left pointing backhand
            '\U0001f449': ('positive', 0.6),   # white right pointing backhand
            '\u2764': ('positive', 0.9),        # red heart
            '\U0001f494': ('positive', 0.9),   # heart with arrow
            '\U0001f495': ('positive', 0.9),   # two hearts
            '\U0001f496': ('positive', 0.85),  # sparkling heart
            '\U0001f497': ('positive', 0.9),   # growing heart
            '\U0001f498': ('positive', 0.85),  # heart with ribbon
            '\U0001f499': ('positive', 0.85),  # blue heart
            '\U0001f49a': ('positive', 0.85),  # green heart
            '\U0001f49b': ('positive', 0.85),  # yellow heart
            '\U0001f49c': ('positive', 0.85),  # purple heart
            '\U0001f5a4': ('positive', 0.85),  # black heart
            '\U0001f90e': ('positive', 0.85),  # brown heart
            '\U0001f90d': ('positive', 0.85),  # white heart
            '\U0001f90f': ('positive', 0.85),  # pinched fingers
            '\u2764\ufe0f': ('positive', 0.9), # red heart (variation)
            '\U0001f48c': ('positive', 0.85),  # love letter
            '\U0001f494': ('positive', 0.9),   # broken heart
            '\U0001f495': ('positive', 0.9),   # two hearts
            '\U0001f493': ('positive', 0.85),  # beating heart
            '\U0001f497': ('positive', 0.9),   # growing heart
            '\U0001f498': ('positive', 0.85),  # heart with ribbon
            '\U0001f49d': ('positive', 0.9),   # heart with arrow
            '\U0001f49e': ('positive', 0.9),   # revolving hearts
            '\U0001f49f': ('positive', 0.85),  # heart decoration
            '\U0001f5a4': ('positive', 0.85),  # black heart
            '\U0001f90e': ('positive', 0.85),  # brown heart
            '\U0001f90d': ('positive', 0.85),  # white heart
            '\U0001f90f': ('positive', 0.85),  # pinched fingers
            '\u2764\ufe0f': ('positive', 0.9), # red heart
            '\U0001f48c': ('positive', 0.85),  # love letter
            '\U0001f494': ('positive', 0.9),   # broken heart
            '\U0001f495': ('positive', 0.9),   # two hearts
            '\U0001f493': ('positive', 0.85),  # beating heart
            '\U0001f497': ('positive', 0.9),   # growing heart
            '\U0001f498': ('positive', 0.85),  # heart with ribbon
            '\U0001f49d': ('positive', 0.9),   # heart with arrow
            '\U0001f49e': ('positive', 0.9),   # revolving hearts
            '\U0001f49f': ('positive', 0.85),  # heart decoration
            '\u2714': ('positive', 0.7),        # heavy check mark
            '\u2716': ('negative', 0.3),        # heavy multiplication x
            '\u2705': ('positive', 0.8),        # check mark button
            '\u274c': ('negative', 0.3),        # cross mark
            '\u274e': ('negative', 0.3),        # cross mark button
            '\u203c': ('positive', 0.7),        # double exclamation
            '\u2049': ('positive', 0.65),       # exclamation question
            '\u2757': ('positive', 0.7),        # exclamation
            '\u2753': ('neutral', 0.5),         # question mark
            '\u2754': ('neutral', 0.5),         # white question mark
            '\u2755': ('neutral', 0.5),         # white exclamation
            '\u2756': ('neutral', 0.5),         # black diamond exclamation
            '\U0001f389': ('positive', 0.9),   # party popper
            '\U0001f38a': ('positive', 0.85),  # confetti ball
            '\U0001f381': ('positive', 0.85),  # wrapped gift
            '\U0001f382': ('positive', 0.9),   # birthday cake
            '\U0001f388': ('positive', 0.85),  # balloon
            '\U0001f383': ('positive', 0.8),   # jack o lantern
            '\U0001f384': ('positive', 0.85),  # christmas tree
            '\U0001f385': ('positive', 0.85),  # santa claus
            '\U0001f386': ('positive', 0.85),  # fireworks
            '\U0001f387': ('positive', 0.85),  # sparkler
            '\U0001f388': ('positive', 0.85),  # balloon
            '\U0001f389': ('positive', 0.9),   # party popper
            '\U0001f38a': ('positive', 0.85),  # confetti ball
            '\U0001f3b5': ('positive', 0.7),   # musical note
            '\U0001f3b6': ('positive', 0.75),  # musical notes
            '\U0001f4af': ('positive', 0.8),   # 100
            '\U0001f525': ('positive', 0.85),  # fire
            '\U0001f680': ('positive', 0.85),  # rocket
            '\U0001f31f': ('positive', 0.85),  # glowing star
            '\u2b50': ('positive', 0.8),        # star
            '\U0001f308': ('positive', 0.8),   # rainbow
            '\U0001f33b': ('positive', 0.7),   # sunflower
            '\U0001f33a': ('positive', 0.7),   # hibiscus
            '\U0001f339': ('positive', 0.75),  # rose
            '\U0001f338': ('positive', 0.75),  # cherry blossom
            '\U0001f337': ('positive', 0.7),   # tulip
            '\U0001f33b': ('positive', 0.7),   # sunflower
            '\U0001f33a': ('positive', 0.7),   # hibiscus
            '\U0001f339': ('positive', 0.75),  # rose
            '\U0001f338': ('positive', 0.75),  # cherry blossom
            '\U0001f337': ('positive', 0.7),   # tulip
            '\U0001f4ab': ('positive', 0.7),   # dizzy
            '\U0001f4a5': ('negative', 0.3),   # collision
            '\U0001f4a6': ('negative', 0.35),  # sweat droplets
            '\U0001f4a7': ('negative', 0.4),   # droplet
            '\U0001f4a8': ('positive', 0.6),   # dash
            '\U0001f4a9': ('negative', 0.3),   # pile of poo
            '\U0001f4aa': ('positive', 0.75),  # flexed biceps
            '\U0001f4ab': ('positive', 0.7),   # dizzy
            '\U0001f4ac': ('positive', 0.6),   # speech balloon
            '\U0001f4ad': ('positive', 0.6),   # thought balloon
            '\U0001f4ae': ('positive', 0.65),  # white flower
            '\U0001f4af': ('positive', 0.8),   # 100
            '\U0001f4b0': ('positive', 0.7),   # money bag
            '\U0001f4b1': ('positive', 0.65),  # currency exchange
            '\U0001f4b2': ('positive', 0.7),   # heavy dollar sign
            '\U0001f4b3': ('positive', 0.65),  # dollar banknote
            '\U0001f4b4': ('positive', 0.65),  # yen banknote
            '\U0001f4b5': ('positive', 0.65),  # dollar banknote
            '\U0001f4b6': ('positive', 0.65),  # euro banknote
            '\U0001f4b7': ('positive', 0.65),  # pound banknote
            '\U0001f4b8': ('positive', 0.7),   # money with wings
            '\U0001f4b9': ('positive', 0.7),   # chart increasing
            '\U0001f4ba': ('positive', 0.65),  # seat
            '\U0001f4bb': ('positive', 0.7),   # laptop
            '\U0001f4bc': ('positive', 0.65),  # briefcase
            '\U0001f4bd': ('positive', 0.65),  # minidisc
            '\U0001f4be': ('positive', 0.65),  # floppy disk
            '\U0001f4bf': ('positive', 0.7),   # optical disc
            '\U0001f4c0': ('positive', 0.7),   # dvd
            '\U0001f4c1': ('positive', 0.65),  # file folder
            '\U0001f4c2': ('positive', 0.65),  # open file folder
            '\U0001f4c3': ('positive', 0.65),  # page with curl
            '\U0001f4c4': ('positive', 0.65),  # page facing up
            '\U0001f4c5': ('positive', 0.65),  # calendar
            '\U0001f4c6': ('positive', 0.65),  # tear off calendar
            '\U0001f4c7': ('positive', 0.65),  # card index
            '\U0001f4c8': ('positive', 0.7),   # chart increasing
            '\U0001f4c9': ('positive', 0.65),  # chart decreasing
            '\U0001f4ca': ('positive', 0.7),   # bar chart
            '\U0001f4cb': ('positive', 0.65),  # clipboard
            '\U0001f4cc': ('positive', 0.65),  # pushpin
            '\U0001f4cd': ('positive', 0.65),  # round pushpin
            '\U0001f4ce': ('positive', 0.65),  # paperclip
            '\U0001f4cf': ('positive', 0.65),  # straight ruler
            '\U0001f4d0': ('positive', 0.65),  # triangular ruler
            '\U0001f4d1': ('positive', 0.65),  # bookmark tabs
            '\U0001f4d2': ('positive', 0.65),  # green book
            '\U0001f4d3': ('positive', 0.65),  # notebook
            '\U0001f4d4': ('positive', 0.65),  # closed book
            '\U0001f4d5': ('positive', 0.65),  # book
            '\U0001f4d6': ('positive', 0.65),  # open book
            '\U0001f4d7': ('positive', 0.65),  # green book
            '\U0001f4d8': ('positive', 0.65),  # blue book
            '\U0001f4d9': ('positive', 0.65),  # orange book
            '\U0001f4da': ('positive', 0.65),  # books
            '\U0001f4db': ('positive', 0.65),  # name badge
            '\U0001f4dc': ('positive', 0.65),  # scroll
            '\U0001f4dd': ('positive', 0.7),   # memo
            '\U0001f4de': ('positive', 0.65),  # telephone receiver
            '\U0001f4df': ('positive', 0.65),  # pager
            '\U0001f4e0': ('positive', 0.65),  # fax machine
            '\U0001f4e1': ('positive', 0.65),  # satellite antenna
            '\U0001f4e2': ('positive', 0.65),  # loudspeaker
            '\U0001f4e3': ('positive', 0.65),  # megaphone
            '\U0001f4e4': ('positive', 0.65),  # outbox tray
            '\U0001f4e5': ('positive', 0.65),  # inbox tray
            '\U0001f4e6': ('positive', 0.7),   # package
            '\U0001f4e7': ('positive', 0.7),   # e-mail
            '\U0001f4e8': ('positive', 0.65),  # incoming envelope
            '\U0001f4e9': ('positive', 0.7),   # envelope with arrow
            '\U0001f4ea': ('positive', 0.65),  # closed mailbox with raised flag
            '\U0001f4eb': ('positive', 0.65),  # closed mailbox with lowered flag
            '\U0001f4ec': ('positive', 0.65),  # open mailbox with raised flag
            '\U0001f4ed': ('positive', 0.65),  # open mailbox with lowered flag
            '\U0001f4ee': ('positive', 0.65),  # postbox
            '\U0001f4ef': ('positive', 0.7),   # postal horn
            '\U0001f4f0': ('positive', 0.65),  # newspaper
            '\U0001f4f1': ('positive', 0.7),   # mobile phone
            '\U0001f4f2': ('positive', 0.7),   # mobile phone with arrow
            '\U0001f4f3': ('positive', 0.7),   # vibration mode
            '\U0001f4f4': ('positive', 0.65),  # mobile phone off
            '\U0001f4f5': ('positive', 0.65),  # no mobile phones
            '\U0001f4f6': ('positive', 0.7),   # antenna bars
            '\U0001f4f7': ('positive', 0.7),   # camera
            '\U0001f4f8': ('positive', 0.7),   # camera with flash
            '\U0001f4f9': ('positive', 0.7),   # video camera
            '\U0001f4fa': ('positive', 0.7),   # television
            '\U0001f4fb': ('positive', 0.65),  # radio
            '\U0001f4fc': ('positive', 0.65),  # videocassette
            '\U0001f500': ('positive', 0.7),   # shuffle
            '\U0001f501': ('positive', 0.65),  # repeat
            '\U0001f502': ('positive', 0.65),  # repeat single
            '\U0001f503': ('positive', 0.7),   # clockwise vertical arrows
            '\U0001f504': ('positive', 0.65),  # counterclockwise vertical arrows
            '\U0001f505': ('positive', 0.65),  # low brightness
            '\U0001f506': ('positive', 0.7),   # high brightness
            '\U0001f507': ('negative', 0.3),   # muted
            '\U0001f508': ('positive', 0.6),   # speaker low volume
            '\U0001f509': ('positive', 0.65),  # speaker medium volume
            '\U0001f50a': ('positive', 0.7),   # speaker high volume
            '\U0001f50b': ('positive', 0.65),  # battery
            '\U0001f50c': ('positive', 0.65),  # electric plug
            '\U0001f50d': ('positive', 0.7),   # magnifying glass tilted left
            '\U0001f50e': ('positive', 0.7),   # magnifying glass tilted right
            '\U0001f50f': ('positive', 0.65),  # locked with pen
            '\U0001f510': ('positive', 0.65),  # locked with key
            '\U0001f511': ('positive', 0.7),   # key
            '\U0001f512': ('positive', 0.65),  # locked
            '\U0001f513': ('positive', 0.7),   # unlocked
            '\U0001f514': ('positive', 0.7),   # bell
            '\U0001f515': ('negative', 0.3),   # bell with slash
            '\U0001f516': ('positive', 0.65),  # bookmark
            '\U0001f517': ('positive', 0.7),   # link
            '\U0001f518': ('positive', 0.65),  # radio button
            '\U0001f519': ('positive', 0.7),   # left arrow curving right
            '\U0001f51a': ('positive', 0.7),   # end arrow
            '\U0001f51b': ('positive', 0.7),   # on arrow
            '\U0001f51c': ('positive', 0.7),   # soon arrow
            '\U0001f51d': ('positive', 0.7),   # top arrow
            '\U0001f51e': ('positive', 0.65),  # no under 18
            '\U0001f51f': ('positive', 0.7),   # keycap 10
            '\U0001f520': ('positive', 0.7),   # input Latin uppercase
            '\U0001f521': ('positive', 0.7),   # input Latin lowercase
            '\U0001f522': ('positive', 0.7),   # input numbers
            '\U0001f523': ('positive', 0.7),   # input symbols
            '\U0001f524': ('positive', 0.7),   # input Latin letters
            '\U0001f525': ('positive', 0.85),  # fire
            '\U0001f526': ('positive', 0.65),  # flashlight
            '\U0001f527': ('positive', 0.65),  # wrench
            '\U0001f528': ('positive', 0.65),  # hammer
            '\U0001f529': ('positive', 0.65),  # nut and bolt
            '\U0001f52a': ('positive', 0.65),  # kitchen knife
            '\U0001f52b': ('positive', 0.65),  # pistol
            '\U0001f52c': ('positive', 0.65),  # microscope
            '\U0001f52d': ('positive', 0.65),  # telescope
            '\U0001f52e': ('positive', 0.7),   # crystal ball
            '\U0001f52f': ('positive', 0.7),   # six pointed star
            '\U0001f530': ('positive', 0.7),   # triangle
            '\U0001f531': ('positive', 0.7),   # trident
            '\U0001f532': ('positive', 0.7),   # black square button
            '\U0001f533': ('positive', 0.7),   # white square button
            '\U0001f534': ('positive', 0.7),   # red circle
            '\U0001f535': ('positive', 0.7),   # blue circle
            '\U0001f536': ('positive', 0.7),   # orange circle
            '\U0001f537': ('positive', 0.7),   # yellow circle
            '\U0001f538': ('positive', 0.7),   # green circle
            '\U0001f539': ('positive', 0.7),   # blue circle
            '\U0001f53a': ('positive', 0.7),   # red triangle pointed up
            '\U0001f53b': ('positive', 0.7),   # red triangle pointed down
            '\U0001f53c': ('positive', 0.7),   # small red triangle pointed up
            '\U0001f53d': ('positive', 0.7),   # small red triangle pointed down
            '\U0001f550': ('positive', 0.65),  # one o'clock
            '\U0001f551': ('positive', 0.65),  # two o'clock
            '\U0001f552': ('positive', 0.65),  # three o'clock
            '\U0001f553': ('positive', 0.65),  # four o'clock
            '\U0001f554': ('positive', 0.65),  # five o'clock
            '\U0001f555': ('positive', 0.65),  # six o'clock
            '\U0001f556': ('positive', 0.65),  # seven o'clock
            '\U0001f557': ('positive', 0.65),  # eight o'clock
            '\U0001f558': ('positive', 0.65),  # nine o'clock
            '\U0001f559': ('positive', 0.65),  # ten o'clock
            '\U0001f55a': ('positive', 0.65),  # eleven o'clock
            '\U0001f55b': ('positive', 0.65),  # twelve o'clock
            '\U0001f5fb': ('positive', 0.65),  # mountain
            '\U0001f5fc': ('positive', 0.7),   # Tokyo tower
            '\U0001f5fd': ('positive', 0.65),  # Statue of Liberty
            '\U0001f5fe': ('positive', 0.7),   # map of Japan
            '\U0001f5ff': ('positive', 0.7),   # moai
            '\U0001f600': ('positive', 0.8),   # grinning face
            '\U0001f601': ('positive', 0.85),  # beaming face
            '\U0001f602': ('positive', 0.9),   # tears of joy
            '\U0001f603': ('positive', 0.85),  # grinning face big eyes
            '\U0001f604': ('positive', 0.8),   # grinning face smiling eyes
            '\U0001f605': ('positive', 0.75),  # grinning face sweat
            '\U0001f606': ('positive', 0.85),  # squinting face tongue
            '\U0001f607': ('positive', 0.8),   # smiling face halo
            '\U0001f608': ('negative', 0.3),   # smiling face horns
            '\U0001f609': ('positive', 0.7),   # winking face
            '\U0001f60a': ('positive', 0.8),   # smiling face smiling eyes
            '\U0001f60b': ('positive', 0.75),  # face savoring food
            '\U0001f60c': ('positive', 0.7),   # relieved face
            '\U0001f60d': ('positive', 0.85),  # heart eyes
            '\U0001f60e': ('positive', 0.75),  # smiling face sunglasses
            '\U0001f60f': ('positive', 0.6),   # smirk
            '\U0001f610': ('neutral', 0.4),    # expressionless face
            '\U0001f611': ('neutral', 0.4),    # expressionless
            '\U0001f612': ('negative', 0.35),  # unamused
            '\U0001f613': ('neutral', 0.45),   # downcast face sweat
            '\U0001f614': ('neutral', 0.45),   # pensive
            '\U0001f615': ('neutral', 0.45),   # slightly frowning
            '\U0001f616': ('neutral', 0.4),    # confused
            '\U0001f617': ('positive', 0.65),  # kissing smiling eyes
            '\U0001f618': ('positive', 0.8),   # face blowing kiss
            '\U0001f619': ('positive', 0.7),   # kissing closed eyes
            '\U0001f61a': ('positive', 0.7),   # kissing face
            '\U0001f61b': ('positive', 0.7),   # face with tongue
            '\U0001f61c': ('positive', 0.7),   # winking face tongue
            '\U0001f61d': ('positive', 0.75),  # squinting face tongue
            '\U0001f61e': ('negative', 0.35),  # disappointed
            '\U0001f61f': ('neutral', 0.45),   # worried
            '\U0001f620': ('negative', 0.2),   # angry
            '\U0001f621': ('negative', 0.15),  # pouting
            '\U0001f622': ('negative', 0.3),   # crying
            '\U0001f623': ('negative', 0.35),  # persevering
            '\U0001f624': ('negative', 0.3),   # triumphant
            '\U0001f625': ('negative', 0.35),  # disappointed relieved
            '\U0001f626': ('negative', 0.35),  # frowning open mouth
            '\U0001f627': ('negative', 0.2),   # anguished
            '\U0001f628': ('negative', 0.25),  # fearful
            '\U0001f629': ('negative', 0.3),   # weary
            '\U0001f62a': ('negative', 0.3),   # sleepy
            '\U0001f62b': ('negative', 0.3),   # tired
            '\U0001f62c': ('positive', 0.6),   # grimacing
            '\U0001f62d': ('negative', 0.2),   # loudly crying
            '\U0001f62e': ('neutral', 0.5),    # open mouth face
            '\U0001f62f': ('neutral', 0.45),   # hushed
            '\U0001f630': ('negative', 0.35),  # cold sweat
            '\U0001f631': ('negative', 0.3),   # screaming fear
            '\U0001f632': ('neutral', 0.4),    # astonished
            '\U0001f633': ('positive', 0.7),   # flushed
            '\U0001f634': ('neutral', 0.4),    # sleeping
            '\U0001f635': ('neutral', 0.4),    # dizzy
            '\U0001f636': ('neutral', 0.5),    # no mouth
            '\U0001f637': ('neutral', 0.45),   # medical mask
            '\U0001f911': ('positive', 0.7),   # money mouth
            '\U0001f912': ('neutral', 0.5),    # thermometer
            '\U0001f913': ('positive', 0.75),  # nerd
            '\U0001f914': ('neutral', 0.5),    # thinking
            '\U0001f917': ('positive', 0.75),  # hugging
            '\U0001f918': ('positive', 0.7),   # rock on
            '\U0001f919': ('positive', 0.75),  # call me
            '\U0001f91a': ('positive', 0.65),  # raised back hand
            '\U0001f91b': ('positive', 0.7),   # left fist
            '\U0001f91c': ('positive', 0.7),   # right fist
            '\U0001f91d': ('positive', 0.8),   # handshake
            '\U0001f91e': ('positive', 0.75),  # crossed fingers
            '\U0001f91f': ('positive', 0.8),   # love you gesture
            '\U0001f920': ('positive', 0.75),  # cowboy
            '\U0001f921': ('positive', 0.7),   # clown
            '\U0001f923': ('positive', 0.9),   # rofl
            '\U0001f924': ('positive', 0.7),   # drooling
            '\U0001f925': ('positive', 0.65),  # lying face
            '\U0001f928': ('neutral', 0.5),    # raised eyebrow
            '\U0001f929': ('positive', 0.8),   # star struck
            '\U0001f92a': ('positive', 0.75),  # crazy face
            '\U0001f92b': ('positive', 0.7),   # shushing
            '\U0001f92c': ('negative', 0.25),  # symbols on mouth
            '\U0001f92d': ('positive', 0.7),   # hand over mouth
            '\U0001f92e': ('positive', 0.7),   # vomiting rainbow
            '\U0001f92f': ('positive', 0.8),   # exploding head
            '\U0001f970': ('positive', 0.85),  # smiling hearts
            '\U0001f973': ('positive', 0.8),   # partying
            '\U0001f975': ('neutral', 0.45),   # hot
            '\U0001f976': ('neutral', 0.45),   # cold
            '\U0001f977': ('positive', 0.7),   # ninja
            '\U0001f978': ('positive', 0.7),   # guard
            '\U0001f979': ('positive', 0.7),   # pleading
            '\U0001f97a': ('positive', 0.75),  # crying face
            '\U0001f97b': ('positive', 0.7),   # face with monocle
            '\U0001f97c': ('positive', 0.7),   # face with headband
            '\U0001f97d': ('positive', 0.7),   # face with sunglasses
            '\U0001f97e': ('positive', 0.7),   # face with glove
            '\U0001f97f': ('positive', 0.7),   # face with warm smile
        }

    def _build_intensifiers(self):
        return {
            'very': 1.5, 'really': 1.5, 'extremely': 2.0, 'super': 1.8,
            'absolutely': 2.0, 'totally': 1.8, 'completely': 1.8,
            'incredibly': 2.0, 'insanely': 2.0, 'ridiculously': 2.0,
            'so': 1.5, 'too': 1.3, 'quite': 1.3, 'rather': 1.2,
            'pretty': 1.3, 'fairly': 1.2, 'somewhat': 0.8, 'slightly': 0.7,
            'barely': 0.6, 'hardly': 0.6, 'kind of': 0.8, 'sort of': 0.8,
            'lowkey': 1.2, 'highkey': 1.8, 'deadass': 2.0, 'ngl': 1.3,
            'fr': 1.3, 'no cap': 1.5, 'on god': 2.0, 'literally': 1.5,
            'actually': 1.3, 'basically': 1.2, 'seriously': 1.5,
            'honestly': 1.3, 'genuinely': 1.3, 'truly': 1.5,
            'freaking': 1.5, 'freaking': 1.5, 'damn': 1.5, 'dammit': 1.5,
            'hella': 1.5, 'mad': 1.5, 'wild': 1.5, 'crazy': 1.5,
            'insane': 1.8, 'bonkers': 1.8, 'bananas': 1.8,
        }

    def _build_slang_patterns(self):
        return {
            'looking_for': [
                r'looking\s+(?:for|2)\s+',
                r'need\s+(?:a|an|some|to)\s+',
                r'want\s+(?:a|an|some|to)\s+',
                r'any\s+(?:one|body|guy)\s+who\s+',
                r'who\s+(?:can|does|is)\s+',
                r'someone\s+(?:who|that|to)\s+',
                r'searching\s+(?:for|4)\s+',
                r'hunting\s+(?:for|4)\s+',
                r'scouting\s+(?:for|4)\s+',
                r'find\s+me\s+(?:a|an|some)\s+',
                r'got\s+(?:a|an)\s+(?:gig|project|job|work)\s+',
                r'hiring\s+(?:for|a|an|some)\s+',
                r'recruiting\s+(?:for|a|an|some)\s+',
            ],
            'posting_job': [
                r'(?:post|put|share|create|publish)\s+(?:a|an|the)?\s*(?:job|gig|project|listing)',
                r'(?:need|want)\s+to\s+(?:post|put|share|create|publish)\s+',
                r'(?:how|where)\s+to\s+(?:post|put|share|create|publish)\s+',
                r'(?:posting|putting|sharing|creating|publishing)\s+(?:a|an|the)?\s*(?:job|gig|project|listing)',
                r'(?:looking|searching)\s+to\s+(?:hire|recruit|bring)\s+',
                r'got\s+(?:a|an)\s+(?:project|gig|job)\s+',
            ],
            'asking_about': [
                r'(?:how|what|where|when|why|who)\s+(?:do|does|is|are|can|could|would|should|will)\s+',
                r'(?:tell|explain|show|help)\s+(?:me\s+)?(?:about|how|what|where)\s+',
                r'(?:can|could|would|will)\s+you\s+(?:tell|explain|show|help)\s+',
                r'(?:wanna|gonna|gotta|want\s+to|need\s+to|trying\s+to)\s+',
                r'(?:yo|hey|hi|sup|what\'s\s+up)\s+',
                r'(?:bruh|fam|bestie|bro|dude)\s+',
                r'(?:pls|plz|please|pls)\s+',
                r'(?:thx|ty|tyvm|thanks|thank)\s+',
                r'(?:idk|tbh|ngl|fr|imo|btw)\s+',
            ],
            'complaint_pattern': [
                r'(?:this|that|it|the)\s+(?:is|was|has)\s+(?:so\s+)?(?:bad|terrible|awful|horrible|worst|broken|useless|stupid|annoying|frustrating|disappointing)',
                r'(?:i|im|I\'m)\s+(?:so\s+)?(?:angry|frustrated|annoyed|disappointed|upset|mad|furious|livid|pissed|heated)',
                r'(?:this|that|it)\s+(?:sucks|blows|hates?|pisses?)\s+',
                r'(?:fucking|freaking|damn|stupid|dumb|trash|garbage|crap|shit|bullshit)\s+',
                r'(?:worst|dumbest|stupidest|most\s+annoying|most\s+frustrating)\s+',
                r'(?:i|we)\s+(?:hate|despise|loathe|can\'t\s+stand)\s+',
                r'(?:never|never\s+ever)\s+(?:going\s+to|gonna|will)\s+',
                r'(?:scam|fraud|fake|lie|liar|cheat|cheating)\s+',
                r'(?:unacceptable|inexcusable|ridiculous|absurd|insane)\s+',
                r'(?:disappointed|let\s+down|bummed)\s+',
            ],
            'positive_feedback': [
                r'(?:this|that|it|the)\s+(?:is|was|has)\s+(?:so\s+)?(?:great|awesome|amazing|fantastic|wonderful|excellent|perfect|brilliant|outstanding|superb|terrific)',
                r'(?:i|im|I\'m)\s+(?:so\s+)?(?:happy|glad|pleased|delighted|thrilled|excited|impressed|satisfied)\s+',
                r'(?:love|adore|enjoy|appreciate)\s+(?:this|that|it|the|your|you)\s+',
                r'(?:best|greatest|most\s+amazing|most\s+awesome)\s+',
                r'(?:thank|thx|ty|tyvm)\s+(?:you|so\s+much|a\s+lot|for\s+everything)\s+',
                r'(?:you|ur|your)\s+(?:the\s+)?(?:best|greatest|awesome|amazing|fantastic|wonderful|excellent|perfect|brilliant|outstanding|superb)\s+',
                r'(?:keep\s+(?:it\s+)?(?:up|going|doing|rocking))\s+',
                r'(?:well\s+done|good\s+job|nice\s+work|great\s+job|awesome\s+job)\s+',
                r'(?:this\s+app|this\s+platform|skillify)\s+(?:is|rocks?|slaps?|hits\s+different|fire|lit|goat|bussin)\s+',
            ],
            'goodbye_pattern': [
                r'(?:bye|goodbye|cya|ttyl|brb|gtg|gotta\s+go|heading\s+out|time\s+to\s+go)\s*',
                r'(?:that\'?s?\s+(?:all|it|it\?))\s*$',
                r'(?:nothing|no\s+more|nope|nah|nvm)\s+',
                r'(?:thanks|thx|ty|appreciate|helpful)\s+(?:i\'?m?\s+good|that\'?s?\s+(?:all|it))\s*',
                r'(?:im|i\'m)\s+(?:good|done|set|all\s+set|fine|okay|ok)\s*',
                r'(?:got\s+it|understood|noted|makes\s+sense|cool|nice|awesome|great|perfect)\s*',
                r'(?:sounds|that\s+works|you\'?ve?\s+been\s+helpful)\s*',
                r'(?:end|close|stop|exit|quit)\s+(?:chat|conversation|this)\s*',
                r'(?:wrap|let\'?s?\s+wrap)\s+(?:this|it|up)\s*',
            ],
        }

    def normalize_texting_style(self, text):
        original = text
        text_lower = text.lower().strip()

        for slang, expansion in self.texting_slang.items():
            pattern = r'\b' + re.escape(slang) + r'\b'
            text_lower = re.sub(pattern, expansion, text_lower)

        text_lower = re.sub(r'(.)\1{2,}', r'\1\1', text_lower)

        text_lower = re.sub(r'[!?]{2,}', '!', text_lower)
        text_lower = re.sub(r'\.{4,}', '...', text_lower)

        text_lower = re.sub(r'([a-z])\1+\b', r'\1', text_lower)

        text_lower = re.sub(r'\s+', ' ', text_lower).strip()

        return text_lower

    def detect_emotion_from_style(self, text):
        original = text
        text_lower = text.lower().strip()
        words = text_lower.split()
        word_count = len(words)
        char_count = len(text)

        caps_ratio = sum(1 for c in text if c.isupper()) / max(char_count, 1)
        exclamation_count = text.count('!')
        question_count = text.count('?')
        ellipsis_count = text.count('...')
        repeated_chars = len(re.findall(r'(.)\1{2,}', text_lower))
        emoji_count = len(re.findall(r'[\U0001f600-\U0001f64f\U0001f300-\U0001f5ff\U0001f680-\U0001f6ff\U0001f1e0-\U0001f1ff\U00002702-\U000027b0\U0001f900-\U0001f9ff\U0001fa00-\U0001fa6f\U0001fa70-\U0001faff]', text))

        punctuation_patterns = {
            '?!': ('surprised_question', 2),
            '?!?': ('urgent_surprise', 3),
            '!?': ('excited_question', 2),
            '?!?!': ('panicked', 3),
            '!!': ('strong_excitement', 2),
            '!!!': ('very_strong_excitement', 3),
            '!!!!': ('extreme_excitement', 4),
            '??': ('confusion_or_disbelief', 2),
            '???': ('very_confused', 3),
            '????': ('extreme_confusion', 4),
            '...': ('hesitation', 1),
            '....': ('deep_hesitation', 2),
            '.....': ('trailing_off', 2),
            '—': ('emphasis', 1),
            '--': ('emphasis', 1),
            '~~': ('playful', 1),
            '---': ('dramatic_pause', 2),
            '>>>': ('urgency', 2),
            '<<<': ('retreat', 1),
            '***': ('censorship_or_emphasis', 2),
            '###': ('anger_censorship', 2),
            '!!!???': ('confused_excitement', 3),
            '???!!!': ('excited_confusion', 3),
            '?!?!?!': ('overwhelmed', 4),
            '...?!': ('hesitant_surprise', 2),
            '...!': ('hesitant_excitement', 2),
            '..': ('mild_hesitation', 1),
            '.': ('neutral_statement', 0),
            ',': ('listing_or_pause', 0),
            ':': ('anticipation', 1),
            ';': ('playful_wink', 1),
            '(': ('aside_or_uncertainty', 1),
            ')': ('positive_closing', 1),
            '<3': ('love', 3),
            '</3': ('heartbreak', 3),
            '<33': ('deep_love', 4),
            '</33': ('deep_heartbreak', 4),
            ':)': ('smile', 2),
            ':D': ('big_smile', 3),
            ':(': ('sadness', 2),
            ':/': ('confusion_or_skepticism', 2),
            ':|': ('neutral_or_unimpressed', 1),
            ';)': ('wink', 2),
            ':P': ('playful_tongue', 2),
            'xD': ('laughing_hard', 3),
            'XD': ('laughing_hard', 3),
            '^^': ('happy', 2),
            'T_T': ('crying', 3),
            'TT': ('crying', 3),
            'Q_Q': ('crying', 3),
            'D:': ('shocked', 3),
            ':3': ('cute', 2),
            'UwU': ('cute_happy', 3),
            'OwO': ('surprised_cute', 3),
            ':^)': ('smug', 2),
            '-_-': ('annoyed', 2),
            '>_<': ('frustrated', 3),
            'o_o': ('surprised', 2),
            'O_O': ('very_surprised', 3),
            '._.': ('confused', 2),
            '.__.': ('very_confused', 3),
            '°_°': ('dizzy', 2),
            '◕_◕': ('happy', 2),
            '◔_◔': ('unimpressed', 2),
            'ಠ_ಠ': ('disapproval', 3),
            '¯\\_(ツ)_/¯': ('shrug', 2),
            '٩(◕‿◕)۶': ('celebration', 3),
            '(╯°□°）╯︵ ┻━┻': ('table_flip', 4),
            '┬─┬ノ( º _ ºノ)': ('putting_table_back', 2),
            '( ͡° ͜ʖ ͡°)': ('suggestive', 2),
            '( ͡❛ ͜ʖ ͡❛)': ('happy_suggestive', 2),
            'ಠ_ಠ': ('judging', 3),
            '?(?)': ('uncertain', 2),
            '!(!)': ('urgent_uncertain', 3),
        }

        detected_patterns = []
        total_punctuation_emotion = 0

        for pattern, (emotion_type, intensity) in punctuation_patterns.items():
            if pattern in text:
                detected_patterns.append({
                    'pattern': pattern,
                    'emotion': emotion_type,
                    'intensity': intensity
                })
                total_punctuation_emotion += intensity

        emoji_sentiments = []
        for emoji_char in text:
            if emoji_char in self.emoji_sentiment:
                emoji_sentiments.append(self.emoji_sentiment[emoji_char])

        avg_emoji_sentiment = 0
        emoji_sentiment_label = 'neutral'
        if emoji_sentiments:
            avg_emoji_sentiment = sum(s for s, _ in emoji_sentiments) / len(emoji_sentiments)
            pos_emojis = sum(1 for s, _ in emoji_sentiments if s == 'positive')
            neg_emojis = sum(1 for s, _ in emoji_sentiments if s == 'negative')
            if pos_emojis > neg_emojis:
                emoji_sentiment_label = 'positive'
            elif neg_emojis > pos_emojis:
                emoji_sentiment_label = 'negative'

        emotion = {
            'style_sentiment': 'neutral',
            'emotion_intensity': 0,
            'emotion_tags': [],
            'typing_style': 'normal',
            'emoji_sentiment': emoji_sentiment_label,
            'emoji_intensity': avg_emoji_sentiment,
            'caps_ratio': round(caps_ratio, 3),
            'exclamation_count': exclamation_count,
            'question_count': question_count,
            'ellipsis_count': ellipsis_count,
            'repeated_chars': repeated_chars,
            'word_count': word_count,
            'punctuation_patterns': detected_patterns,
            'punctuation_emotion_score': total_punctuation_emotion,
            'message_length': len(text),
            'is_question': question_count > 0,
            'is_exclamation': exclamation_count > 0,
            'has_ellipsis': ellipsis_count > 0,
            'has_repeated_chars': repeated_chars > 0,
            'has_caps_emphasis': caps_ratio > 0.3,
        }

        emotion_score = 0
        emotion_tags = []

        for p in detected_patterns:
            etype = p['emotion']
            intensity = p['intensity']

            if etype in ('surprised_question', 'urgent_surprise', 'very_surprised'):
                emotion_tags.append('surprised')
                emotion_score += intensity
            elif etype in ('excited_question', 'strong_excitement', 'very_strong_excitement', 'extreme_excitement'):
                emotion_tags.append('excited')
                emotion_score += intensity
            elif etype in ('confusion_or_disbelief', 'very_confused', 'extreme_confusion'):
                emotion_tags.append('confused')
                emotion_score += intensity
            elif etype in ('hesitation', 'deep_hesitation', 'trailing_off', 'mild_hesitation'):
                emotion_tags.append('hesitant')
                emotion_score += intensity
            elif etype in ('emphasis', 'dramatic_pause'):
                emotion_tags.append('emphasizing')
                emotion_score += intensity
            elif etype in ('urgency',):
                emotion_tags.append('urgent')
                emotion_score += intensity
            elif etype in ('playful', 'playful_wink', 'playful_tongue'):
                emotion_tags.append('playful')
                emotion_score += intensity
            elif etype in ('love', 'deep_love'):
                emotion_tags.append('affectionate')
                emotion_score += intensity
            elif etype in ('heartbreak', 'deep_heartbreak'):
                emotion_tags.append('heartbroken')
                emotion_score += intensity
            elif etype in ('big_smile', 'smile', 'happy', 'happy_suggestive'):
                emotion_tags.append('happy')
                emotion_score += intensity
            elif etype in ('sadness', 'crying'):
                emotion_tags.append('sad')
                emotion_score += intensity
            elif etype in ('shocked', 'very_shocked', 'surprised'):
                emotion_tags.append('shocked')
                emotion_score += intensity
            elif etype in ('annoyed', 'frustrated', 'judging', 'disapproval', 'unimpressed'):
                emotion_tags.append('annoyed')
                emotion_score += intensity
            elif etype in ('confusion_or_skepticism', 'confused', 'very_confused', 'uncertain'):
                emotion_tags.append('skeptical')
                emotion_score += intensity
            elif etype in ('table_flip',):
                emotion_tags.append('very_frustrated')
                emotion_score += intensity
            elif etype in ('censorship_or_emphasis', 'anger_censorship'):
                emotion_tags.append('intense')
                emotion_score += intensity
            elif etype in ('panicked', 'overwhelmed'):
                emotion_tags.append('overwhelmed')
                emotion_score += intensity
            elif etype in ('shrug',):
                emotion_tags.append('indifferent')
                emotion_score += intensity
            elif etype in ('anticipation',):
                emotion_tags.append('anticipating')
                emotion_score += intensity

        if caps_ratio > 0.7 and word_count > 1:
            emotion_tags.append('shouting')
            emotion_score += 2
        elif caps_ratio > 0.5 and word_count > 1:
            emotion_tags.append('emphasizing')
            emotion_score += 1

        if exclamation_count >= 3:
            emotion_tags.append('very_excited')
            emotion_score += 2
        elif exclamation_count >= 1:
            emotion_tags.append('excited')
            emotion_score += 1

        if question_count >= 3:
            emotion_tags.append('very_confused')
            emotion_score += 2
        elif question_count >= 1:
            emotion_tags.append('curious')
            emotion_score += 1

        if repeated_chars >= 2:
            emotion_tags.append('dramatic')
            emotion_score += 1

        if emoji_count >= 3:
            emotion_tags.append('very_expressive')
            emotion_score += 2
        elif emoji_count >= 1:
            emotion_tags.append('expressive')
            emotion_score += 1

        if word_count <= 2:
            emotion_tags.append('terse')
        elif word_count <= 5:
            emotion_tags.append('brief')
        elif word_count >= 20:
            emotion_tags.append('verbose')

        if any(w in text_lower for w in ['lol', 'lmao', 'rofl', 'haha', 'hehe', 'xd', 'lmfao']):
            emotion_tags.append('humorous')
            emotion_score += 1

        if any(w in text_lower for w in ['smh', 'facepalm', 'ugh', 'yikes', 'cringe']):
            emotion_tags.append('disappointed')
            emotion_score += 1

        if any(w in text_lower for w in ['ngl', 'tbh', 'fr', 'no cap', 'honestly', 'real talk']):
            emotion_tags.append('candid')
            emotion_score += 1

        if any(w in text_lower for w in ['bruh', 'oof', 'yikes', 'dead', 'im dead', 'im screaming']):
            emotion_tags.append('shocked')
            emotion_score += 1

        if any(w in text_lower for w in ['slay', 'fire', 'lit', 'goat', 'bussin', 'iconic']):
            emotion_tags.append('hyped')
            emotion_score += 1

        if any(w in text_lower for w in ['sus', 'cap', 'fake', 'lie', 'lying', 'catfish']):
            emotion_tags.append('suspicious')
            emotion_score += 1

        if any(w in text_lower for w in ['miss you', 'love you', 'ily', 'heart', 'adore']):
            emotion_tags.append('affectionate')
            emotion_score += 1

        if any(w in text_lower for w in ['help', 'stuck', 'broken', 'error', 'crash', 'bug', 'not working']):
            emotion_tags.append('distressed')
            emotion_score += 1

        if any(w in text_lower for w in ['hate', 'worst', 'terrible', 'awful', 'trash', 'garbage']):
            emotion_tags.append('angry')
            emotion_score += 2

        if any(w in text_lower for w in ['love', 'best', 'amazing', 'awesome', 'perfect', 'great']):
            emotion_tags.append('happy')
            emotion_score += 1

        if emoji_sentiment_label == 'positive':
            emotion_tags.append('positive_emoji')
            emotion_score += 1
        elif emoji_sentiment_label == 'negative':
            emotion_tags.append('negative_emoji')
            emotion_score += 1

        if caps_ratio > 0.7 and any(w in text_lower for w in ['hate', 'worst', 'terrible', 'angry', 'furious', 'mad']):
            emotion['style_sentiment'] = 'negative'
            emotion['emotion_intensity'] = min(emotion_score * 1.5, 10)
        elif caps_ratio > 0.7 and any(w in text_lower for w in ['love', 'best', 'amazing', 'awesome', 'perfect', 'great']):
            emotion['style_sentiment'] = 'positive'
            emotion['emotion_intensity'] = min(emotion_score * 1.5, 10)
        elif exclamation_count >= 3 and emoji_sentiment_label == 'positive':
            emotion['style_sentiment'] = 'positive'
            emotion['emotion_intensity'] = min(emotion_score * 1.2, 10)
        elif emoji_sentiment_label == 'negative':
            emotion['style_sentiment'] = 'negative'
            emotion['emotion_intensity'] = min(emotion_score * 1.2, 10)
        elif emoji_sentiment_label == 'positive':
            emotion['style_sentiment'] = 'positive'
            emotion['emotion_intensity'] = min(emotion_score * 1.0, 10)
        else:
            emotion['style_sentiment'] = 'neutral'
            emotion['emotion_intensity'] = min(emotion_score * 0.8, 10)

        if 'angry' in emotion_tags or 'very_frustrated' in emotion_tags:
            emotion['style_sentiment'] = 'negative'
            emotion['emotion_intensity'] = min(emotion_score * 1.3, 10)
        elif 'excited' in emotion_tags or 'hyped' in emotion_tags or 'very_excited' in emotion_tags:
            emotion['style_sentiment'] = 'positive'
            emotion['emotion_intensity'] = min(emotion_score * 1.2, 10)
        elif 'sad' in emotion_tags or 'heartbroken' in emotion_tags:
            emotion['style_sentiment'] = 'negative'
            emotion['emotion_intensity'] = min(emotion_score * 1.1, 10)
        elif 'happy' in emotion_tags or 'playful' in emotion_tags:
            emotion['style_sentiment'] = 'positive'
            emotion['emotion_intensity'] = min(emotion_score * 1.1, 10)

        if caps_ratio > 0.7:
            emotion['typing_style'] = 'aggressive'
        elif caps_ratio > 0.4:
            emotion['typing_style'] = 'excited'
        elif repeated_chars >= 2:
            emotion['typing_style'] = 'dramatic'
        elif ellipsis_count >= 1:
            emotion['typing_style'] = 'hesitant'
        elif word_count <= 2:
            emotion['typing_style'] = 'minimal'
        elif word_count >= 20:
            emotion['typing_style'] = 'detailed'
        elif question_count >= 2:
            emotion['typing_style'] = 'interrogative'
        elif exclamation_count >= 2:
            emotion['typing_style'] = 'exclamatory'
        else:
            emotion['typing_style'] = 'normal'

        unique_tags = list(set(emotion_tags))
        emotion['emotion_tags'] = unique_tags

        return emotion

    def _levenshtein_distance(self, s1, s2):
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = prev_row[j + 1] + 1
                deletions = curr_row[j] + 1
                substitutions = prev_row[j] + (c1 != c2)
                curr_row.append(min(insertions, deletions, substitutions))
            prev_row = curr_row
        return prev_row[-1]

    def _soundex(self, word):
        if not word:
            return ""
        word = word.upper()
        soundex = word[0]
        mapping = {
            'B': '1', 'F': '1', 'P': '1', 'V': '1',
            'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2',
            'X': '2', 'Z': '2',
            'D': '3', 'T': '3',
            'L': '4',
            'M': '5', 'N': '5',
            'R': '6'
        }
        prev = mapping.get(word[0], '0')
        for char in word[1:]:
            code = mapping.get(char, '0')
            if code != '0' and code != prev:
                soundex += code
            prev = code
        soundex = (soundex + '0000')[:4]
        return soundex

    def _phonetic_match(self, word1, word2):
        return self._soundex(word1) == self._soundex(word2)

    def _ngrams(self, text, n=2):
        words = text.lower().split()
        if len(words) < n:
            return [tuple(words)]
        return [tuple(words[i:i + n]) for i in range(len(words) - n + 1)]

    def _fuzzy_phrase_match(self, text, pattern):
        text_lower = text.lower()
        pattern_lower = pattern.lower()

        if text_lower == pattern_lower:
            return 1.0
        if pattern_lower in text_lower:
            return 0.85
        if text_lower in pattern_lower:
            return 0.7

        text_words = text_lower.split()
        pattern_words = pattern_lower.split()

        if not pattern_words:
            return 0

        matched = 0
        for pw in pattern_words:
            best_match = False
            for tw in text_words:
                if tw == pw:
                    best_match = True
                    break
                if len(tw) > 2 and len(pw) > 2:
                    dist = self._levenshtein_distance(tw, pw)
                    max_len = max(len(tw), len(pw))
                    if dist <= 1 or dist / max_len < 0.3:
                        best_match = True
                        break
                    if self._phonetic_match(tw, pw):
                        best_match = True
                        break
            if best_match:
                matched += 1

        word_score = matched / len(pattern_words)

        text_ngrams = set(self._ngrams(text_lower))
        pattern_ngrams = set(self._ngrams(pattern_lower))
        if pattern_ngrams:
            ngram_intersection = text_ngrams & pattern_ngrams
            ngram_score = len(ngram_intersection) / len(pattern_ngrams)
        else:
            ngram_score = 0

        combined = (word_score * 0.6) + (ngram_score * 0.4)
        return combined

    def _get_keyboard_corrections(self, word):
        corrections = []
        for i, char in enumerate(word):
            if char in self.keyboard_adjacency:
                for adjacent in self.keyboard_adjacency[char]:
                    corrected = word[:i] + adjacent + word[i+1:]
                    corrections.append(corrected)

            if i < len(word) - 1 and word[i] == word[i+1]:
                corrected = word[:i] + word[i+1:]
                corrections.append(corrected)

        if len(word) > 3:
            for i in range(len(word) - 1):
                corrected = word[:i] + word[i+1] + word[i] + word[i+2:]
                corrections.append(corrected)

        return corrections

    def fuzzy_intent_match(self, text):
        text_lower = text.lower().strip()
        text_corrected = self.correct_spelling(text_lower)

        if text_corrected != text_lower:
            keyword_intents = {
                'find_freelancer': ['find freelancer', 'hire someone', 'find talent',
                                   'looking for freelancer', 'hire developer', 'hire designer',
                                   'find expert', 'find a professional', 'recruit',
                                   'find me a', 'need a developer', 'need a designer',
                                   'need a writer', 'need a professional', 'looking for a developer',
                                   'looking for a designer', 'looking for a writer', 'looking for a professional',
                                   'hire a developer', 'hire a designer', 'hire a writer',
                                   'find me someone', 'find someone who', 'need someone who',
                                   'need someone to', 'looking for someone', 'searching for',
                                   'hunting for', 'scouting for', 'looking for a dev',
                                   'need a dev', 'need a designer', 'looking for talent',
                                   'where can i find', 'where to find', 'help me find',
                                   'help me hire', 'i need', 'i want', 'im looking',
                                   'im searching', 'im hunting', 'im looking for',
                                   'anyone who can', 'anyone know', 'know any',
                                   'suggest a', 'recommend a', 'recommend someone',
                                   'who can do', 'who does', 'who is good at',
                                   'best freelancer', 'best developer', 'best designer',
                                   'top rated', 'highly rated', 'experienced'],
                'post_job': ['post a job', 'create job', 'post project', 'new job listing',
                            'list a project', 'publish job', 'where to post job',
                            'post a gig', 'create a gig', 'list a gig',
                            'need to post', 'want to post', 'how to post',
                            'where to post', 'posting a job', 'creating a job',
                            'posting a project', 'creating a project',
                            'i want to hire', 'i need to hire', 'looking to hire',
                            'hiring for', 'recruiting for', 'need someone for',
                            'got a project', 'have a project', 'have a gig',
                            'need work done', 'need something built', 'need something done',
                            'need a website', 'need an app', 'need design'],
                'proposals_bids': ['send proposal', 'write proposal', 'submit bid',
                                  'apply for job', 'bid on project', 'proposal tips',
                                  'my proposals', 'received proposals', 'send a bid',
                                  'write a bid', 'submit a proposal', 'apply for gig',
                                  'bid on gig', 'proposal help', 'how to propose',
                                  'how to bid', 'how to apply', 'how to submit',
                                  'im bidding', 'im applying', 'im proposing',
                                  'bid amount', 'proposal amount', 'my bid',
                                  'accepted proposal', 'pending proposal', 'rejected proposal',
                                  'proposal status', 'bid status', 'view proposals',
                                  'view bids', 'check proposals', 'check bids'],
                'payments': ['pay freelancer', 'escrow', 'milestone payment', 'release payment',
                            'payment method', 'add payment', 'secure payment', 'fund milestone',
                            'pay for project', 'payment process', 'how to pay',
                            'where to pay', 'payment options', 'payment info',
                            'add card', 'add bank', 'payment failed', 'payment error',
                            'refund', 'charge', 'charged', 'billing', 'invoice',
                            'receipt', 'transaction', 'transfer money', 'send money',
                            'fund project', 'fund escrow', 'release funds',
                            'approve payment', 'confirm payment', 'payment pending'],
                'withdraw_earnings': ['withdraw money', 'get paid', 'withdraw earnings',
                                     'cash out', 'my balance', 'payout', 'earnings',
                                     'bank transfer', 'withdrawal', 'withdraw cash',
                                     'get my money', 'take out money', 'transfer earnings',
                                     'payout method', 'payout options', 'when do i get paid',
                                     'payment schedule', 'payment cycle', 'withdrawal request',
                                     'withdrawal pending', 'withdrawal failed',
                                     'how do i get paid', 'how to withdraw'],
                'fees_commission': ['service fee', 'commission', 'what are the fees',
                                   'platform fee', 'skillify fee', 'how much do you charge',
                                   'pricing', 'percentage', 'take from payment',
                                   'what are your fees', 'your fees', 'fee structure',
                                   'how much is the fee', 'cost of using', 'cost to use',
                                   'how much does it cost', 'what does it cost',
                                   'how much is skillify', 'pricing plan', 'pricing info',
                                   'fee breakdown', 'fee details', 'commission rate',
                                   'service charge', 'platform charge', 'processing fee',
                                   'transaction fee', 'hidden fees', 'no hidden fees',
                                   'premium pricing', 'free plan', 'paid plan'],
                'profile_setup': ['set up profile', 'complete profile', 'edit profile',
                                 'update bio', 'add skills', 'portfolio', 'profile picture',
                                 'professional bio', 'profile optimization', 'resume',
                                 'edit my profile', 'update my profile', 'change profile',
                                 'profile photo', 'profile image', 'upload photo',
                                 'add portfolio', 'portfolio samples', 'work samples',
                                 'showcase work', 'display work', 'professional summary',
                                 'about me', 'bio section', 'skills section',
                                 'profile help', 'profile tips', 'profile guide',
                                 'how to setup', 'how to edit', 'how to update'],
                'skills_badges': ['add skills', 'skill assessment', 'badge', 'verified skill',
                                 'take test', 'skill quiz', 'verify skills', 'endorse',
                                 'how to get badge', 'verified badge', 'skill test',
                                 'skill exam', 'skill certification', 'prove skills',
                                 'skill verification', 'badge verification',
                                 'take assessment', 'skill level', 'skill test',
                                 'earn badge', 'get badge', 'skill badge',
                                 'verified badge', 'trust badge', 'credibility badge'],
                'disputes_issues': ['dispute', 'report freelancer', 'report client',
                                   'unhappy with work', 'work not delivered', 'mediation',
                                   'resolve dispute', 'cancel project', 'project dispute',
                                   'file dispute', 'open dispute', 'dispute resolution',
                                   'report problem', 'report issue', 'file complaint',
                                   'not satisfied', 'quality issue', 'work not done',
                                   'freelancer not responding', 'client not responding',
                                   'project stuck', 'project failed', 'refund request',
                                   'money back', 'get refund', 'dispute help'],
                'how_skillify_works': ['how does this work', 'how does skillify work',
                                      'what is skillify', 'getting started', 'new here',
                                      'how does this platform work', 'introduction',
                                      'guide for beginners', 'what is this app',
                                      'how to use', 'how it works', 'platform overview',
                                      'getting started guide', 'beginner guide',
                                      'help me get started', 'im new', 'just joined',
                                      'first time', 'first time here', 'new user',
                                      'what can i do', 'what features', 'platform features',
                                      'how do i start', 'where do i start'],
                'messaging': ['send message', 'chat with freelancer', 'message someone',
                             'inbox', 'direct message', 'contact freelancer', 'dm',
                             'start conversation', 'communicate with', 'send dm',
                             'send a message', 'message them', 'chat with them',
                             'talk to them', 'reach out', 'contact them',
                             'inbox message', 'inbox chat', 'message inbox',
                             'open chat', 'start chatting', 'begin conversation',
                             'how to message', 'how to chat', 'how to contact'],
                'membership_plans': ['membership', 'premium', 'pro plan', 'upgrade',
                                    'free plan', 'subscription', 'membership cost',
                                    'upgrade account', 'paid plan', 'premium features',
                                    'membership plan', 'membership options', 'membership tiers',
                                    'free vs premium', 'compare plans', 'plan comparison',
                                    'upgrade to premium', 'become premium', 'get premium',
                                    'premium benefits', 'premium perks', 'premium advantages',
                                    'what do i get', 'whats included', 'plan features',
                                    'membership help', 'membership info'],
                'verification': ['verify account', 'identity verification', 'verified',
                                'how to verify', 'verification process', 'verify identity',
                                'account verification', 'kyc', 'government id'],
                'password_reset': ['forgot password', 'reset password', 'change password',
                                  'login problem', 'locked out', 'forgot my password',
                                  'need new password', "can't access account"],
                'contact_support': ['contact support', 'phone number', 'email',
                                   'how to reach', 'customer service', 'human agent',
                                   'live chat', 'talk to human', 'support email',
                                   'how can i contact', 'how do i contact', 'reach you',
                                   'talk to someone', 'get in touch', 'talk to human',
                                   'contact us', 'customer support'],
                'feedback': ['awesome', 'amazing', 'fantastic', 'wonderful', 'excellent',
                            'brilliant', 'outstanding', 'superb', 'terrific', 'great job',
                            'love it', 'best platform', 'you rock', 'well done',
                            'keep it up', 'appreciate', 'thank you so much', 'love skillify',
                            'you are awesome', 'you are great', 'you are amazing'],
                'job_search': ['find work', 'find jobs', 'looking for work', 'need projects',
                              'how to get clients', 'freelance work', 'job search',
                              'looking for projects', 'how to get hired', 'no clients',
                              'need work', 'earn money', 'make money'],
                'contracts': ['my contracts', 'active contracts', 'contract details',
                             'project timeline', 'deadline', 'milestone', 'project progress',
                             'check project status', 'ongoing projects'],
                'notifications': ['notifications', 'email alerts', 'push notifications',
                                 'notification settings', 'too many emails', 'turn off notifications',
                                 'mute', 'alert settings'],
                'cancel_project': ['cancel project', 'end contract', 'terminate project',
                                  'stop working', 'cancel contract', 'how to cancel',
                                  'cancel job', 'close project'],
                'leave_review': ['leave a review', 'write review', 'rate freelancer',
                                'rate client', 'feedback after project', 'review rating',
                                'how to review', 'post review'],
                'blocked_users': ['block someone', 'blocked users', 'how to block',
                                 'unblock user', 'report user', 'safety', 'harassment'],
                'joke': ['tell me a joke', 'say something funny', 'make me laugh',
                        'got any jokes', 'tell me something funny', 'be funny',
                        'make me smile'],
                'goodbye': ['bye', 'goodbye', 'see you', 'later', 'good night',
                            'take care', 'see ya', 'ciao', 'adios', 'farewell',
                            'gotta go', 'bye bye', 'see you later',
                            "that's all", 'that is all', "i'm done", 'im done',
                            'nothing else', 'no more questions', 'no more help needed',
                            "i think that's all", 'i think that is all',
                            'that answers my question', 'that answers it',
                            'perfect thanks', 'perfect thank you', "that's perfect",
                            'got it', 'gotcha', 'understood',
                            'sounds good', 'sounds great', 'cool thanks',
                            'awesome thanks', 'nice thanks', 'great thanks',
                            "thanks i'm good", 'thanks im good', 'im good now',
                            "i'm good now", 'no im good', "no i'm good",
                            'that works', 'that works for me', "you've been helpful",
                            'you have been helpful', 'you helped a lot',
                            'really helpful thanks', 'this helped thanks',
                            'all good', 'im all set', "i'm all set",
                            "i think im good", "i think i'm good",
                            'think im good', "think i'm good",
                            "no that's it", 'no thats it', 'nah im good',
                            "nah i'm good", "nah that's all", 'nah thats all',
                            'nope im good', 'nope thats all', "nope i'm good",
                            'heading out', 'gotta run', 'gotta bounce',
                            'i should go', 'let me go', 'let me get going',
                            'time to go', 'time to head out', 'wrap this up',
                            "let's wrap this up", 'lets wrap this up',
                            'you can close this', 'end chat', 'end conversation'],
                'capabilities': ['what can you do', 'your features', 'what are you capable of',
                                'how can you help', 'what do you know', 'capabilities'],
                'greeting': ['hello', 'hi', 'hey', 'good morning', 'good evening',
                            'howdy', "what's up", 'greetings', 'yo', 'sup',
                            'hi there', 'hello there', 'hey there', 'hiya',
                            "what's good", "how's it going", 'how are you']
            }

            best_intent = None
            best_score = 0

            for intent, keywords in keyword_intents.items():
                for kw in keywords:
                    score = self._fuzzy_phrase_match(text_corrected, kw)
                    if score > best_score:
                        best_score = score
                        best_intent = intent

            if best_intent and best_score >= 0.6:
                self.learned_corrections[text_lower] = text_corrected
                return best_intent, best_score * 0.9, text_corrected

        return None, 0, text_lower

    def _create_default_intents(self):
        intents = {
            "greeting": {
                "patterns": [
                    "hello", "hi", "hey", "good morning", "good evening",
                    "howdy", "what's up", "greetings", "yo", "sup",
                    "hi there", "hello there", "hey there", "hiya",
                    "what's good", "how's it going", "how are you"
                ],
                "responses": [
                    "Welcome to SKILLIFY. I am here to assist you with any platform-related queries. How may I help you today?",
                    "Good day. Whether you are looking to hire talent or find new opportunities, I am at your service. Please let me know how I can assist.",
                    "Hello and welcome to SKILLIFY. I can help you navigate the platform, manage your account, or resolve any issues. What do you need?",
                    "Welcome. I am the SKILLIFY support assistant. I am here to ensure your experience on the platform is seamless. How may I be of help?",
                    "Greetings. Thank you for reaching out to SKILLIFY support. I am available to assist with jobs, payments, profiles, and more. What is your query?"
                ]
            },
            "goodbye": {
                "patterns": [
                    "bye", "goodbye", "see you", "later", "good night",
                    "take care", "see ya", "ciao", "adios", "farewell",
                    "gotta go", "bye bye", "see you later",
                    "that's all", "that is all", "i'm done", "im done",
                    "nothing else", "no more questions", "no more help needed",
                    "i think thats all", "i think that is all",
                    "that answers my question", "that answers it",
                    "perfect thanks", "perfect thank you", "that's perfect",
                    "that is perfect", "got it", "gotcha", "understood",
                    "sounds good", "sounds great", "cool thanks",
                    "awesome thanks", "nice thanks", "great thanks",
                    "thanks i'm good", "thanks im good", "im good now",
                    "i'm good now", "no im good", "no i'm good",
                    "that works", "that works for me", "you've been helpful",
                    "you have been helpful", "you helped a lot",
                    "really helpful thanks", "this helped thanks",
                    "all good", "im all set", "i'm all set",
                    "i think im good", "i think i'm good",
                    "think im good", "think i'm good",
                    "no thats it", "no that's it", "nah im good",
                    "nah i'm good", "nah thats all", "nope im good",
                    "nope thats all", "nope i'm good",
                    "heading out", "gotta run", "gotta bounce",
                    "i should go", "let me go", "let me get going",
                    "time to go", "time to head out", "wrap this up",
                    "lets wrap this up", "let's wrap this up",
                    "you can close this", "end chat", "end conversation",
                    "stop", "exit", "quit"
                ],
                "responses": [
                    "Thank you for using SKILLIFY. Should you require further assistance, do not hesitate to reach out. Have a productive day.",
                    "Goodbye. I wish you continued success on the platform. We are always available if you need us.",
                    "Thank you for contacting us. If any additional questions arise, please feel free to return. Have a great day.",
                    "It was a pleasure assisting you. Please do not hesitate to reach out again if needed. Goodbye.",
                    "Farewell. We hope your experience on SKILLIFY continues to be a positive one. Take care."
                ]
            },
            "find_freelancer": {
                "patterns": [
                    "find freelancer", "hire someone", "find talent",
                    "looking for freelancer", "need a developer", "need a designer",
                    "find a writer", "hire developer", "hire designer",
                    "find expert", "recruit talent", "looking for talent",
                    "i need someone to", "looking for someone to do",
                    "find a professional", "where to find freelancers"
                ],
                "responses": [
                    "You can browse our extensive freelancer directory under Explore > Freelancers. Use the filters to narrow by skill, rating, budget, and location. Could you specify what expertise you are looking for?",
                    "SKILLIFY hosts a wide range of vetted professionals. Navigate to Explore > Freelancers and apply relevant filters. What type of talent does your project require?",
                    "To find the right freelancer, go to the Explore section and use the search functionality. You may filter by skill set, hourly rate, and availability. What is the nature of your project?",
                    "You have two options: browse freelancer profiles directly under Explore, or post a job listing and allow qualified candidates to apply. Which approach would you prefer?"
                ]
            },
            "post_job": {
                "patterns": [
                    "post a job", "create job listing", "post project",
                    "how to post job", "new job listing", "list a project",
                    "hire for project", "start hiring", "need to post",
                    "where to post job", "job posting", "publish job"
                ],
                "responses": [
                    "To post a job, navigate to Dashboard > Post a Job. You will need to provide a title, detailed description, budget range, and deadline. Once published, eligible freelancers will be notified and can begin submitting proposals.",
                    "Job postings can be created from your Dashboard. I recommend providing a comprehensive description, including project scope, required skills, and deliverables. This attracts higher-quality proposals.",
                    "From your Dashboard, select 'Post a Job' and complete the required fields. A well-detailed listing typically receives more relevant proposals. Would you like guidance on writing an effective job description?",
                    "You may post a job directly from your Dashboard. Be sure to include clear requirements, milestones, and budget expectations. The more detailed your listing, the more qualified your applicants will be."
                ]
            },
            "proposals_bids": {
                "patterns": [
                    "how many proposals", "check proposals", "view proposals",
                    "received proposals", "send proposal", "write proposal",
                    "how to send proposal", "bid on project", "submit bid",
                    "apply for job", "proposal tips", "how to bid",
                    "my proposals", "accepted proposals", "pending proposals"
                ],
                "responses": [
                    "You may review all received proposals under Dashboard > Proposals. Each entry includes the applicant's profile, bid amount, estimated timeline, and cover letter.",
                    "To submit a proposal, open a job listing and select 'Submit Proposal'. Ensure your proposal includes your rate, timeline, and a personalized explanation of how your skills align with the project requirements.",
                    "All your proposals are accessible under Dashboard > Proposals. You can track their status, including pending, accepted, and declined entries.",
                    "For freelancers: a tailored, detailed proposal significantly increases your chances of being selected. For clients: review portfolios and past ratings carefully before making a decision."
                ]
            },
            "payments": {
                "patterns": [
                    "payment", "pay freelancer", "how to pay", "escrow",
                    "milestone payment", "release payment", "payment method",
                    "add payment", "billing", "invoice",
                    "pay for project", "payment process", "secure payment"
                ],
                "responses": [
                    "SKILLIFY utilizes a secure escrow payment system. When a milestone is funded, the amount is held in escrow until the deliverable is approved by the client. This ensures protection for both parties.",
                    "All payments are processed through our escrow system. Fund a milestone, review the completed work, and upon approval, the freelancer receives payment. Would you like to proceed with a specific transaction?",
                    "To initiate a payment, navigate to the project page > Milestones > Fund. The escrow system ensures that funds are only released upon satisfactory completion of agreed-upon deliverables.",
                    "Our escrow-based payment system is designed to protect both clients and freelancers. Funds are held securely and released only when milestones are verified and approved."
                ]
            },
            "withdraw_earnings": {
                "patterns": [
                    "withdraw money", "get paid", "withdraw earnings",
                    "cash out", "transfer money", "my balance",
                    "how to get paid", "withdrawal", "payout",
                    "bank transfer", "payment received", "earnings"
                ],
                "responses": [
                    "Earnings can be withdrawn from Dashboard > Wallet > Withdraw. Supported payout methods include bank transfer, PayPal, and other region-specific options. Processing typically takes 1-3 business days.",
                    "To withdraw your earnings, navigate to Dashboard > Wallet and select 'Withdraw'. Please note that identity verification is required before your first withdrawal.",
                    "Your available balance can be viewed and withdrawn from the Wallet section of your Dashboard. Payouts are processed within 1-3 business days, depending on your selected method.",
                    "Prior to withdrawing, please ensure your identity has been verified. You may then initiate a withdrawal from Dashboard > Wallet at your convenience."
                ]
            },
            "fees_commission": {
                "patterns": [
                    "service fee", "how much does it cost", "commission",
                    "what are the fees", "platform fee", "SKILLIFY fee",
                    "how much do you charge", "pricing", "cost",
                    "percentage", "take from payment"
                ],
                "responses": [
                    "SKILLIFY operates on a transparent fee structure. Clients are charged a processing fee per transaction, and freelancers pay a commission on completed earnings. The complete fee schedule is available on our Pricing page.",
                    "Our pricing model is fully transparent. All applicable fees are displayed prior to transaction confirmation. Please refer to the Pricing page for a detailed breakdown.",
                    "Service fees are clearly outlined on our Pricing page. We strive to maintain competitive rates while providing a secure and feature-rich platform.",
                    "For a comprehensive overview of our fee structure, please visit the Pricing page. There are no hidden charges — all costs are communicated in advance."
                ]
            },
            "profile_setup": {
                "patterns": [
                    "set up profile", "complete profile", "edit profile",
                    "profile settings", "update bio", "add skills",
                    "portfolio", "profile picture", "professional bio",
                    "how to setup profile", "profile optimization",
                    "make profile better", "profile tips", "resume"
                ],
                "responses": [
                    "A complete profile significantly increases your visibility on SKILLIFY. Navigate to Profile > Edit to add a professional summary, skills, portfolio samples, and a profile photograph. Profiles with photographs receive substantially more engagement.",
                    "To optimize your profile, ensure all sections are completed, including your professional summary, skill endorsements, portfolio, and profile image. A comprehensive profile is more likely to attract client interest.",
                    "Your profile serves as your professional representation on SKILLIFY. I recommend completing all sections — bio, skills, portfolio, and photo — to maximize your visibility and credibility.",
                    "An effectively completed profile includes a professional photograph, a compelling summary, relevant skills, and portfolio samples. You may edit your profile from the Profile section."
                ]
            },
            "skills_badges": {
                "patterns": [
                    "add skills", "skill assessment", "badge",
                    "verified skill", "take test", "skill quiz",
                    "verify skills", "skill certification", "endorse",
                    "skill level", "how to get badge", "verified badge"
                ],
                "responses": [
                    "Skill verification badges enhance your profile credibility. You may take skill assessments from Profile > Skills to earn verified badges, which are displayed prominently to potential clients.",
                    "To earn a skill badge, navigate to Profile > Skills and select 'Take Assessment' beside the relevant skill. Upon successful completion, a verified badge will be added to your profile.",
                    "Verified skill badges demonstrate your proficiency to prospective clients. Access assessments through Profile > Skills. These badges can improve your hiring rate considerably.",
                    "Skill assessments are available under Profile > Skills. Completing these assessments adds verified badges to your profile, increasing trust and visibility among potential clients."
                ]
            },
            "disputes_issues": {
                "patterns": [
                    "dispute", "report freelancer", "report client",
                    "unhappy with work", "work not delivered", "quality issue",
                    "not satisfied", "mediation", "resolve dispute",
                    "problem with freelancer", "problem with client",
                    "refund project", "cancel project", "project dispute"
                ],
                "responses": [
                    "I apologize for the inconvenience. You may file a formal dispute from the project page under Report Issue. Our mediation team will review the matter impartially and work toward a fair resolution.",
                    "To initiate a dispute, please navigate to the relevant project page and select 'File a Dispute'. Provide all relevant documentation and evidence. Our team will review the case and facilitate resolution.",
                    "Dispute resolution is available through the project page. Our dedicated mediation team will assess both parties' perspectives and work to reach a fair outcome. Please file the dispute with as much detail as possible.",
                    "We take all disputes seriously. Please file your case through the project page under Help > File a Dispute. Include any supporting evidence to expedite the review process."
                ]
            },
            "how_skillify_works": {
                "patterns": [
                    "how does this work", "how does skillify work",
                    "what is skillify", "how to use", "getting started",
                    "new here", "how does this platform work",
                    "introduction", "overview", "tutorial",
                    "guide for beginners", "help me get started",
                    "what is this app"
                ],
                "responses": [
                    "SKILLIFY is a professional freelancing platform that connects clients with skilled freelancers. The workflow is as follows: clients post job listings, freelancers submit proposals, clients select a candidate, work commences, and payments are processed through a secure escrow system. Would you like a more detailed walkthrough of any specific step?",
                    "SKILLIFY facilitates professional engagements between clients and freelancers. Clients post projects, freelancers submit proposals, agreements are reached, and payments are handled securely through escrow. I can provide guidance on any aspect of this process.",
                    "Welcome to SKILLIFY. The platform operates on a straightforward model: create a profile, connect with professionals, post or apply for jobs, manage projects through milestones, and process payments securely. How may I assist you in getting started?",
                    "SKILLIFY is a comprehensive freelancing platform. Clients can post jobs and hire talent; freelancers can showcase their skills and find work. All transactions are protected through our escrow payment system. Would you like to know more about any specific feature?"
                ]
            },
            "messaging": {
                "patterns": [
                    "send message", "chat with freelancer", "message someone",
                    "inbox", "direct message", "contact freelancer",
                    "how to message", "start conversation", "dm",
                    "communicate with", "talk to freelancer"
                ],
                "responses": [
                    "Direct messaging is available from any user's profile page. Select the 'Message' button to initiate a conversation. All communications are accessible from the Messages tab.",
                    "To contact a freelancer or client, navigate to their profile and select 'Message'. For ongoing conversations, use the Messages tab in the main navigation.",
                    "You may message any registered user by visiting their profile and clicking the message icon. All conversations are centralized in the Messages section for convenient access.",
                    "Messaging functionality is available through user profiles. I recommend maintaining professional and clear communication, particularly in initial correspondence."
                ]
            },
            "membership_plans": {
                "patterns": [
                    "membership", "premium", "pro plan", "upgrade",
                    "free plan", "subscription", "membership cost",
                    "what plan", "upgrade account", "paid plan",
                    "premium features", "benefits of premium"
                ],
                "responses": [
                    "SKILLIFY offers both Free and Premium membership tiers. The Free plan provides access to core features, while Premium includes reduced commissions, priority support, advanced analytics, and enhanced profile visibility. A detailed comparison is available on the Pricing page.",
                    "Our Premium membership offers additional benefits including reduced service fees, priority customer support, and advanced profile features. Please refer to the Pricing page for a comprehensive plan comparison.",
                    "Both membership tiers are designed to serve your needs. Premium members receive reduced commissions, enhanced visibility, and additional tools. Visit the Pricing page for detailed feature comparisons.",
                    "You may upgrade your membership at any time from Settings > Membership. Premium benefits include reduced fees, priority support, and increased profile exposure."
                ]
            },
            "verification": {
                "patterns": [
                    "verify account", "identity verification", "verified",
                    "how to verify", "verification process", "verify identity",
                    "need to verify", "account verification", "kyc",
                    "government id", "upload documents"
                ],
                "responses": [
                    "Identity verification enhances your profile credibility. Navigate to Settings > Verification and upload a government-issued identification document. Our team reviews submissions within 24-48 hours.",
                    "To verify your account, go to Settings > Verification and upload a valid government ID. Verified accounts receive a trust badge and benefit from increased visibility and higher engagement rates.",
                    "The verification process requires uploading a government-issued ID through Settings > Verification. Approved accounts receive a verification badge, which has been shown to improve hiring rates significantly.",
                    "Account verification is completed through Settings > Verification. Upload your identification document, and our team will process it within 1-2 business days. Verification adds a trust badge to your profile."
                ]
            },
            "technical_support": {
                "patterns": [
                    "technical issue", "not working", "bug", "error",
                    "problem", "help me fix", "troubleshoot", "broken",
                    "it doesn't work", "something is wrong", "glitch",
                    "system error", "can't login", "login issue",
                    "app crash", "website down", "loading problem",
                    "page not loading", "error message"
                ],
                "responses": [
                    "I apologize for the inconvenience. Could you please describe the issue in detail, including any error messages and the steps you were taking when the problem occurred? This will help me provide an accurate resolution.",
                    "Technical issues can be disruptive, and I understand your concern. Please share the specific error message or describe the behavior you are experiencing so I can assist you effectively.",
                    "I would like to help resolve this promptly. Could you provide details about the issue — including the device, browser, and any error messages displayed? This information will expedite the troubleshooting process.",
                    "I understand the frustration technical issues can cause. Please describe the problem in as much detail as possible, and I will guide you through the appropriate resolution steps."
                ]
            },
            "password_reset": {
                "patterns": [
                    "reset password", "forgot password", "change password",
                    "can't login", "password help", "login problem",
                    "locked out", "access denied", "forgot my password",
                    "need new password", "can't access account"
                ],
                "responses": [
                    "To reset your password, select 'Forgot Password' on the login page. A reset link will be sent to your registered email address. Please also check your spam or junk folder if the email does not appear in your inbox.",
                    "You may reset your password by clicking the 'Forgot Password' link on the login page. Follow the instructions in the email you receive. If the email is not visible, please check your spam folder.",
                    "Password recovery is available through the 'Forgot Password' link on the login page. You will receive a secure reset link via email. For security purposes, the link expires after a limited time.",
                    "If you are unable to access your account, use the 'Forgot Password' feature on the login page. A reset link will be dispatched to your registered email address shortly."
                ]
            },
            "feedback": {
                "patterns": [
                    "great service", "you're awesome", "love it",
                    "excellent", "amazing", "fantastic", "wonderful",
                    "keep up the good work", "you're the best",
                    "really helpful", "thank you so much", "appreciate it",
                    "you are awesome", "you are great", "you are amazing",
                    "love this", "best platform", "great job", "well done",
                    "brilliant", "outstanding", "superb", "terrific",
                    "love skillify", "best app"
                ],
                "responses": [
                    "Thank you for your kind words. Your feedback is valued and appreciated. Is there anything else I can assist you with?",
                    "I appreciate your positive feedback. It is our goal to provide an exceptional experience on SKILLIFY. Please let me know if there is anything further I can help with.",
                    "Thank you. Feedback such as yours motivates our team to continue improving the platform. Do you have any other questions or concerns?",
                    "Your feedback is noted with gratitude. We strive to maintain a high standard of service. How else may I assist you today?",
                    "Thank you for taking the time to share your thoughts. We are glad you had a positive experience. Is there anything else you need assistance with?"
                ]
            },
            "complaint": {
                "patterns": [
                    "I'm unhappy", "terrible service", "worst experience",
                    "I want to speak to a manager", "this is unacceptable",
                    "very disappointed", "poor quality", "unsatisfied",
                    "not happy", "frustrated", "angry", "unacceptable",
                    "you guys suck", "this is awful", "hate this app",
                    "worst platform", "terrible app"
                ],
                "responses": [
                    "I sincerely apologize for the negative experience. Your concerns are taken seriously, and I would like to help resolve this matter. Could you please provide specific details about the issue?",
                    "I regret to hear about your dissatisfaction. We are committed to resolving all concerns promptly. Please share the details of your experience so I can assist you accordingly.",
                    "Your feedback is important, and I apologize for any inconvenience you have experienced. I would like to understand the situation fully so we can work toward a resolution. Could you elaborate?",
                    "I understand your frustration, and I sincerely apologize. We take all complaints seriously and are committed to finding a satisfactory resolution. Please provide the details so I can assist."
                ]
            },
            "contact_support": {
                "patterns": [
                    "contact support", "phone number", "email",
                    "how to reach you", "customer service number",
                    "talk to someone", "human agent", "representative",
                    "get in touch", "support email", "call you",
                    "how can i contact", "how do i contact", "reach you",
                    "talk to human", "live chat"
                ],
                "responses": [
                    "You may contact our support team at support@skillify.com or through the in-app Help Center. Our human representatives are available Monday through Friday, 9:00 AM to 6:00 PM.",
                    "Our support team can be reached at support@skillify.com. You may also submit a support ticket through Settings > Help > Contact Us. I remain available 24/7 for immediate assistance.",
                    "For direct assistance, email support@skillify.com or use the in-app Help Center to submit a ticket. Our team typically responds within 24 hours.",
                    "Our human support team is available via support@skillify.com and through the in-app Help Center. For urgent matters, Premium members receive priority response times."
                ]
            },
            "capabilities": {
                "patterns": [
                    "what can you do", "your features", "help me",
                    "what are you capable of", "how can you help",
                    "what do you know", "capabilities", "your abilities",
                    "what can you help with"
                ],
                "responses": [
                    "I am equipped to assist with a wide range of SKILLIFY-related matters, including: finding freelancers, posting jobs, managing payments, setting up profiles, navigating disputes, and answering general platform questions. What specific area do you need help with?",
                    "My capabilities include guidance on freelancer recruitment, job posting, payment processing, profile optimization, contract management, and dispute resolution. Please specify your inquiry.",
                    "I can provide assistance with most SKILLIFY features, including job management, freelancer search, payment processing, account settings, and platform navigation. How may I help you?",
                    "I am knowledgeable about all aspects of the SKILLIFY platform. Whether you need help with hiring, freelancing, payments, or account management, I am here to assist."
                ]
            },
            "job_search": {
                "patterns": [
                    "find work", "find jobs", "looking for work",
                    "need projects", "how to get clients", "where to find jobs",
                    "freelance work", "job search", "looking for projects",
                    "how to get hired", "no clients", "need work",
                    "earn money", "make money freelancing", "get projects"
                ],
                "responses": [
                    "Open positions are available under the Jobs tab. You may filter opportunities by skill category, budget range, and project type. I recommend also setting up job alerts to receive notifications for relevant listings.",
                    "To find work, navigate to the Jobs section and apply filters corresponding to your skill set and preferences. Completing your profile and obtaining skill badges will increase your visibility to potential clients.",
                    "The Jobs feed provides access to available projects. You can refine your search using skill, budget, and category filters. Additionally, enabling job alerts ensures you do not miss relevant opportunities.",
                    "Freelancers can browse available projects under the Jobs tab. Enhancing your profile with verified skills and a comprehensive portfolio will improve your chances of being selected."
                ]
            },
            "contracts": {
                "patterns": [
                    "my contracts", "active contracts", "contract details",
                    "project timeline", "deadline", "milestone",
                    "project progress", "check project status",
                    "ongoing projects", "project management"
                ],
                "responses": [
                    "All active contracts are accessible under Dashboard > Contracts. Each contract displays milestone progress, deadlines, payment status, and communication history.",
                    "Your contracts can be managed from Dashboard > Contracts. This section provides an overview of ongoing projects, including milestones, deliverables, and associated payments.",
                    "For a comprehensive view of your active engagements, navigate to Dashboard > Contracts. You can track milestones, mark deliverables as complete, and manage payments from this section.",
                    "Dashboard > Contracts provides a centralized view of all your ongoing projects. Milestone progress, deadlines, and payment information are displayed for each active contract."
                ]
            },
            "notifications": {
                "patterns": [
                    "notifications", "email alerts", "push notifications",
                    "notification settings", "too many emails",
                    "turn off notifications", "alert settings", "mute"
                ],
                "responses": [
                    "Notification preferences can be configured under Settings > Notifications. You may enable or disable alerts for proposals, messages, payments, and other platform activities independently.",
                    "To manage your notification settings, navigate to Settings > Notifications. Email, push, and in-app notification channels can be configured separately to suit your preferences.",
                    "If you are receiving excessive notifications, please review your settings under Settings > Notifications. You can customize which events trigger alerts.",
                    "Notification management is available at Settings > Notifications. You may mute specific alert categories or adjust delivery channels as needed."
                ]
            },
            "joke": {
                "patterns": [
                    "tell me a joke", "say something funny", "make me laugh",
                    "joke", "humor", "be funny", "entertain me",
                    "tell me something funny", "got any jokes", "comedy",
                    "make me smile"
                ],
                "responses": [
                    "Why did the freelancer bring a ladder to the interview? Because they wanted to reach new heights in their career. (I apologize — that was rather terrible.) Is there anything else I can help you with?",
                    "What is a freelancer's favorite type of music? Pro-pos-al tunes. (That was admittedly below standard.) Shall we return to platform-related matters?",
                    "Why do programmers prefer dark mode? Because light attracts bugs. (I will refrain from future comedy attempts.) How may I assist you further?",
                    "What do you call a freelancer who finishes ahead of schedule? A rare species indeed. (My humor may need refinement.) Is there a platform question I can address?",
                    "Why did the developer go to therapy? Too many unresolved issues. (I recognize that was suboptimal.) Please let me know if there is anything else I can help with."
                ]
            },
            "cancel_project": {
                "patterns": [
                    "cancel project", "end contract", "terminate project",
                    "stop working", "cancel contract", "how to cancel",
                    "cancel job", "stop project", "close project"
                ],
                "responses": [
                    "To cancel a project, navigate to Dashboard > Contracts, select the relevant project, and choose 'Cancel Contract'. Please note that escrowed funds will be handled in accordance with our dispute resolution policy.",
                    "Contract cancellation can be initiated from the project page. Be aware that any funded milestones will be subject to our escrow and dispute resolution terms.",
                    "You may end a contract from Dashboard > Contracts by selecting the project and clicking 'End Contract'. Both parties will have the opportunity to leave a review.",
                    "To terminate a project, navigate to the contract page and select 'End Contract'. Escrowed funds for completed milestones will be released accordingly."
                ]
            },
            "leave_review": {
                "patterns": [
                    "leave a review", "write review", "rate freelancer",
                    "rate client", "feedback after project", "review rating",
                    "how to review", "post review", "project review"
                ],
                "responses": [
                    "Upon project completion, you will be prompted to leave a review. Alternatively, navigate to Dashboard > Contracts > Completed and select 'Leave Review'. Reviews should be honest, specific, and constructive.",
                    "Reviews are an integral part of the SKILLIFY ecosystem. After project completion, visit the contract page to submit your feedback. Both freelancers and clients may review each other.",
                    "To leave a review, go to Dashboard > Contracts > Completed and select the relevant project. Your review should reflect your professional experience accurately.",
                    "Post-project reviews contribute to community trust. Navigate to the completed contract and select 'Leave Review'. Please ensure your feedback is professional and fact-based."
                ]
            },
            "account_settings": {
                "patterns": [
                    "my account", "account settings", "update profile",
                    "change email", "delete account", "account info",
                    "manage account", "account preferences", "notification settings",
                    "update information", "change name", "update phone"
                ],
                "responses": [
                    "Account settings can be accessed from Settings > Account. You may update your email, phone number, name, and other personal information from this section.",
                    "To manage your account, navigate to Settings > Account. This section allows you to update personal details, modify preferences, and manage security settings.",
                    "All account management functions are available under Settings > Account. You may update your information, adjust preferences, and modify security settings as needed.",
                    "Settings > Account provides comprehensive account management options, including personal information updates, email changes, and preference modifications."
                ]
            },
            "blocked_users": {
                "patterns": [
                    "block someone", "blocked users", "how to block",
                    "unblock user", "report user", "block freelancer",
                    "block client", "safety", "harassment"
                ],
                "responses": [
                    "To block a user, visit their profile and select the 'Block' option. Blocked users will be unable to contact you or view your profile. You may manage your blocked list under Settings > Privacy.",
                    "User blocking is available from any profile page. Select 'Block' to prevent further communication. Your blocked list can be managed under Settings > Privacy.",
                    "To prevent unwanted communication, visit the user's profile and select 'Block'. For cases involving harassment or safety concerns, we also recommend filing a report for investigation.",
                    "Blocking can be performed from any user's profile. For safety-related concerns, please also submit a report through the platform so our team can investigate appropriately."
                ]
            }
        }

        data_path = os.path.join(os.path.dirname(__file__), 'data', 'intents.json')
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, 'w') as f:
            json.dump(intents, f, indent=2)
        return intents

    def preprocess_text(self, text):
        text = text.lower().strip()
        text = text.translate(str.maketrans('', '', string.punctuation))
        tokens = nltk.word_tokenize(text)
        corrected_tokens = []
        for t in tokens:
            if t in self.stop_words:
                continue
            if t in self.spell_dictionary or t in self.learned_corrections:
                corrected_tokens.append(self.lemmatizer.lemmatize(t))
            else:
                corrected_tokens.append(self.lemmatizer.lemmatize(t))
        return corrected_tokens

    def calculate_similarity(self, text1_tokens, text2_tokens):
        if not text1_tokens or not text2_tokens:
            return 0
        intersection = set(text1_tokens) & set(text2_tokens)
        union = set(text1_tokens) | set(text2_tokens)
        if not union:
            return 0
        return len(intersection) / len(union)

    def get_partial_match_score(self, text, pattern):
        text = text.lower()
        pattern = pattern.lower()
        if text == pattern:
            return 1.0
        if pattern in text:
            return 0.75
        if text in pattern:
            return 0.6
        text_words = set(text.split())
        pattern_words = set(pattern.split())
        if not pattern_words:
            return 0
        overlap = len(text_words & pattern_words) / len(pattern_words)
        if overlap < 0.4:
            return 0
        return overlap * 0.5

    def recognize_intent(self, text):
        text_lower = text.lower().strip()
        text_normalized = self.normalize_texting_style(text_lower)

        keyword_intents = {
            'find_freelancer': ['find freelancer', 'hire someone', 'find talent',
                               'looking for freelancer', 'hire developer', 'hire designer',
                               'find expert', 'find a professional', 'recruit',
                               'find me a', 'need a developer', 'need a designer',
                               'need a writer', 'need a professional', 'looking for a developer',
                               'looking for a designer', 'looking for a writer', 'looking for a professional',
                               'hire a developer', 'hire a designer', 'hire a writer',
                               'find me someone', 'find someone who', 'need someone who',
                               'need someone to', 'looking for someone', 'searching for',
                               'hunting for', 'scouting for', 'looking for a dev',
                               'need a dev', 'need a designer', 'looking for talent',
                               'where can i find', 'where to find', 'help me find',
                               'help me hire', 'i need', 'i want', 'im looking',
                               'im searching', 'im hunting', 'im looking for',
                               'anyone who can', 'anyone know', 'know any',
                               'suggest a', 'recommend a', 'recommend someone',
                               'who can do', 'who does', 'who is good at',
                               'best freelancer', 'best developer', 'best designer',
                               'top rated', 'highly rated', 'experienced'],
            'post_job': ['post a job', 'create job', 'post project', 'new job listing',
                        'list a project', 'publish job', 'where to post job',
                        'post a gig', 'create a gig', 'list a gig',
                        'post an internship', 'list internship', 'post internship',
                        'hire interns', 'recruiter mode', 'hr mode', 'list job',
                        'need to post', 'want to post', 'how to post',
                        'where to post', 'posting a job', 'creating a job',
                        'posting a project', 'creating a project',
                        'i want to hire', 'i need to hire', 'looking to hire',
                        'hiring for', 'recruiting for', 'need someone for',
                        'got a project', 'have a project', 'have a gig',
                        'need work done', 'need something built', 'need something done',
                        'need a website', 'need an app', 'need design'],
            'proposals_bids': ['send proposal', 'write proposal', 'submit bid',
                              'apply for job', 'bid on project', 'proposal tips',
                              'my proposals', 'received proposals', 'send a bid',
                              'write a bid', 'submit a proposal', 'apply for gig',
                              'bid on gig', 'proposal help', 'how to propose',
                              'how to bid', 'how to apply', 'how to submit',
                              'im bidding', 'im applying', 'im proposing',
                              'bid amount', 'proposal amount', 'my bid',
                              'accepted proposal', 'pending proposal', 'rejected proposal',
                              'proposal status', 'bid status', 'view proposals',
                              'view bids', 'check proposals', 'check bids'],
            'payments': ['pay freelancer', 'escrow', 'milestone payment', 'release payment',
                        'payment method', 'add payment', 'secure payment', 'fund milestone',
                        'pay for project', 'payment process', 'how to pay',
                        'where to pay', 'payment options', 'payment info',
                        'add card', 'add bank', 'payment failed', 'payment error',
                        'refund', 'charge', 'charged', 'billing', 'invoice',
                        'receipt', 'transaction', 'transfer money', 'send money',
                        'fund project', 'fund escrow', 'release funds',
                        'approve payment', 'confirm payment', 'payment pending'],
            'withdraw_earnings': ['withdraw money', 'get paid', 'withdraw earnings',
                                 'cash out', 'my balance', 'payout', 'earnings',
                                 'bank transfer', 'withdrawal', 'withdraw cash',
                                 'get my money', 'take out money', 'transfer earnings',
                                 'payout method', 'payout options', 'when do i get paid',
                                 'payment schedule', 'payment cycle', 'withdrawal request',
                                 'withdrawal pending', 'withdrawal failed',
                                 'how do i get paid', 'how to withdraw'],
            'fees_commission': ['service fee', 'commission', 'what are the fees',
                               'platform fee', 'skillify fee', 'how much do you charge',
                               'pricing', 'percentage', 'take from payment',
                               'what are your fees', 'your fees', 'fee structure',
                               'how much is the fee', 'cost of using', 'cost to use',
                               'how much does it cost', 'what does it cost',
                               'how much is skillify', 'pricing plan', 'pricing info',
                               'fee breakdown', 'fee details', 'commission rate',
                               'service charge', 'platform charge', 'processing fee',
                               'transaction fee', 'hidden fees', 'no hidden fees',
                               'premium pricing', 'free plan', 'paid plan'],
            'profile_setup': ['set up profile', 'complete profile', 'edit profile',
                             'update bio', 'add skills', 'portfolio', 'profile picture',
                             'professional bio', 'profile optimization', 'resume', 'cv',
                             'generate resume', 'generate cv', 'ats resume', 'ats cv',
                             'edit my profile', 'update my profile', 'change profile',
                             'profile photo', 'profile image', 'upload photo',
                             'add portfolio', 'portfolio samples', 'work samples',
                             'showcase work', 'display work', 'professional summary',
                             'about me', 'bio section', 'skills section',
                             'profile help', 'profile tips', 'profile guide',
                             'how to setup', 'how to edit', 'how to update'],
            'skills_badges': ['add skills', 'skill assessment', 'badge', 'verified skill',
                             'take test', 'skill quiz', 'verify skills', 'endorse',
                             'how to get badge', 'verified badge', 'skill test',
                             'skill exam', 'skill certification', 'prove skills',
                             'skill verification', 'badge verification', 'quiz', 'quizzes',
                             'take quiz', 'python quiz', 'webdev quiz', 'appdev quiz',
                             'react quiz', 'dsa quiz', 'coding quiz', 'assessment',
                             'python', 'javascript', 'react', 'java', 'c++', 'algorithms',
                             'binary search', 'hash table', 'data structures', 'dsa',
                             'take assessment', 'skill level', 'earn badge', 'get badge',
                             'skill badge', 'streak', 'xp', 'level up', 'certificate'],
            'disputes_issues': ['dispute', 'report freelancer', 'report client',
                               'unhappy with work', 'work not delivered', 'mediation',
                               'resolve dispute', 'cancel project', 'project dispute',
                               'file dispute', 'open dispute', 'dispute resolution',
                               'report problem', 'report issue', 'file complaint',
                               'not satisfied', 'quality issue', 'work not done',
                               'freelancer not responding', 'client not responding',
                               'project stuck', 'project failed', 'refund request',
                               'money back', 'get refund', 'dispute help'],
            'how_skillify_works': ['how does this work', 'how does skillify work',
                                  'what is skillify', 'getting started', 'new here',
                                  'how does this platform work', 'introduction',
                                  'guide for beginners', 'what is this app',
                                  'how to use', 'how it works', 'platform overview',
                                  'getting started guide', 'beginner guide',
                                  'help me get started', 'im new', 'just joined',
                                  'first time', 'first time here', 'new user',
                                  'what can i do', 'what features', 'platform features',
                                  'how do i start', 'where do i start'],
            'messaging': ['send message', 'chat with freelancer', 'message someone',
                         'inbox', 'direct message', 'contact freelancer', 'dm',
                         'start conversation', 'communicate with', 'send dm',
                         'send a message', 'message them', 'chat with them',
                         'talk to them', 'reach out', 'contact them',
                         'inbox message', 'inbox chat', 'message inbox',
                         'open chat', 'start chatting', 'begin conversation',
                         'how to message', 'how to chat', 'how to contact'],
            'membership_plans': ['membership', 'premium', 'pro plan', 'upgrade',
                                'free plan', 'subscription', 'membership cost',
                                'upgrade account', 'paid plan', 'premium features',
                                'membership plan', 'membership options', 'membership tiers',
                                'free vs premium', 'compare plans', 'plan comparison',
                                'upgrade to premium', 'become premium', 'get premium',
                                'premium benefits', 'premium perks', 'premium advantages',
                                'what do i get', 'whats included', 'plan features',
                                'membership help', 'membership info'],
            'verification': ['verify account', 'identity verification', 'verified',
                            'how to verify', 'verification process', 'verify identity',
                            'account verification', 'kyc', 'government id',
                            'verify my account', 'get verified', 'become verified',
                            'verification badge', 'trust verification',
                            'id verification', 'document verification',
                            'upload id', 'upload document', 'submit id',
                            'verification status', 'verification help',
                            'how long does verification take', 'verification time'],
            'password_reset': ['forgot password', 'reset password', 'change password',
                              'login problem', 'locked out', 'forgot my password',
                              'need new password', "can't access account",
                              'cant login', 'cant sign in', 'cannot login',
                              'cannot sign in', 'login issue', 'sign in issue',
                              'password help', 'change my password',
                              'reset my password', 'forgot my login',
                              'lost password', 'password lost', 'account locked',
                              'locked out of account', 'help me login',
                              'help me sign in', 'login help'],
            'contact_support': ['contact support', 'phone number', 'email',
                               'how to reach', 'customer service', 'human agent',
                               'live chat', 'talk to human', 'support email',
                               'how can i contact', 'how do i contact', 'reach you',
                               'talk to someone', 'get in touch', 'talk to human',
                               'contact us', 'customer support', 'support team',
                               'help desk', 'support desk', 'ticket',
                               'submit ticket', 'open ticket', 'support ticket',
                               'call support', 'email support', 'chat support',
                               'real person', 'actual person', 'human help',
                               'support hours', 'support contact'],
            'feedback': ['awesome', 'amazing', 'fantastic', 'wonderful', 'excellent',
                        'brilliant', 'outstanding', 'superb', 'terrific', 'great job',
                        'love it', 'best platform', 'you rock', 'well done',
                        'keep it up', 'appreciate', 'thank you so much', 'love skillify',
                        'you are awesome', 'you are great', 'you are amazing',
                        'great work', 'nice work', 'good work', 'solid work',
                        'this is great', 'this is amazing', 'this is awesome',
                        'really good', 'really helpful', 'so helpful',
                        'love this', 'adore this', 'enjoy this',
                        'you helped me', 'thanks for helping', 'thanks for the help',
                        'appreciate it', 'thanks a lot', 'thx', 'ty',
                        'youre the best', 'ur the best', 'best ever',
                        'fire', 'lit', 'goat', 'bussin', 'slaps'],
            'job_search': ['find work', 'find jobs', 'looking for work', 'need projects',
                          'how to get clients', 'freelance work', 'job search',
                          'internship', 'internships', 'find internship', 'find internships',
                          'apply for internship', 'software internship', 'intern opportunities',
                          'looking for projects', 'how to get hired', 'no clients',
                          'need work', 'earn money', 'make money', 'find a job',
                          'search for jobs', 'look for jobs', 'job hunting',
                          'gig hunting', 'project hunting', 'client hunting',
                          'how to find work', 'where to find work',
                          'no projects', 'need income', 'need clients',
                          'looking for gigs', 'searching for projects',
                          'how to get work', 'where to get work',
                          'freelance tips', 'freelance advice'],
            'contracts': ['my contracts', 'active contracts', 'contract details',
                         'project timeline', 'deadline', 'milestone', 'project progress',
                         'check project status', 'ongoing projects', 'current projects',
                         'active projects', 'project details', 'contract info',
                         'project info', 'project status', 'contract status',
                         'milestone progress', 'project timeline', 'deadline info',
                         'track project', 'track progress', 'check progress',
                         'view contracts', 'view projects', 'project list',
                         'contract list', 'my projects', 'my work'],
            'notifications': ['notifications', 'email alerts', 'push notifications',
                             'notification settings', 'too many emails', 'turn off notifications',
                             'mute', 'alert settings', 'notification preferences',
                             'email notifications', 'push alerts', 'in-app notifications',
                             'notification help', 'notification options',
                             'manage notifications', 'notification settings',
                             'too many notifications', 'stop notifications',
                             'disable notifications', 'enable notifications',
                             'notification frequency', 'notification schedule'],
            'cancel_project': ['cancel project', 'end contract', 'terminate project',
                              'stop working', 'cancel contract', 'how to cancel',
                              'cancel job', 'close project', 'end project',
                              'terminate job', 'stop project', 'abort project',
                              'cancel my project', 'cancel the project',
                              'end my contract', 'terminate my contract',
                              'project cancellation', 'contract cancellation',
                              'how to end', 'how to stop', 'how to close'],
            'leave_review': ['leave a review', 'write review', 'rate freelancer',
                            'rate client', 'feedback after project', 'review rating',
                            'how to review', 'post review', 'submit review',
                            'give review', 'share feedback', 'rate experience',
                            'review experience', 'feedback form', 'review form',
                            'star rating', 'rating system', 'review system',
                            'how to rate', 'where to review', 'review help'],
            'blocked_users': ['block someone', 'blocked users', 'how to block',
                             'unblock user', 'report user', 'safety', 'harassment',
                             'block user', 'unblock someone', 'blocked list',
                             'block list', 'user blocking', 'report harassment',
                             'report abuse', 'safety concern', 'safety issue',
                             'unwanted contact', 'spam', 'spam messages',
                             'harassing messages', 'threatening messages',
                             'block contact', 'unblock contact'],
            'joke': ['tell me a joke', 'say something funny', 'make me laugh',
                    'got any jokes', 'tell me something funny', 'be funny',
                    'make me smile', 'tell joke', 'give me a joke', 'tell a joke',
                    'crack a joke', 'tell me a joke please', 'humour', 'humor',
                    'use humor', 'use humour', 'be humorous', 'jokes', 'joke',
                    'something funny', 'make me giggle', 'make me chuckle',
                    'humor me', 'entertain me', 'make me happy',
                    'cheer me up', 'funny please', 'joke time',
                    'comedy time', 'laugh please', 'humor please'],
            'goodbye': ['bye', 'goodbye', 'see you', 'later', 'good night',
                        'take care', 'see ya', 'ciao', 'adios', 'farewell',
                        'gotta go', 'bye bye', 'see you later',
                        'that\'s all', 'that is all', 'i\'m done', 'im done',
                        'nothing else', 'no more questions', 'no more help needed',
                        'i think that\'s all', 'i think that is all',
                        'that answers my question', 'that answers it',
                        'perfect thanks', 'perfect thank you', 'that\'s perfect',
                        'got it', 'gotcha', 'understood',
                        'sounds good', 'sounds great', 'cool thanks',
                        'awesome thanks', 'nice thanks', 'great thanks',
                        'thanks i\'m good', 'thanks im good', 'im good now',
                        'i\'m good now', 'no im good', 'no i\'m good',
                        'that works', 'that works for me', 'you\'ve been helpful',
                        'you have been helpful', 'you helped a lot',
                        'really helpful thanks', 'this helped thanks',
                        'all good', 'im all set', 'i\'m all set',
                        'i think im good', 'i think i\'m good',
                        'think im good', 'think i\'m good',
                        'no that\'s it', 'no thats it', 'nah im good',
                        'nah i\'m good', 'nah that\'s all', 'nah thats all',
                        'nope im good', 'nope thats all', 'nope i\'m good',
                        'heading out', 'gotta run', 'gotta bounce',
                        'i should go', 'let me go', 'let me get going',
                        'time to go', 'time to head out', 'wrap this up',
                        'let\'s wrap this up', 'lets wrap this up',
                        'you can close this', 'end chat', 'end conversation',
                        'cya', 'ttyl', 'brb', 'gtg', 'g2g',
                        'ilysm', 'ily', 'ilu', 'luv u', 'love u',
                        'catch ya later', 'peace out', 'im out',
                        'im ghost', 'gotta dip', 'gotta dip',
                        'see ya later', 'catch you later', 'talk later',
                        'chat later', 'hit me up later', 'hmu later',
                        'msg me later', 'dm me later'],
            'capabilities': ['what can you do', 'your features', 'what are you capable of',
                            'how can you help', 'what do you know', 'capabilities',
                            'your abilities', 'your skills', 'what skills do you have',
                            'what do you know about', 'tell me about yourself',
                            'who are you', 'what are you', 'are you a bot',
                            'are you human', 'are you real', 'ai bot',
                            'chatbot', 'virtual assistant', 'digital assistant'],
            'emotional_sadness': ['i feel sad', 'i am sad', 'im sad', 'feeling down', 'feeling terrible', 'having a bad day',
                                 'i cried', 'heartbroken', 'so upset', 'nobody cares', 'hopeless', 'i feel useless',
                                 'everything is going wrong', 'i feel lonely', 'im depressed', 'feeling low', 'feeling miserable',
                                 'sad today', 'i am down', 'im down', 'feeling empty'],
            'emotional_excitement': ['i am so excited', 'im excited', 'i am happy', 'im happy', 'im hyped', 'lets go', 'i aced it',
                                    'i passed', 'i won', 'so proud', 'thrilled', 'this is amazing', 'i did it', 'got my certificate',
                                    'scored 100', 'i built my app', 'celebrating', 'super excited', 'so happy', 'i finally solved it',
                                    'it worked', 'proud of myself', 'great news'],
            'emotional_frustration': ['i am so angry', 'im angry', 'i am frustrated', 'im frustrated', 'i hate this', 'this sucks',
                                     'why is coding so hard', 'bugs everywhere', 'i want to give up', 'nothing works', 'annoyed',
                                     'pissed off', 'so furious', 'stupid error', 'i hate errors', 'so annoying', 'cant solve this',
                                     'pulling my hair out', 'im mad', 'furious', 'broken code', 'wasted hours', 'driving me crazy'],
            'emotional_stress_anxiety': ['i am stressed', 'im stressed', 'exam anxiety', 'im overwhelmed', 'too much work', 'burnout',
                                        'i feel burnt out', 'so much pressure', 'panic', 'cant sleep', 'im nervous', 'scared of interview',
                                        'im anxious', 'stressed out', 'overwhelmed', 'freaking out', 'too hard', 'stressing me out'],
            'emotional_gratitude_love': ['i love you', 'you are the best', 'youre awesome', 'you made my day', 'thank you so much',
                                        'youre so sweet', 'i appreciate you', 'best bot ever', 'thank you skille', 'thank you skillie', 'youre amazing',
                                        'love you', 'you are awesome', 'thanks a lot', 'you rock', 'you helped me so much',
                                        'thanks buddy', 'good bot', 'best ai', 'ilysm', 'ily', 'ilu', 'luv u', 'love u'],
            'emotional_motivation': ['motivate me', 'give me motivation', 'i need inspiration', 'cheer me up', 'encourage me',
                                    'can i do this', 'is it too late to learn coding', 'believe in me', 'pep talk', 'inspire me',
                                    'give me a quote', 'i lack motivation', 'need energy', 'help me stay motivated',
                                    'im doubting myself', 'feel like giving up', 'want to quit'],
            'emotional_confusion': ['i am confused', 'im confused', 'i dont understand anything', 'what should i learn',
                                   'where do i start', 'help me figure this out', 'brain hurts', 'so confused', 'im lost',
                                   'explain simply', 'too complicated', 'im totally lost', 'dont get it']
        }

        for intent, keywords in keyword_intents.items():
            for kw in keywords:
                if kw in text_lower or kw in text_normalized:
                    return intent, 0.95

        text_tokens = self.preprocess_text(text_normalized)
        best_intent = None
        best_score = 0

        for intent, data in self.intent_data.items():
            for pattern in data['patterns']:
                pattern_tokens = self.preprocess_text(pattern)
                similarity = self.calculate_similarity(text_tokens, pattern_tokens)
                partial_score = self.get_partial_match_score(text_normalized, pattern)
                score = max(similarity, partial_score)

                if score > best_score:
                    best_score = score
                    best_intent = intent

        if intent_data := self.user_patterns.get(text_lower):
            if best_score < 0.4:
                return intent_data['intent'], 0.7

        if best_score < 0.35:
            corrected_intent, corrected_score, corrected_text = self.fuzzy_intent_match(text_lower)
            if corrected_intent and corrected_score >= 0.6:
                return corrected_intent, corrected_score
            return "unknown", 0

        return best_intent, best_score

    def extract_entities(self, text):
        entities = {}

        order_pattern = r'(?i)(?:order|tracking|project\s*(?:id|#))\s*(?:number|#|:)?\s*(\w+)'
        match = re.search(order_pattern, text)
        if match:
            entities['project_id'] = match.group(1)

        email_pattern = r'[\w.+-]+@[\w-]+\.[\w.-]+'
        match = re.search(email_pattern, text)
        if match:
            entities['email'] = match.group(0)

        phone_pattern = r'(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        match = re.search(phone_pattern, text)
        if match:
            entities['phone'] = match.group(0)

        money_pattern = r'(?i)(?:\$|usd|inr|eur|gbp)\s*(\d[\d,]*\.?\d*)'
        match = re.search(money_pattern, text)
        if match:
            entities['amount'] = match.group(1).replace(',', '')

        text_normalized = self.normalize_texting_style(text.lower().strip())

        style_emotion = self.detect_emotion_from_style(text)

        sentiment_words = {
            'positive': ['good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'happy',
                        'wonderful', 'fantastic', 'best', 'thank', 'thanks', 'please',
                        'perfect', 'brilliant', 'outstanding', 'fire', 'lit', 'goat',
                        'slay', 'bussin', 'iconic', 'slaps', 'hits different',
                        'no cap', 'fr', 'deadass', 'lowkey love', 'highkey love'],
            'negative': ['bad', 'terrible', 'awful', 'worst', 'hate', 'angry', 'frustrated',
                        'annoying', 'useless', 'stupid', 'broken', 'fail', 'horrible', 'poor',
                        'disappointed', 'scam', 'fraud', 'unacceptable', 'trash', 'garbage',
                        'cringe', 'sus', 'cap', 'mid', 'whack', 'trash', 'garbage',
                        'ngl this sucks', 'deadass terrible', 'lowkey hate'],
            'neutral': ['ok', 'okay', 'k', 'sure', 'alright', 'fine', 'got it',
                       'understood', 'noted', 'right', 'yeah', 'yes', 'yep', 'nah',
                       'cool', 'nice', 'good', 'great', 'awesome']
        }

        text_lower = text.lower()
        text_normalized_lower = text_normalized.lower()

        pos_count = 0
        neg_count = 0

        for w in sentiment_words['positive']:
            if w in text_lower or w in text_normalized_lower:
                pos_count += 1
        for w in sentiment_words['negative']:
            if w in text_lower or w in text_normalized_lower:
                neg_count += 1

        slang_positive = ['fire', 'lit', 'goat', 'slay', 'bussin', 'iconic', 'slaps',
                         'hits different', 'no cap', 'fr', 'deadass', 'w', 'w take',
                         'based', 'valid', 'sheesh']
        slang_negative = ['trash', 'garbage', 'cringe', 'sus', 'cap', 'mid', 'whack',
                         'l', 'l take', 'ratio', 'down bad', 'touch grass',
                         'brain rot', ' cope', 'seethe', 'mald']

        for s in slang_positive:
            if s in text_lower or s in text_normalized_lower:
                pos_count += 1
        for s in slang_negative:
            if s in text_lower or s in text_normalized_lower:
                neg_count += 1

        if style_emotion.get('emoji_sentiment') == 'positive':
            pos_count += 1
        elif style_emotion.get('emoji_sentiment') == 'negative':
            neg_count += 1

        if style_emotion.get('style_sentiment') == 'positive':
            pos_count += 1
        elif style_emotion.get('style_sentiment') == 'negative':
            neg_count += 1

        if pos_count > neg_count:
            entities['sentiment'] = 'positive'
        elif neg_count > pos_count:
            entities['sentiment'] = 'negative'
        else:
            entities['sentiment'] = 'neutral'

        entities['emotion'] = style_emotion
        entities['tokens'] = self.preprocess_text(text_normalized)
        entities['original_text'] = text
        entities['normalized_text'] = text_normalized

        return entities

    def learn_new_pattern(self, intent, pattern, response=None):
        if intent not in self.intent_data:
            self.intent_data[intent] = {
                'patterns': [],
                'responses': [response] if response else []
            }

        self.intent_data[intent]['patterns'].append(pattern)

        if response and response not in self.intent_data[intent]['responses']:
            self.intent_data[intent]['responses'].append(response)

        self.user_patterns[pattern.lower()] = {'intent': intent}
        self._save_intent_data()

    def _save_intent_data(self):
        data_path = os.path.join(os.path.dirname(__file__), 'data', 'intents.json')
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, 'w') as f:
            json.dump(self.intent_data, f, indent=2)

    def detect_conversation_end(self, text, conversation_context=None):
        text_lower = text.lower().strip()
        words = text_lower.split()
        word_count = len(words)

        short_ack = [
            'ok', 'okay', 'k', 'cool', 'nice', 'good', 'great', 'awesome',
            'perfect', 'great', 'thanks', 'thank', 'thx', 'ty', 'got it',
            'understood', 'noted', 'makes sense', 'right', 'yeah', 'yes',
            'yep', 'yup', 'sure', 'alright', 'fine', 'sweet', 'brilliant',
            'fantastic', 'wonderful', 'helpful', 'excellent', 'superb'
        ]

        ending_phrases = [
            'i\'m good', 'im good', 'that\'s all', 'thats all',
            'nothing else', 'no more', 'i think i\'m good',
            'i think im good', 'that answers', 'that works',
            'you\'ve been helpful', 'you have been helpful',
            'all good', 'i\'m all set', 'im all set',
            'heading out', 'gotta go', 'gotta run', 'gotta bounce',
            'i should go', 'let me go', 'time to go',
            'wrap this up', 'end chat', 'end conversation',
            'nah im good', 'nah i\'m good', 'nope im good',
            'nope i\'m good', 'no that\'s it', 'no thats it'
        ]

        for phrase in ending_phrases:
            if phrase in text_lower:
                return True, 0.9

        if word_count <= 2 and text_lower in short_ack:
            if conversation_context and len(conversation_context) >= 2:
                recent_intents = [
                    c.get('intent', '') for c in conversation_context[-3:]
                    if isinstance(c, dict)
                ]
                support_intents = [
                    'technical_support', 'password_reset', 'disputes_issues',
                    'payments', 'fees_commission', 'verification',
                    'how_skillify_works', 'capabilities', 'contact_support'
                ]
                if any(i in support_intents for i in recent_intents):
                    return True, 0.7

        gratitude_closing = [
            r'^(thanks?|thank you|thx|ty)[\s!.]*$',
            r'^(thanks?|thank you|thx|ty)\s+(a lot|so much|a bunch|for everything)[\s!.]*$',
            r'^(really |very )?(helpful|useful|great|awesome|perfect|good)\s*(thanks?|thank you)?[\s!.]*$'
        ]
        for pattern in gratitude_closing:
            if re.match(pattern, text_lower):
                if conversation_context and len(conversation_context) >= 2:
                    return True, 0.75

        if word_count <= 3 and any(w in text_lower for w in ['bye', 'later', 'night']):
            return True, 0.95

        if conversation_context and len(conversation_context) >= 3:
            recent_msgs = conversation_context[-3:]
            short_count = sum(
                1 for c in recent_msgs
                if isinstance(c, dict) and len(c.get('user_input', '').split()) <= 2
            )
            if short_count >= 2 and word_count <= 2:
                return True, 0.6

        return False, 0

    def update_from_feedback(self, user_input, expected_intent, was_correct):
        if not was_correct:
            tokens = self.preprocess_text(user_input)
            for intent, data in self.intent_data.items():
                if intent == expected_intent:
                    data['patterns'].append(user_input.lower())
                    break

            if expected_intent not in self.intent_data:
                self.intent_data[expected_intent] = {
                    'patterns': [user_input.lower()],
                    'responses': []
                }

        self._save_intent_data()

    def _build_contextual_corrections(self):
        return {
            'loose': {
                'correct': 'lose',
                'context_words': ['weight', 'pounds', 'kg', 'fat', 'diet', 'exercise',
                                  'bet', 'money', 'game', 'match', 'race', 'job',
                                  'opportunity', 'chance', 'hope', 'mind', 'control'],
                'wrong_context_words': ['change', 'coins', 'thread', 'fabric', 'fit',
                                        'tooth', 'leaf', 'wire', 'cannon', 'screw',
                                        'tile', 'floor', 'pants', 'shoe', 'binding'],
                'base_prob': 0.7
            },
            'lose': {
                'correct': 'loose',
                'context_words': ['change', 'coins', 'thread', 'fabric', 'fit',
                                  'tooth', 'leaf', 'wire', 'cannon', 'screw',
                                  'tile', 'floor', 'pants', 'shoe', 'binding'],
                'wrong_context_words': ['weight', 'pounds', 'kg', 'fat', 'diet',
                                        'bet', 'money', 'game', 'match', 'race',
                                        'job', 'opportunity', 'chance', 'hope'],
                'base_prob': 0.6
            },
            'their': {
                'correct': "they're",
                'context_words': ['going', 'coming', 'doing', 'being', 'having',
                                  'not', 'here', 'there', 'right', 'wrong',
                                  'nice', 'good', 'bad', 'amazing', 'terrible'],
                'wrong_context_words': ['car', 'house', 'dog', 'cat', 'book',
                                        'phone', 'name', 'idea', 'problem', 'way'],
                'base_prob': 0.4
            },
            "they're": {
                'correct': 'their',
                'context_words': ['car', 'house', 'dog', 'cat', 'book',
                                  'phone', 'name', 'idea', 'problem', 'way',
                                  'kids', 'parents', 'friends', 'team', 'company'],
                'wrong_context_words': ['going', 'coming', 'doing', 'being', 'having',
                                        'not', 'here', 'there', 'right', 'wrong'],
                'base_prob': 0.4
            },
            'your': {
                'correct': "you're",
                'context_words': ['amazing', 'awesome', 'great', 'good', 'bad',
                                  'right', 'wrong', 'welcome', 'sure', 'going',
                                  'coming', 'doing', 'being', 'having', 'not',
                                  'so', 'very', 'really', 'best', 'worst',
                                  'pretty', 'beautiful', 'smart', 'funny'],
                'wrong_context_words': ['car', 'house', 'dog', 'cat', 'book',
                                        'phone', 'name', 'idea', 'problem', 'way',
                                        'kids', 'parents', 'friends', 'profile', 'account'],
                'base_prob': 0.65
            },
            "you're": {
                'correct': 'your',
                'context_words': ['car', 'house', 'dog', 'cat', 'book',
                                  'phone', 'name', 'idea', 'problem', 'way',
                                  'kids', 'parents', 'friends', 'profile', 'account'],
                'wrong_context_words': ['going', 'coming', 'doing', 'being', 'having',
                                        'not', 'right', 'wrong', 'welcome', 'sure'],
                'base_prob': 0.4
            },
            'youre': {
                'correct': "you're",
                'context_words': ['amazing', 'awesome', 'great', 'good', 'bad',
                                  'right', 'wrong', 'welcome', 'sure', 'going',
                                  'coming', 'doing', 'being', 'having', 'not',
                                  'so', 'very', 'really', 'best', 'worst',
                                  'pretty', 'beautiful', 'smart', 'funny',
                                  'the', 'a', 'an', 'my', 'his', 'her', 'our',
                                  'their', 'this', 'that'],
                'wrong_context_words': ['car', 'house', 'dog', 'cat', 'book'],
                'base_prob': 0.95
            },
            'there': {
                'correct': 'their',
                'context_words': ['car', 'house', 'dog', 'cat', 'book',
                                  'phone', 'name', 'idea', 'problem', 'way',
                                  'kids', 'parents', 'friends', 'team', 'company',
                                  'website', 'profile', 'account', 'project'],
                'wrong_context_words': ['is', 'are', 'was', 'were', 'will',
                                        'going', 'coming', 'here', 'not', 'no'],
                'base_prob': 0.55
            },
            'their': {
                'correct': "they're",
                'context_words': ['going', 'coming', 'doing', 'being', 'having',
                                  'not', 'here', 'there', 'right', 'wrong',
                                  'nice', 'good', 'bad', 'amazing', 'terrible',
                                  'ready', 'happy', 'sad', 'excited', 'planning'],
                'wrong_context_words': ['car', 'house', 'dog', 'cat', 'book',
                                        'phone', 'name', 'idea', 'problem', 'way'],
                'base_prob': 0.55
            },
            "they're": {
                'correct': 'their',
                'context_words': ['car', 'house', 'dog', 'cat', 'book',
                                  'phone', 'name', 'idea', 'problem', 'way',
                                  'kids', 'parents', 'friends', 'team', 'company'],
                'wrong_context_words': ['going', 'coming', 'doing', 'being', 'having',
                                        'not', 'here', 'there', 'right', 'wrong'],
                'base_prob': 0.4
            },
            'accept': {
                'correct': 'except',
                'context_words': ['all', 'everything', 'one', 'but', 'for',
                                  'that', 'this', 'most', 'few', 'some'],
                'wrong_context_words': ['proposal', 'job', 'payment', 'request',
                                        'terms', 'conditions', 'offer', 'bid'],
                'base_prob': 0.5
            },
            'except': {
                'correct': 'accept',
                'context_words': ['proposal', 'job', 'payment', 'request',
                                  'terms', 'conditions', 'offer', 'bid',
                                  'invitation', 'gift', 'help', 'advice'],
                'wrong_context_words': ['all', 'everything', 'one', 'but', 'for'],
                'base_prob': 0.5
            },
            'then': {
                'correct': 'than',
                'context_words': ['better', 'worse', 'more', 'less', 'greater',
                                  'smaller', 'bigger', 'faster', 'slower',
                                  'higher', 'lower', 'rather', 'other', 'instead'],
                'wrong_context_words': ['first', 'next', 'after', 'before',
                                        'will', 'can', 'would', 'could', 'should'],
                'base_prob': 0.5
            },
            'than': {
                'correct': 'then',
                'context_words': ['first', 'next', 'after', 'before', 'and',
                                  'but', 'so', 'now', 'just', 'right',
                                  'what', 'when', 'where', 'how', 'why'],
                'wrong_context_words': ['better', 'worse', 'more', 'less',
                                        'greater', 'smaller', 'bigger', 'rather'],
                'base_prob': 0.5
            },
            'affect': {
                'correct': 'effect',
                'context_words': ['the', 'this', 'that', 'its', 'my', 'your',
                                  'his', 'her', 'our', 'their', 'positive',
                                  'negative', 'significant', 'major', 'minor'],
                'wrong_context_words': ['will', 'can', 'could', 'would', 'should',
                                        'might', 'may', 'do', 'does', 'did'],
                'base_prob': 0.5
            },
            'effect': {
                'correct': 'affect',
                'context_words': ['will', 'can', 'could', 'would', 'should',
                                  'might', 'may', 'do', 'does', 'did',
                                  'how', 'what', 'to', 'not', 'really'],
                'wrong_context_words': ['the', 'this', 'that', 'its', 'my'],
                'base_prob': 0.5
            },
            'its': {
                'correct': "it's",
                'context_words': ['going', 'coming', 'doing', 'being', 'having',
                                  'not', 'a', 'an', 'the', 'time', 'important',
                                  'great', 'good', 'bad', 'nice', 'cool'],
                'wrong_context_words': ['own', 'way', 'place', 'role', 'purpose',
                                        'meaning', 'value', 'function', 'form'],
                'base_prob': 0.5
            },
            "it's": {
                'correct': 'its',
                'context_words': ['own', 'way', 'place', 'role', 'purpose',
                                  'meaning', 'value', 'function', 'form',
                                  'color', 'shape', 'size', 'name', 'time'],
                'wrong_context_words': ['going', 'coming', 'doing', 'being', 'having'],
                'base_prob': 0.4
            },
            'alot': {'correct': 'a lot', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'definately': {'correct': 'definitely', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'definatly': {'correct': 'definitely', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'definetly': {'correct': 'definitely', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'definitley': {'correct': 'definitely', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'occured': {'correct': 'occurred', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'recieve': {'correct': 'receive', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'seperate': {'correct': 'separate', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'seperator': {'correct': 'separator', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'neccessary': {'correct': 'necessary', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'necessery': {'correct': 'necessary', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'acessible': {'correct': 'accessible', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'accomodate': {'correct': 'accommodate', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'occassion': {'correct': 'occasion', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'untill': {'correct': 'until', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'wierd': {'correct': 'weird', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'beleive': {'correct': 'believe', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'truely': {'correct': 'truly', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'noticable': {'correct': 'noticeable', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'calender': {'correct': 'calendar', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'gaurd': {'correct': 'guard', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'happend': {'correct': 'happened', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'writting': {'correct': 'writing', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'enviroment': {'correct': 'environment', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'goverment': {'correct': 'government', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'maintainance': {'correct': 'maintenance', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'peice': {'correct': 'piece', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'foriegn': {'correct': 'foreign', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'supercede': {'correct': 'supersede', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'apparantly': {'correct': 'apparently', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'consistant': {'correct': 'consistent', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'existance': {'correct': 'existence', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'independant': {'correct': 'independent', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'persistant': {'correct': 'persistent', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'refered': {'correct': 'referred', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'transfered': {'correct': 'transferred', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'commiting': {'correct': 'committing', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'begining': {'correct': 'beginning', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'runing': {'correct': 'running', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'stoping': {'correct': 'stopping', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'planing': {'correct': 'planning', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'geting': {'correct': 'getting', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'makeing': {'correct': 'making', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'takeing': {'correct': 'taking', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'comeing': {'correct': 'coming', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'giveing': {'correct': 'giving', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'useing': {'correct': 'using', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'writeing': {'correct': 'writing', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'moveing': {'correct': 'moving', 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.99},
            'havent': {'correct': "haven't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'doesnt': {'correct': "doesn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'wouldnt': {'correct': "wouldn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'shouldnt': {'correct': "shouldn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'couldnt': {'correct': "couldn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'didnt': {'correct': "didn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'isnt': {'correct': "isn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'wasnt': {'correct': "wasn't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'arent': {'correct': "aren't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'wont': {'correct': "won't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'cant': {'correct': "can't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'dont': {'correct': "don't", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.85},
            'thats': {'correct': "that's", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.7},
            'whats': {'correct': "what's", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.7},
            'hows': {'correct': "how's", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.7},
            'youll': {'correct': "you'll", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.7},
            'theyll': {'correct': "they'll", 'context_words': [], 'wrong_context_words': [], 'base_prob': 0.7},
            'hell': {
                'correct': "he'll",
                'context_words': ['be', 'come', 'go', 'do', 'have', 'get', 'make', 'take', 'give', 'say', 'tell', 'need', 'want', 'like', 'help', 'know'],
                'wrong_context_words': ['no', 'yes', 'oh', 'the', 'a', 'in', 'fire', 'hellish', 'hellhole'],
                'base_prob': 0.5
            },
            'shell': {
                'correct': "she'll",
                'context_words': ['be', 'come', 'go', 'do', 'have', 'get', 'make', 'take', 'give', 'say', 'tell', 'need', 'want', 'like', 'help', 'know'],
                'wrong_context_words': ['beach', 'ocean', 'sea', 'fish', 'conch', 'crab', 'lobster'],
                'base_prob': 0.5
            },
            'were': {
                'correct': "we're",
                'context_words': ['going', 'coming', 'doing', 'being', 'having', 'not', 'here', 'there', 'ready', 'happy', 'excited', 'planning', 'working'],
                'wrong_context_words': ['they', 'the', 'a', 'at', 'in', 'on', 'from', 'to', 'with', 'for', 'about'],
                'base_prob': 0.3
            },
        }

    def _compute_context_probability(self, word, prev_word, next_word, words):
        if word not in self.contextual_corrections:
            return None, 0

        correction_data = self.contextual_corrections[word]
        target = correction_data['correct']
        context_words = correction_data['context_words']
        wrong_context_words = correction_data['wrong_context_words']
        base_prob = correction_data['base_prob']

        if not context_words:
            return target, base_prob

        score = base_prob
        all_surrounding = []
        if prev_word:
            all_surrounding.append(prev_word.lower())
        if next_word:
            all_surrounding.append(next_word.lower())
        idx = words.index(word) if word in words else -1
        if idx >= 2:
            all_surrounding.append(words[idx - 2].lower())
        if idx < len(words) - 2:
            all_surrounding.append(words[idx + 2].lower())

        context_hits = sum(1 for w in all_surrounding if w in context_words)
        wrong_hits = sum(1 for w in all_surrounding if w in wrong_context_words)

        score += context_hits * 0.15
        score -= wrong_hits * 0.15

        if prev_word and prev_word.lower() in ('to', 'too'):
            if word == 'lose' and target == 'loose':
                score -= 0.3
            if word == 'loose' and target == 'lose':
                score += 0.2

        if prev_word and prev_word.lower() in ('a', 'an', 'the', 'my', 'your', 'his', 'her', 'its', 'our', 'their'):
            if word in ('loose', 'lose') and target == 'lose':
                score += 0.1

        score = max(0, min(1, score))
        return target, score

    def contextual_correct(self, text):
        words = text.lower().split()
        if len(words) < 2:
            return text, set()

        corrected_words = []
        corrections_made = []
        corrected_indices = set()

        for i, word in enumerate(words):
            clean_word = re.sub(r'[^a-z]', '', word)
            if clean_word in self.contextual_corrections:
                prev_word = words[i - 1] if i > 0 else None
                next_word = words[i + 1] if i < len(words) - 1 else None
                target, prob = self._compute_context_probability(
                    clean_word, prev_word, next_word, words
                )
                if target and prob >= 0.85:
                    if clean_word != target:
                        corrected_words.append(target)
                        corrections_made.append({
                            'original': clean_word,
                            'corrected': target,
                            'probability': round(prob, 2),
                            'context': ' '.join(words[max(0, i - 2):i + 3])
                        })
                        if clean_word not in self.learned_corrections:
                            self.learned_corrections[clean_word] = target
                        corrected_indices.add(i)
                        continue

            corrected_words.append(word)

        if corrections_made:
            self._log_correction(text, ' '.join(corrected_words), corrections_made)

        return ' '.join(corrected_words), corrected_indices

    def _log_correction(self, original, corrected, corrections):
        log_path = os.path.join(os.path.dirname(__file__), 'data', 'correction_log.json')
        try:
            if os.path.exists(log_path):
                with open(log_path, 'r') as f:
                    log = json.load(f)
            else:
                log = {'corrections': [], 'stats': {}}

            log['corrections'].append({
                'original': original,
                'corrected': corrected,
                'details': corrections,
                'timestamp': __import__('time').time()
            })

            for c in corrections:
                key = f"{c['original']}->{c['corrected']}"
                log['stats'][key] = log['stats'].get(key, 0) + 1

            if len(log['corrections']) > 1000:
                log['corrections'] = log['corrections'][-500:]

            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, 'w') as f:
                json.dump(log, f, indent=2)
        except Exception:
            pass

    def get_correction_stats(self):
        log_path = os.path.join(os.path.dirname(__file__), 'data', 'correction_log.json')
        try:
            if os.path.exists(log_path):
                with open(log_path, 'r') as f:
                    return json.load(f).get('stats', {})
        except Exception:
            pass
        return {}

    def full_correct(self, text):
        text = self.normalize_texting_style(text)
        text, corrected_indices = self.contextual_correct(text)
        text = self.correct_spelling(text, skip_indices=corrected_indices)
        return text

    def correct_spelling(self, text, skip_indices=None):
        words = text.lower().split()
        corrected = []

        for i, word in enumerate(words):
            if skip_indices and i in skip_indices:
                corrected.append(word)
                continue

            if word in self.learned_corrections:
                corrected.append(self.learned_corrections[word])
                continue

            if word in self.typo_dictionary:
                corrected.append(self.typo_dictionary[word])
                self.learned_corrections[word] = self.typo_dictionary[word]
                continue

            if word in self.common_typos:
                corrected.append(self.common_typos[word])
                self.learned_corrections[word] = self.common_typos[word]
                continue

            if word in self.spell_dictionary:
                corrected.append(word)
                continue

            if len(word) <= 3:
                corrected.append(word)
                continue

            corrected.append(word)

        return ' '.join(corrected)

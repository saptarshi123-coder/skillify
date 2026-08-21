export const STUDENTS_DATA = [
  {
    id: "std_1",
    username: "alex_rivera",
    name: "Alex Rivera",
    major: "Computer Science Major",
    college: "Tech Institute of Technology",
    email: "alex.rivera@tit.edu",
    level: 14,
    xp: 3450,
    streak: 12,
    honorsBadge: "Honors Roll",
    lookingForInternships: true,
    bio: "Systems programming enthusiast & competitive programmer. Building performant C++ data structures and modern web apps.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBODQKML9QTCJYoZkx7q1l4hmZZjoUuKcRUiLQeXgTZup-R0Oh5yYulzUc5-5XS06ChjcpHA8SqM0lxiGKpxlH2U2zwkDv8_-GhQNOsgE6_O_z1FOnTg2hRfckqKeLz6c4NX1zhf5zdIFd9ACqR47xg8LP1Mbb52T15n3LJtX770FtO2mKmy9Gj1lsTxPdjJ1ZAx7wnkt5bwJkzLoTQIRhidZSi1LWLDbUhkaNXCfpx6Vfd7U3BWKk0IQ",
    github: "https://github.com/alexrivera",
    linkedin: "https://linkedin.com/in/alexrivera",
    skills: ["Python", "JavaScript", "C++", "DSA", "Rust", "React", "Tailwind CSS"],
    skillsProgress: [
      { name: "Frontend Development", progress: 92 },
      { name: "Data Structures & Algorithms", progress: 88 },
      { name: "C++ & Systems", progress: 95 },
      { name: "Python & AI Basics", progress: 80 }
    ],
    certificates: [
      {
        id: "cert_ar1",
        title: "C++ Advanced Systems Specialist",
        credentialId: "SKF-8921-CPP",
        score: "96%",
        issueDate: "Nov 15, 2023",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "terminal",
        category: "C++"
      },
      {
        id: "cert_ar2",
        title: "Python Pro Developer",
        credentialId: "SKF-4412-PY",
        score: "94%",
        issueDate: "Oct 20, 2023",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "verified",
        category: "Python"
      }
    ],
    projects: [
      {
        id: "proj-log-manager",
        title: "C++ High Performance Log Engine",
        language: "C++",
        category: "Systems Programming",
        stars: 48,
        likes: 124,
        description: "Doubly linked list cache logging architecture for low latency distributed systems with zero heap allocation per record.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "std_2",
    username: "sophia_chen",
    name: "Sophia Chen",
    major: "Data Science & AI",
    college: "Stanford Online",
    email: "sophia.chen@stanford.edu",
    level: 16,
    xp: 4120,
    streak: 19,
    honorsBadge: "Top Contributor",
    lookingForInternships: true,
    bio: "Passionate about NLP and neural code review pipelines. Creator of Neural Code Reviewer & transformer embeddings analyzer.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeN3wwzsfdCsKXyrCzamH7UFahjiEsN31mrLWG1dTJZdmoHpREvwUtzc4tXlXJvvZkiTKgnzU3pF6riYsq5MivKqaV7FOSlRalhtEQUPvFGe5L0xQ_iqOr2GQ3Pz5LLlZzjC1MBXQeW8LYjYcXWdLgoYanVyMrZj55berG-dYzEpklh-h-1msbQDrmiysCEy4htKIK8eDiNNtgrkzdHoQe5qGu7TPRJ6LijD9QoGtzJOWc9CIIRlbRoA",
    github: "https://github.com/sophiachen",
    linkedin: "https://linkedin.com/in/sophiachen",
    skills: ["Python", "PyTorch", "Pandas", "SQL", "Transformers", "Machine Learning", "FastAPI"],
    skillsProgress: [
      { name: "Machine Learning & NLP", progress: 96 },
      { name: "Python & Data Science", progress: 94 },
      { name: "PyTorch & Transformers", progress: 90 },
      { name: "SQL & Data Engineering", progress: 85 }
    ],
    certificates: [
      {
        id: "cert_sc1",
        title: "Machine Learning & NLP Specialist",
        credentialId: "SKF-7832-ML",
        score: "98%",
        issueDate: "Jan 12, 2024",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "psychology",
        category: "Machine Learning"
      },
      {
        id: "cert_sc2",
        title: "Deep Learning with PyTorch",
        credentialId: "SKF-3321-DL",
        score: "95%",
        issueDate: "Dec 05, 2023",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "model_training",
        category: "Deep Learning"
      },
      {
        id: "cert_sc3",
        title: "Data Structures in Python",
        credentialId: "SKF-1290-DSA",
        score: "92%",
        issueDate: "Nov 18, 2023",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "terminal",
        category: "Python"
      }
    ],
    projects: [
      {
        id: "proj-ai-code-analyzer",
        title: "Neural Code Reviewer & AST Analyzer",
        language: "Python",
        category: "Machine Learning",
        stars: 128,
        likes: 245,
        description: "Automated code reviewer with AST syntax parsing and custom transformer fine-tuned on security vulnerabilities.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "std_3",
    username: "marcus_vance",
    name: "Marcus Vance",
    major: "Cloud Architecture",
    college: "MIT Tech",
    email: "marcus.vance@mit.edu",
    level: 12,
    xp: 2980,
    streak: 8,
    honorsBadge: "Certified Pro",
    lookingForInternships: false,
    bio: "Building enterprise scalable microservices, Kubernetes operators and infrastructure as code across cloud environments.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVz8ccn75U6PEveqo2Gd6S-MC5oDR_F1Z_uvXiVjuderm9XVEYN5WJOX1Swa3MoJSmhp8M2rAa0_HfLwyDKkVtOFAbeEuJDN6yKKM2Yw5k6YFlO9AkUBNtc2Gm0XGVmnGHO8I09aegiFn8M83GDJlEVF5A9rxXnl3j_nPB_U3Fu_gnFNOBu_2hhAguZ9NVm4Fh0qWAzZKiw3qka8qBhRs2gjvBglccXSwYl-qVmhv7QPq4KydK109dyQ",
    github: "https://github.com/marcusvance",
    linkedin: "https://linkedin.com/in/marcusvance",
    skills: ["AWS", "Docker", "Kubernetes", "Go", "Terraform", "gRPC", "Linux"],
    skillsProgress: [
      { name: "Cloud & DevOps", progress: 95 },
      { name: "Kubernetes & Containers", progress: 92 },
      { name: "Golang Backend", progress: 86 },
      { name: "Distributed Systems", progress: 88 }
    ],
    certificates: [
      {
        id: "cert_mv1",
        title: "Cloud DevOps & Microservices Architect",
        credentialId: "SKF-9021-CLD",
        score: "94%",
        issueDate: "Feb 02, 2024",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "cloud",
        category: "Cloud"
      },
      {
        id: "cert_mv2",
        title: "Golang Distributed Systems",
        credentialId: "SKF-4581-GO",
        score: "90%",
        issueDate: "Oct 10, 2023",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "dns",
        category: "Go"
      }
    ],
    projects: [
      {
        id: "proj-k8s-mesh",
        title: "KubeMesh Service Router",
        language: "Go",
        category: "Cloud & DevOps",
        stars: 64,
        likes: 110,
        description: "Lightweight service mesh controller for zero-downtime canary deployments and envoy sidecar injection.",
        image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "std_4",
    username: "elena_rostova",
    name: "Elena Rostova",
    major: "Cybersecurity & InfoSec",
    college: "Berkeley Engineering",
    email: "elena.rostova@berkeley.edu",
    level: 15,
    xp: 3890,
    streak: 22,
    honorsBadge: "Security Fellow",
    lookingForInternships: true,
    bio: "Vulnerability researcher focusing on buffer overflows, kernel exploitation, and zero-day threat defense mechanisms.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKKj6LVRj6za4b24SRqtjKKmW1JLRDJRyrWiHbxQZdg_ohwzJn-vZ29CTar7loXWqesAuTWKvPhwBtjqdW-zRp31xeHQcYqI90y6UaDDhD956vasWtK7NwGrrsR4mGYWfJoG6ar3kjZKjkF7aN89NBqeRMbxHhS5b9ARyvVau1ppYmfwQI4gFOLZVr5xsl62sMNPIPm9BYZmzG_zEow5ekx7pBHmu3CCJf3h0NGCyY9F9OSX_bbqKy-A",
    github: "https://github.com/elenarostova",
    linkedin: "https://linkedin.com/in/elenarostova",
    skills: ["Network Security", "Cryptography", "C", "Linux Kernel", "Wireshark", "Reverse Engineering", "Rust"],
    skillsProgress: [
      { name: "Cybersecurity & InfoSec", progress: 98 },
      { name: "Kernel & C Exploitation", progress: 94 },
      { name: "Cryptography & Protocols", progress: 91 },
      { name: "Reverse Engineering", progress: 87 }
    ],
    certificates: [
      {
        id: "cert_er1",
        title: "Offensive Security & Network Defense",
        credentialId: "SKF-6671-SEC",
        score: "99%",
        issueDate: "Mar 14, 2024",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "security",
        category: "Cybersecurity"
      },
      {
        id: "cert_er2",
        title: "C & Kernel Exploitation Pro",
        credentialId: "SKF-5519-KERN",
        score: "96%",
        issueDate: "Jan 28, 2024",
        issuer: "Skillify AI Certification Authority",
        badgeIcon: "shield",
        category: "Security"
      }
    ],
    projects: [
      {
        id: "proj-packet-guard",
        title: "PacketGuard eBPF Firewall",
        language: "C",
        category: "Cybersecurity",
        stars: 92,
        likes: 180,
        description: "Real-time network traffic inspector and DDoS filter utilizing eBPF in Linux kernel space.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
      }
    ]
  }
];

export function getStudentById(id) {
  return STUDENTS_DATA.find(s => s.id === id || s.username === id);
}

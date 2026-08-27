package com.skillify.backend.services;

import com.skillify.backend.models.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe In-Memory and SQLite-aligned Data Access Service for the Java Backend.
 */
public class DatabaseService {
    private static DatabaseService instance;

    private User currentUser;
    private final Map<String, Internship> internships = new ConcurrentHashMap<>();
    private final Map<String, InternshipApplication> applications = new ConcurrentHashMap<>();
    private final Map<String, Project> projects = new ConcurrentHashMap<>();
    private final Map<String, Skill> skills = new ConcurrentHashMap<>();

    private DatabaseService() {
        initDefaultData();
    }

    public static synchronized DatabaseService getInstance() {
        if (instance == null) {
            instance = new DatabaseService();
        }
        return instance;
    }

    private void initDefaultData() {
        // Initialize Default User Profile
        currentUser = new User(
                "usr_guest",
                "Guest User",
                "guest@skillify.ai",
                "guest",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
                1,
                0,
                0
        );
        currentUser.getSkillsProgress().add(new User.SkillProgress("Frontend Development", 0));
        currentUser.getSkillsProgress().add(new User.SkillProgress("Data Structures & Algorithms", 0));
        currentUser.getSkillsProgress().add(new User.SkillProgress("UI/UX Design", 0));
        currentUser.getSkillsProgress().add(new User.SkillProgress("Python & Data Science", 0));

        // Initialize Initial Internships
        addInternship(new Internship(
                "int-1",
                "Full Stack Developer Intern",
                "TechCorp Labs",
                "Bangalore, India",
                "Hybrid",
                "₹25,000 / month",
                "6 Months",
                "SDE",
                Arrays.asList("React", "Node.js", "TypeScript", "Tailwind CSS"),
                "2026-09-30",
                "Work on high-scale web applications, microservices, and modern user experiences.",
                true
        ));

        addInternship(new Internship(
                "int-2",
                "AI & Machine Learning Intern",
                "NeuralFlow Systems",
                "Hyderabad, India",
                "Remote",
                "₹30,000 / month",
                "3 Months",
                "AI/ML",
                Arrays.asList("Python", "PyTorch", "NLP", "FastAPI"),
                "2026-10-15",
                "Build state-of-the-art transformer pipelines, LLM fine-tuning, and inference APIs.",
                true
        ));

        addInternship(new Internship(
                "int-3",
                "UI/UX Design Intern",
                "PixelCraft Studio",
                "Mumbai, India",
                "Remote",
                "₹20,000 / month",
                "4 Months",
                "UI/UX",
                Arrays.asList("Figma", "Design Systems", "Prototyping", "User Research"),
                "2026-09-25",
                "Craft stunning mobile and web design systems with human-centered interaction design.",
                false
        ));

        addInternship(new Internship(
                "int-4",
                "Data Science & Analytics Intern",
                "DataPulse Analytics",
                "Remote, India",
                "Remote",
                "₹22,000 / month",
                "6 Months",
                "Data Science",
                Arrays.asList("Python", "SQL", "Pandas", "PowerBI"),
                "2026-10-01",
                "Perform statistical modeling, predictive insights, and ETL pipeline optimization.",
                false
        ));

        addInternship(new Internship(
                "int-5",
                "Android & Mobile Developer Intern",
                "AppVibe Mobile",
                "Pune, India",
                "On-site",
                "₹28,000 / month",
                "6 Months",
                "Engineering",
                Arrays.asList("Kotlin", "Android SDK", "Jetpack Compose", "Capacitor"),
                "2026-10-10",
                "Develop fluid mobile interfaces and offline-first reactive Android mobile applications.",
                true
        ));

        // Initialize Initial Showcase Projects
        addProject(new Project(
                "proj-1",
                "Skillify AI Mobile Ecosystem",
                "AI-driven student learning, freelancing platform with NLP chatbot and automated CV synthesis.",
                "Web & Mobile",
                Arrays.asList("React", "Java", "Python", "Capacitor"),
                "https://github.com/skillify/skillify-ai",
                "https://skillify-ai.dev",
                "usr_guest",
                "Skillify Team",
                128,
                Instant.now().toString()
        ));

        addProject(new Project(
                "proj-2",
                "Distributed Task Queue Engine",
                "High-throughput asynchronous task orchestrator in Java with real-time SSE updates.",
                "Backend",
                Arrays.asList("Java 24", "HTTP/2", "Concurrency", "SQLite"),
                "https://github.com/skillify/task-queue",
                "https://tasks.skillify.dev",
                "usr_guest",
                "Skillify Team",
                84,
                Instant.now().toString()
        ));
    }

    private void addInternship(Internship internship) {
        internships.put(internship.getId(), internship);
    }

    private void addProject(Project project) {
        projects.put(project.getId(), project);
    }

    // User Operations
    public synchronized User getCurrentUser() {
        return currentUser;
    }

    public synchronized void updateCurrentUser(User updated) {
        if (updated == null) return;
        if (updated.getName() != null) currentUser.setName(updated.getName());
        if (updated.getEmail() != null) currentUser.setEmail(updated.getEmail());
        if (updated.getAvatar() != null) currentUser.setAvatar(updated.getAvatar());
        if (updated.getLevel() > 0) currentUser.setLevel(updated.getLevel());
        if (updated.getXp() >= 0) currentUser.setXp(updated.getXp());
        if (updated.getStreak() >= 0) currentUser.setStreak(updated.getStreak());
        if (updated.getSkills() != null) currentUser.setSkills(updated.getSkills());
        if (updated.getSkillsProgress() != null) currentUser.setSkillsProgress(updated.getSkillsProgress());
    }

    // Internship Operations
    public List<Internship> getAllInternships(String domain, String query) {
        List<Internship> result = new ArrayList<>();
        String q = query != null ? query.toLowerCase().trim() : "";
        String d = domain != null ? domain.toLowerCase().trim() : "";

        for (Internship item : internships.values()) {
            boolean matchesDomain = d.isEmpty() || d.equals("all") || item.getDomain().equalsIgnoreCase(d);
            boolean matchesQuery = q.isEmpty() ||
                    item.getRole().toLowerCase().contains(q) ||
                    item.getCompany().toLowerCase().contains(q) ||
                    item.getLocation().toLowerCase().contains(q);

            if (matchesDomain && matchesQuery) {
                result.add(item);
            }
        }
        return result;
    }

    public Internship getInternshipById(String id) {
        return internships.get(id);
    }

    public synchronized boolean applyInternship(InternshipApplication application) {
        if (application.getId() == null) {
            application.setId("app_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (application.getAppliedAt() == null) {
            application.setAppliedAt(Instant.now().toString());
        }
        if (application.getStatus() == null) {
            application.setStatus("Submitted");
        }
        applications.put(application.getId(), application);
        return true;
    }

    public List<InternshipApplication> getUserApplications(String userId) {
        List<InternshipApplication> userApps = new ArrayList<>();
        for (InternshipApplication app : applications.values()) {
            if (userId == null || userId.equals(app.getUserId()) || "all".equals(userId)) {
                userApps.add(app);
            }
        }
        return userApps;
    }

    // Project Operations
    public List<Project> getAllProjects() {
        return new ArrayList<>(projects.values());
    }

    public synchronized void submitProject(Project project) {
        if (project.getId() == null) {
            project.setId("proj_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (project.getSubmittedAt() == null) {
            project.setSubmittedAt(Instant.now().toString());
        }
        projects.put(project.getId(), project);
    }

    // Skill Operations
    public List<Skill> getUserSkills() {
        return new ArrayList<>(skills.values());
    }

    public synchronized void verifySkill(String skillName, int level) {
        String id = "sk_" + skillName.toLowerCase().replaceAll("[^a-z0-9]", "_");
        Skill skill = new Skill(
                id,
                skillName,
                "Technical Assessment",
                level,
                true,
                "verified",
                Instant.now().toString()
        );
        skills.put(id, skill);

        if (!currentUser.getSkills().contains(skillName)) {
            currentUser.getSkills().add(skillName);
        }
    }
}

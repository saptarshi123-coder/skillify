package com.skillify.backend.models;

import java.util.ArrayList;
import java.util.List;

/**
 * User Entity Model representing a student profile in Skillify.
 */
public class User {
    private String id;
    private String name;
    private String email;
    private String authProvider;
    private String avatar;
    private int level;
    private int xp;
    private int streak;
    private List<String> skills;
    private List<SkillProgress> skillsProgress;

    public static class SkillProgress {
        private String name;
        private int progress;

        public SkillProgress() {}

        public SkillProgress(String name, int progress) {
            this.name = name;
            this.progress = progress;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getProgress() { return progress; }
        public void setProgress(int progress) { this.progress = progress; }
    }

    public User() {
        this.skills = new ArrayList<>();
        this.skillsProgress = new ArrayList<>();
    }

    public User(String id, String name, String email, String authProvider, String avatar, int level, int xp, int streak) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.authProvider = authProvider;
        this.avatar = avatar;
        this.level = level;
        this.xp = xp;
        this.streak = streak;
        this.skills = new ArrayList<>();
        this.skillsProgress = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }
    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<SkillProgress> getSkillsProgress() { return skillsProgress; }
    public void setSkillsProgress(List<SkillProgress> skillsProgress) { this.skillsProgress = skillsProgress; }
}

package com.skillify.backend.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Internship Model representing an internship opportunity in Skillify.
 */
public class Internship {
    private String id;
    private String role;
    private String company;
    private String location;
    private String type; // Remote, On-site, Hybrid
    private String stipend;
    private String duration;
    private String domain; // SDE, AI/ML, Data Science, UI/UX, etc.
    private List<String> skills;
    private String deadline;
    private String description;
    private boolean featured;

    public Internship() {
        this.skills = new ArrayList<>();
    }

    public Internship(String id, String role, String company, String location, String type,
                      String stipend, String duration, String domain, List<String> skills,
                      String deadline, String description, boolean featured) {
        this.id = id;
        this.role = role;
        this.company = company;
        this.location = location;
        this.type = type;
        this.stipend = stipend;
        this.duration = duration;
        this.domain = domain;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.deadline = deadline;
        this.description = description;
        this.featured = featured;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
}

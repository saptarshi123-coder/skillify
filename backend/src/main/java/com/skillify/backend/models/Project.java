package com.skillify.backend.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Project Model representing a student portfolio project.
 */
public class Project {
    private String id;
    private String title;
    private String description;
    private String category;
    private List<String> tags;
    private String repoUrl;
    private String liveUrl;
    private String authorId;
    private String authorName;
    private int stars;
    private String submittedAt;

    public Project() {
        this.tags = new ArrayList<>();
    }

    public Project(String id, String title, String description, String category, List<String> tags,
                   String repoUrl, String liveUrl, String authorId, String authorName, int stars, String submittedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.repoUrl = repoUrl;
        this.liveUrl = liveUrl;
        this.authorId = authorId;
        this.authorName = authorName;
        this.stars = stars;
        this.submittedAt = submittedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }
    public String getLiveUrl() { return liveUrl; }
    public void setLiveUrl(String liveUrl) { this.liveUrl = liveUrl; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
}

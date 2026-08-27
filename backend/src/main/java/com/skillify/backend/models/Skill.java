package com.skillify.backend.models;

/**
 * Skill Model representing an assessment skill or badge.
 */
public class Skill {
    private String id;
    private String name;
    private String category;
    private int level;
    private boolean verified;
    private String badgeIcon;
    private String verifiedAt;

    public Skill() {}

    public Skill(String id, String name, String category, int level, boolean verified, String badgeIcon, String verifiedAt) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.level = level;
        this.verified = verified;
        this.badgeIcon = badgeIcon;
        this.verifiedAt = verifiedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getBadgeIcon() { return badgeIcon; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }
    public String getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(String verifiedAt) { this.verifiedAt = verifiedAt; }
}

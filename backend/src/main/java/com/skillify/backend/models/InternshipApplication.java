package com.skillify.backend.models;

/**
 * Internship Application Entity Model.
 */
public class InternshipApplication {
    private String id;
    private String internshipId;
    private String userId;
    private String applicantName;
    private String email;
    private String resumeUrl;
    private String status; // Pending, Reviewed, Shortlisted, Accepted, Rejected
    private String appliedAt;

    public InternshipApplication() {}

    public InternshipApplication(String id, String internshipId, String userId, String applicantName,
                                 String email, String resumeUrl, String status, String appliedAt) {
        this.id = id;
        this.internshipId = internshipId;
        this.userId = userId;
        this.applicantName = applicantName;
        this.email = email;
        this.resumeUrl = resumeUrl;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getInternshipId() { return internshipId; }
    public void setInternshipId(String internshipId) { this.internshipId = internshipId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAppliedAt() { return appliedAt; }
    public void setAppliedAt(String appliedAt) { this.appliedAt = appliedAt; }
}

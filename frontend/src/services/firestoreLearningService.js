import {
  db,
  auth
} from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';

/**
 * Firestore Learning & Progress Tracking Service
 * Implements strict per-user subcollections under `users/{uid}`:
 * - users/{uid}
 * - users/{uid}/enrollments/{enrollmentId}
 * - users/{uid}/progress/{courseId}
 * - users/{uid}/activity/{activityId}
 * - users/{uid}/certificates/{certificateId}
 */

// Local Storage Cache Keys for instantaneous offline hydration
const CACHE_KEYS = {
  enrollments: (uid) => `skillify_fs_enrollments_${uid}`,
  progress: (uid) => `skillify_fs_progress_${uid}`,
  activity: (uid) => `skillify_fs_activity_${uid}`,
  certificates: (uid) => `skillify_fs_certificates_${uid}`
};

export const firestoreLearningService = {
  /**
   * Helper to get cached data from localStorage
   */
  getCached(type, uid) {
    if (!uid) return [];
    try {
      const data = localStorage.getItem(CACHE_KEYS[type](uid));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Helper to set cache in localStorage
   */
  setCached(type, uid, data) {
    if (!uid) return;
    try {
      localStorage.setItem(CACHE_KEYS[type](uid), JSON.stringify(data));
    } catch (e) {
      console.warn('Cache write failed', e);
    }
  },

  /**
   * Sync base user document under users/{uid}
   */
  async syncUserDoc(uid, userData = {}) {
    if (!uid) return;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      const payload = {
        displayName: userData.displayName || userData.name || 'Student Learner',
        email: userData.email || 'student@skillify.ai',
        role: userData.role || 'student',
        createdAt: snap.exists() ? (snap.data().createdAt || new Date().toISOString()) : new Date().toISOString()
      };
      await setDoc(userRef, payload, { merge: true });
      return payload;
    } catch (e) {
      console.warn('syncUserDoc notice:', e.message);
    }
  },

  /**
   * Enroll authenticated user in a course
   * Creates enrollment doc, initializes progress doc, and logs enrollment activity
   */
  async enrollCourse(uid, course) {
    if (!uid || !course?.id) throw new Error('Missing user ID or Course data');

    const enrollmentId = course.id;
    const courseRef = doc(db, 'users', uid, 'enrollments', enrollmentId);
    const progressRef = doc(db, 'users', uid, 'progress', course.id);

    const now = new Date().toISOString();
    const enrollmentData = {
      courseId: course.id,
      courseTitle: course.title,
      enrollmentDate: now,
      status: 'active', // active | completed | paused
      instructor: course.instructor || 'Lead Instructor',
      category: course.category || 'Technology',
      image: course.image || ''
    };

    const totalLessons = course.modulesCount || course.syllabus?.length || 10;
    const firstLesson = course.syllabus?.[0]?.title || 'Module 1: Introduction & Fundamentals';

    const progressData = {
      courseId: course.id,
      totalLessons: Number(totalLessons),
      completedLessons: 0,
      progressPercent: 0,
      lastAccessedLesson: firstLesson,
      updatedAt: now
    };

    // Save enrollment
    await setDoc(courseRef, enrollmentData, { merge: true });
    // Initialize progress
    await setDoc(progressRef, progressData, { merge: true });

    // Log initial activity
    await this.logActivity(uid, {
      type: 'video',
      courseId: course.id,
      courseTitle: course.title,
      duration: 5,
      score: null,
      title: `Enrolled in ${course.title} & started ${firstLesson}`
    });

    return { enrollmentData, progressData };
  },

  /**
   * Update progress for an enrolled course
   * Auto-marks enrollment completed and generates certificate on 100% completion
   */
  async updateProgress(uid, courseId, { completedLessons, totalLessons, lastAccessedLesson, courseTitle }) {
    if (!uid || !courseId) throw new Error('Missing UID or CourseId');

    const total = Number(totalLessons) || 10;
    const completed = Math.min(total, Math.max(0, Number(completedLessons) || 0));
    const progressPercent = Math.min(100, Math.round((completed / total) * 100));
    const now = new Date().toISOString();

    const progressRef = doc(db, 'users', uid, 'progress', courseId);
    const updatePayload = {
      courseId,
      totalLessons: total,
      completedLessons: completed,
      progressPercent,
      lastAccessedLesson: lastAccessedLesson || `Lesson ${completed} of ${total}`,
      updatedAt: now
    };

    await setDoc(progressRef, updatePayload, { merge: true });

    // If 100% completed, mark enrollment as completed and issue certificate!
    let certificateIssued = null;
    if (progressPercent >= 100) {
      const enrollmentRef = doc(db, 'users', uid, 'enrollments', courseId);
      await updateDoc(enrollmentRef, {
        status: 'completed',
        completedAt: now
      }).catch(async () => {
        // In case doc wasn't created with updateDoc permissions, setDoc with merge
        await setDoc(enrollmentRef, { status: 'completed', completedAt: now }, { merge: true });
      });

      // Auto-issue Certificate if not already present
      certificateIssued = await this.issueCertificate(uid, {
        courseId,
        title: courseTitle || 'Course Completion Certificate',
        score: 98
      });
    }

    // Log Activity for completing lesson
    await this.logActivity(uid, {
      type: progressPercent >= 100 ? 'assignment' : 'video',
      courseId,
      courseTitle: courseTitle || courseId,
      duration: 25,
      score: progressPercent >= 100 ? 100 : null,
      title: progressPercent >= 100
        ? `Completed Course: ${courseTitle || courseId} (100%)`
        : `Completed ${lastAccessedLesson || `Lesson ${completed}`}`
    });

    return { updatePayload, certificateIssued };
  },

  /**
   * Log learning activity under users/{uid}/activity
   * type: 'video' | 'quiz' | 'assignment'
   */
  async logActivity(uid, { type, courseId, courseTitle, duration, score, title }) {
    if (!uid) return;

    const activityCol = collection(db, 'users', uid, 'activity');
    const activityDoc = {
      type: type || 'video', // video | quiz | assignment
      courseId: courseId || 'general',
      courseTitle: courseTitle || '',
      duration: duration !== undefined && duration !== null && duration !== '' ? Number(duration) : null,
      score: score !== undefined && score !== null && score !== '' ? Number(score) : null,
      title: title || 'Learning Session',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(activityCol, activityDoc);
    return { id: docRef.id, ...activityDoc };
  },

  /**
   * Issue / record a course completion certificate under users/{uid}/certificates
   */
  async issueCertificate(uid, { courseId, title, score }) {
    if (!uid || !courseId) return null;

    const certId = `cert_${courseId}`;
    const certRef = doc(db, 'users', uid, 'certificates', certId);

    // Check if certificate already exists
    const existing = await getDoc(certRef);
    if (existing.exists()) {
      return existing.data();
    }

    const now = new Date();
    const issueDateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const certPayload = {
      id: certId,
      courseId,
      title: title || 'Professional Certificate',
      score: score ? `${score}%` : '96%',
      issueDate: issueDateStr,
      issuedAt: now.toISOString(),
      credentialId: `SKF-CRS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      certificateUrl: ''
    };

    await setDoc(certRef, certPayload, { merge: true });
    return certPayload;
  },

  /**
   * Live real-time subscriber for all learning subcollections
   * Returns an unsubscribe function to cleanly detach listeners
   */
  subscribeLearningData(uid, { onEnrollments, onProgress, onActivities, onCertificates, onError }) {
    if (!uid) return () => { };

    const unsubscribers = [];

    try {
      // 1. Subscribe to Enrollments: users/{uid}/enrollments
      const enrollmentsRef = collection(db, 'users', uid, 'enrollments');
      const unEnroll = onSnapshot(enrollmentsRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        this.setCached('enrollments', uid, list);
        if (onEnrollments) onEnrollments(list);
      }, (err) => {
        console.warn('Firestore enrollments listener fallback:', err.message);
        if (onEnrollments) onEnrollments(this.getCached('enrollments', uid));
        if (onError) onError(err);
      });
      unsubscribers.push(unEnroll);

      // 2. Subscribe to Progress: users/{uid}/progress
      const progressRef = collection(db, 'users', uid, 'progress');
      const unProg = onSnapshot(progressRef, (snapshot) => {
        const map = {};
        snapshot.docs.forEach(d => {
          map[d.id] = { id: d.id, ...d.data() };
        });
        this.setCached('progress', uid, map);
        if (onProgress) onProgress(map);
      }, (err) => {
        console.warn('Firestore progress listener fallback:', err.message);
        if (onProgress) onProgress(this.getCached('progress', uid));
      });
      unsubscribers.push(unProg);

      // 3. Subscribe to Activity: users/{uid}/activity
      const activityRef = collection(db, 'users', uid, 'activity');
      const unAct = onSnapshot(activityRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort descending by createdAt
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        this.setCached('activity', uid, list);
        if (onActivities) onActivities(list);
      }, (err) => {
        console.warn('Firestore activity listener fallback:', err.message);
        if (onActivities) onActivities(this.getCached('activity', uid));
      });
      unsubscribers.push(unAct);

      // 4. Subscribe to Certificates: users/{uid}/certificates
      const certRef = collection(db, 'users', uid, 'certificates');
      const unCert = onSnapshot(certRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        this.setCached('certificates', uid, list);
        if (onCertificates) onCertificates(list);
      }, (err) => {
        console.warn('Firestore certificates listener fallback:', err.message);
        if (onCertificates) onCertificates(this.getCached('certificates', uid));
      });
      unsubscribers.push(unCert);

    } catch (e) {
      console.warn('Error establishing Firestore listeners:', e);
      if (onError) onError(e);
    }

    // Return unified unsubscriber
    return () => {
      unsubscribers.forEach(un => {
        try {
          un();
        } catch (e) {
          // ignore
        }
      });
    };
  }
};

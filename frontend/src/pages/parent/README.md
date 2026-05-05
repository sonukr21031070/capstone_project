# Parent Frontend Pages Documentation

This document describes all the parent-facing frontend pages and their features in the EdLearn application.

## Overview

The parent portal provides comprehensive monitoring and communication features for parents to track their child's academic progress and interact with teachers.

## Pages Created

### 1. **Parent Dashboard** (`ParentDashboard` in Dashboards.jsx)
**Route:** `/parent` (index)

**Features:**
- View all linked children with their basic info
- Quick overview of each child's performance metrics:
  - Overall average score
  - Study time spent
  - Quizzes completed
  - Weak subjects
  - Latest teacher remarks
- Real-time status cards showing child's class and roll number

**Key Components:**
- Child cards with avatar and quick stats
- Score display with color-coded performance indicators
- Teacher remarks preview
- Weak subjects highlighting

---

### 2. **Child Progress Page** (`ParentChildProgressPage.jsx`)
**Route:** `/parent/progress`

**Features:**
- Detailed progress tracking for each child
- Overall performance statistics:
  - Overall score percentage
  - Total study time
  - Notes read count
  - Videos watched
  - Quizzes completed
- Subject-wise progress breakdown with:
  - Individual subject scores
  - Notes read, videos watched, quizzes taken per subject
  - Visual progress bars (color-coded: red < 40%, amber 40-69%, green >= 70%)
- Chapter-wise progress tracking:
  - Completion status for each chapter
  - Progress percentage for incomplete chapters
- Weak areas alert system
- Study streak tracking

**Key Metrics:**
- Average Score: Overall performance percentage
- Study Time: Total minutes invested in learning
- Notes Interaction: Count of notes read
- Video Engagement: Count of videos watched
- Quiz Performance: Number of quizzes completed
- Chapter Completion: Progress tracking by chapter

**Visual Elements:**
- Animated progress bars
- Color-coded performance indicators
- Loading skeletons during data fetch
- Responsive grid layout

---

### 3. **Child Remarks Page** (`ParentChildRemarksPage.jsx`)
**Route:** `/parent/remarks`

**Features:**
- Consolidated teacher feedback and remarks
- Remark sentiment analysis:
  - **Positive** remarks (green) - encouraging feedback
  - **Negative** remarks (red) - areas for improvement
  - **Neutral** remarks (blue) - informational feedback
- Expandable remark cards for detailed viewing
- Remark metadata:
  - Teacher name
  - Subject
  - Date and time
  - Star ratings (if available)
  - Tags/categories
- Summary section showing:
  - Total remarks count
  - Analysis of feedback patterns
- Download summary feature (mock implementation)

**Key Components:**
- Remark sentiment detection through keyword analysis
- Responsive card layout
- Text-to-speech button for accessibility
- Expandable content with "Show more/less" toggle
- Overall feedback summary card

---

### 4. **Performance Analytics Page** (`ParentChildPerformancePage.jsx`)
**Route:** `/parent/performance`

**Features:**
- Comprehensive performance analytics dashboard
- Time range selector (Week, Month, Year)
- Key performance metrics:
  - Current Score with trend indicator
  - Best Subject identification
  - Study Streak counter
  - Average Daily Time
- Performance trend visualization (Last 4 weeks):
  - Weekly score progression
  - Color-coded performance bands
- Subject-wise performance comparison:
  - Subject rankings
  - Individual subject metrics (quizzes, time spent)
  - Visual progress bars per subject
- Learning insights section with:
  - **Strengths** card (green):
    - Consistent study routine
    - Strong subjects
    - Good quiz performance
  - **Areas to Focus** card (amber):
    - Weak subjects
    - Topics needing practice
    - Improvement opportunities
- Personalized recommendations:
  - Daily study time goals
  - Advanced quiz suggestions
  - Meeting scheduling prompts
  - Study session tips
- Study time alert (red warning) if daily study < 30 minutes

**Analytics Features:**
- Trend analysis with up/down indicators
- Comparative subject performance
- Multi-period data display
- Actionable insights and recommendations
- Warning system for underperformance

---

### 5. **Notifications & Announcements Page** (`ParentNotificationsPage.jsx`)
**Route:** `/parent/notifications`

**Features:**
- Centralized notification management
- Search functionality to find specific notifications
- Priority-based filtering:
  - **High Priority** (Red) - urgent alerts
  - **Medium Priority** (Amber) - important updates
  - **Low Priority** (Green) - regular announcements
  - **All** - combined view
- Multiple filter options:
  - All notifications
  - Unread only
  - By type (Announcements, Messages, Alerts)
- Per-notification actions:
  - Mark as read
  - Delete
- Notification properties:
  - Title and content
  - Sender information
  - Timestamp
  - Priority level
  - Tags/categories
  - Read/unread status
- Quick statistics:
  - Total notifications count
  - Unread count
  - Important/High priority count

**Visual Features:**
- Color-coded priority indicators
- Type-specific icons
- Status badges for new notifications
- Responsive grid layout
- Mock delete and mark-as-read functionality

---

### 6. **Direct Communication Page** (`ParentCommunicationPage.jsx`)
**Route:** `/parent/messages`

**Features:**
- Direct messaging interface with teachers
- Two-column layout:
  - **Left column:** Conversations list
  - **Right column:** Active chat (desktop) or full screen (mobile)
- Conversation management:
  - Search conversations by teacher name or subject
  - Sort by last message time
  - Unread message counter
  - Online/offline status indicators
- Chat features:
  - Message history with timestamps
  - Distinguish between sent and received messages
  - Visual message bubbles (blue for sent, gray for received)
  - Typing indicator (simulated)
- Teacher information display:
  - Avatar with online status
  - Full name
  - Subject name
  - Email and phone contact buttons
- Message input with:
  - Text input field
  - Send button (Enter key support)
  - Loading state during sending
  - Disable on empty message
- Responsive design:
  - Mobile: Full-screen chat
  - Desktop: Split layout with sidebar

**Communication Features:**
- Real-time messaging (mock)
- Conversation history
- Online/offline status
- Quick contact options (call, email)
- Toast notifications for sent messages

---

## Page Routing Summary

```javascript
/parent                    // Parent Dashboard
/parent/progress           // Child Progress Details
/parent/remarks            // Teacher Remarks/Feedback
/parent/performance        // Performance Analytics
/parent/notifications      // Notifications & Announcements
/parent/messages           // Direct Communication with Teachers
/parent/announcements      // School Announcements (shared with students)
```

---

## API Endpoints Used

All parent pages use the following services from `parentService`:

```javascript
// Main services
parentService.getChildren()              // Get list of linked children
parentService.getChildProgress(id)       // Get detailed progress for a child
parentService.getChildRemarks(id)        // Get teacher remarks for a child
parentService.getAnnouncements(params)   // Get announcements
parentService.getDashboard()             // Get dashboard summary data

// Additional calls from other services
studentService.getAnnouncements()        // Get shared announcements
```

---

## Data Structure Examples

### Child Object
```javascript
{
  studentId: 1,
  name: "Raj Kumar",
  className: "Class 5",
  rollNumber: 23,
  avgScore: 75.5,
  timeSpentMins: 1240,
  quizzesTaken: 15,
  weakSubjectsCount: 2,
  weakSubjects: ["English", "Science"],
  latestRemark: "Good progress in mathematics",
  studyStreak: 7
}
```

### Progress Object
```javascript
{
  childId: 1,
  avgScore: 75.5,
  timeSpentMins: 1240,
  notesRead: 42,
  videosWatched: 28,
  quizzesTaken: 15,
  studyStreak: 7,
  avgDailyMins: 35,
  subjectProgress: [
    {
      subjectName: "Mathematics",
      avgScore: 82,
      notesRead: 18,
      videosWatched: 12,
      quizzesTaken: 8,
      timeSpentMins: 420
    }
  ],
  chapterProgress: [
    {
      chapterName: "Fractions",
      subjectName: "Mathematics",
      isComplete: true,
      progressPercent: 100
    }
  ],
  weakAreas: ["English Reading", "Science Experiments"],
  scoreChange: 5,     // % change from previous period
  streakChange: 2,     // change in study streak
  timeChange: -3       // change in daily study time
}
```

### Remark Object
```javascript
{
  id: 1,
  childId: 1,
  teacherName: "Ms. Priya Singh",
  subjectName: "English",
  content: "Your child shows excellent improvement in vocabulary...",
  createdAt: "2025-01-15T10:30:00Z",
  rating: 4,           // out of 5
  tags: ["improvement", "vocabulary", "participation"],
  sentiment: "positive" // auto-detected
}
```

---

## Features & Functionality

### Accessibility Features
- Text-to-speech buttons for reading content aloud
- High contrast mode toggle
- Large text mode
- Keyboard navigation support
- ARIA labels and roles

### Responsive Design
- Mobile-first approach
- Desktop optimized layouts
- Tablet considerations
- Responsive grids and flexbox

### Performance
- React Query for data fetching and caching
- Loading skeletons during data fetch
- Optimized re-renders
- Pagination support (where needed)

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Color-coded alerts and status
- Toast notifications for actions
- Loading states and spinners
- Error handling with retry options

---

## Internationalization (i18n)

The following translation keys are available for parent pages:

```javascript
parent: {
  myChildren: "My Children",
  childProgress: "Child's Progress",
  childRemarks: "Teacher Remarks",
  teacherRemarks: "Teacher Remarks",
  weakSubjects: "Weak Subjects",
  studyTime: "Study Time",
  performance: "Performance Analytics",
  notifications: "Notifications",
  messages: "Direct Messages",
  communication: "Communication"
}
```

---

## Navigation Menu

Parents see the following navigation items in the sidebar:

1. 📊 Dashboard
2. 📈 Progress
3. 💬 Remarks
4. 📉 Performance
5. 💌 Messages
6. 🔔 Notifications
7. 📢 Announcements
8. 🚪 Logout

---

## Mock Data for Development

The pages include mock data for development and testing:

- **ParentCommunicationPage**: Mock conversations with teachers
- **ParentNotificationsPage**: Mock announcements and notifications
- Other pages use actual API calls (to be implemented in backend)

---

## Future Enhancements

1. **Real-time messaging** using WebSocket connections
2. **Video call integration** with teachers
3. **Assignment alerts** and deadlines
4. **Attendance tracking** per child
5. **Fee/Payment management** section
6. **Report generation** with downloadable PDFs
7. **Parent-teacher meeting scheduler**
8. **Behavior report** from teachers
9. **Customizable notification preferences**
10. **Multi-child comparison** analytics

---

## Backend API Requirements

To fully implement these features, the backend should provide:

### Endpoints Needed
- `GET /parent/children` - List linked children
- `GET /parent/children/{id}/progress` - Detailed progress data
- `GET /parent/children/{id}/remarks` - Teacher remarks
- `GET /parent/announcements` - Parent-specific announcements
- `GET /parent/dashboard` - Dashboard summary
- `POST /parent/messages` - Send message to teacher (future)
- `GET /parent/messages` - Get conversations (future)
- `PUT /parent/notifications/{id}/read` - Mark notification as read (future)

### Data Models
- Progress tracking per child and subject
- Sentiment analysis for remarks
- Notification priority system
- Message conversation threading

---

## Testing Checklist

- [ ] All routes load without errors
- [ ] Child selection works across all pages
- [ ] Progress bars display correctly
- [ ] Sentiment detection for remarks works
- [ ] Search and filter functionality
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Text-to-speech buttons functional
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works
- [ ] Loading states display properly
- [ ] Empty states show helpful messages

---

Created: May 2025
Author: EdLearn Development Team


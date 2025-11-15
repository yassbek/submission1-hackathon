# Testing Checklist - MatchFoundry

## Pre-Test Setup

1. **Database Migration**
```bash
npx prisma migrate dev
npx prisma db seed
```

2. **Environment Variables**
- ✅ `DATABASE_URL` configured
- ✅ `OPENAI_API_KEY` set
- ✅ `AUTH_SECRET` generated
- ✅ `AUTH_URL` set to http://localhost:3000

3. **Start Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

---

## Feature Testing

### 1. Authentication System ✅

**Test: User Registration**
- [ ] Navigate to http://localhost:3000 (should redirect to /login)
- [ ] Click "Register" tab
- [ ] Enter:
  - Name: "Test Founder"
  - Email: "test@founder.com"
  - Password: "password123"
  - Role: "Founder"
- [ ] Click "Create Account"
- [ ] Should auto-login and redirect to main app
- [ ] Verify user name appears in header

**Test: User Login**
- [ ] Logout (if logout button exists) or open in incognito
- [ ] Navigate to http://localhost:3000
- [ ] Should redirect to /login
- [ ] Enter:
  - Email: "alice@example.com"
  - Password: "password123"
- [ ] Click "Login"
- [ ] Should redirect to main app

**Test: Demo Accounts**
Seed provides these accounts (password: `password123` for all):
- alice@example.com (Founder)
- bob@example.com (Expert)
- carla@example.com (Admin)

---

### 2. AI Extraction & Matching

**Test: Submit Check-in**
- [ ] Login as alice@example.com
- [ ] Go to "Check-in" tab
- [ ] Enter text:
  ```
  This week I launched my MVP and got 50 signups! But I'm really struggling with defining my pricing strategy and need help with customer segmentation.
  ```
- [ ] Click "Extract with AI"
- [ ] Verify extraction shows:
  - **Needs**: "Help with pricing strategy" (sales category)
  - **Learnings**: "Launched MVP with 50 signups" (product category)
- [ ] Edit if needed
- [ ] Click "Save Check-in"
- [ ] Verify success message

**Test: AI Matching**
- [ ] Go to "Matches" tab
- [ ] Click "Refresh AI matches"
- [ ] Should see match cards if Bob has relevant learnings
- [ ] Verify match reason shows:
  - Category alignment
  - Related keywords
  - Confidence percentage (e.g., "78% match confidence")

---

### 3. Real Date/Time Picker ✅

**Test: Expert Proposes Slots**
- [ ] Login as bob@example.com
- [ ] Alice must have requested a chat first (see step 4)
- [ ] Go to "Chats" tab
- [ ] In "Pending" column, find Alice's request
- [ ] Click "Propose 3 slots"
- [ ] **Modal should open with DatePicker UI**
- [ ] Verify default times are populated:
  - Slot 1: Tomorrow at 10:00 AM
  - Slot 2: Tomorrow at 2:00 PM
  - Slot 3: Day after at 11:00 AM
- [ ] Test changing times:
  - Click on Slot 1 date field
  - DatePicker calendar should appear
  - Select a different date and time
  - Verify selection updates
- [ ] Click "Propose Slots"
- [ ] Modal closes
- [ ] Chat moves to "Choose a time" column

---

### 4. Coffee Chat Flow

**Test: Request Chat (Founder)**
- [ ] Login as alice@example.com
- [ ] Go to "Matches" tab
- [ ] Find a match with Bob
- [ ] Click "Request 30-min coffee chat"
- [ ] Go to "Chats" tab
- [ ] Chat appears in "Pending" column
- [ ] Message: "Waiting for Bob Expert"

**Test: Select Time Slot (Founder)**
- [ ] After Bob proposes slots (see step 3)
- [ ] Go to "Chats" tab
- [ ] Chat should be in "Choose a time" column
- [ ] See 3 time slots Bob proposed
- [ ] Click "Select" on preferred time
- [ ] Chat moves to "Upcoming chats" column

---

### 5. Jitsi Meeting Integration ✅

**Test: Meeting Link Generation**
- [ ] After selecting a time slot
- [ ] Go to "Chats" tab
- [ ] In "Upcoming chats" column, find the chat
- [ ] Verify information shown:
  - "With Bob Expert" (or other user)
  - Topic: [Need label]
  - When: [Formatted time]
- [ ] **Should see green button: "🎥 Join Jitsi Meeting"**
- [ ] Text below: "Meeting opens in new window"

**Test: Join Meeting**
- [ ] Click "🎥 Join Jitsi Meeting" button
- [ ] New browser tab should open
- [ ] URL should be: `https://meet.jit.si/matchfoundry-[chatId]`
- [ ] Jitsi Meet interface loads
- [ ] Should prompt for name and camera/mic permissions
- [ ] Both Alice and Bob can join the same room
- [ ] Test video/audio works

**Verify Room Name Format**
- [ ] Meeting URL follows pattern: `matchfoundry-{chatId}`
- [ ] Same chatId means same room for both users
- [ ] Different chats have different room names

---

### 6. Admin Dashboard

**Test: Admin Overview**
- [ ] Login as carla@example.com
- [ ] Go to "Admin" tab
- [ ] Verify displays:
  - Active needs count
  - Active learnings count
  - Match suggestions count
  - Scheduled chats count
- [ ] Verify category breakdowns:
  - Needs by category (pie chart or list)
  - Learnings by category
- [ ] Numbers should match database state

---

### 7. MCP Server (Optional)

**Test: MCP Tools**
```bash
# Terminal 1: Start MCP server
npm run mcp:server

# Terminal 2: Test tool (if you have MCP client)
# The tools should be available:
# - extract_needs_learnings
# - compute_matches
```

---

## Edge Cases & Error Handling

### Authentication
- [ ] Try login with wrong password → Error message shown
- [ ] Try register with existing email → Error message
- [ ] Try register with weak password (< 6 chars) → Validation error
- [ ] Try accessing main app without login → Redirect to /login

### Check-in
- [ ] Submit empty text → Validation error
- [ ] Submit with OpenAI API key missing → Falls back to heuristic parsing
- [ ] Edit extracted items before saving → Changes persist

### Matching
- [ ] No matches available → Empty state message shown
- [ ] Match yourself → Should not appear (filtered out)

### Scheduling
- [ ] Try to propose slots without selecting dates → Button disabled
- [ ] Try to select past dates in DatePicker → DatePicker prevents it (minDate)
- [ ] Cancel time picker modal → No slots submitted
- [ ] Select same slot twice → Works correctly

### Meeting Links
- [ ] Click Jitsi link before slot selected → No button shown (only after scheduling)
- [ ] Join meeting before scheduled time → Works (Jitsi allows anytime)

---

## Performance Testing

- [ ] Load with 100+ needs/learnings → Matching completes in < 10 seconds
- [ ] Switch between tabs rapidly → No UI glitches
- [ ] Multiple users submitting simultaneously → No race conditions

---

## Browser Compatibility

- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work
- [ ] **Safari**: All features work
- [ ] **Mobile Chrome**: Responsive design works
- [ ] **Mobile Safari**: DatePicker touch-friendly

---

## Security Checks

- [ ] Passwords are hashed (check database: `password` field is bcrypt hash)
- [ ] Session tokens are secure
- [ ] API routes protected (try accessing without auth)
- [ ] No API keys in client-side code
- [ ] CSRF protection enabled
- [ ] SQL injection prevented (Prisma parameterized queries)

---

## Build & Production

**Test: Production Build**
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] All routes compiled successfully

**Test: Production Mode**
```bash
npm run build
npm start
```
- [ ] App runs in production mode
- [ ] All features work same as development

---

## Known Issues & Limitations

### Expected Behavior (Not Bugs)
1. **User Switcher Removed**: With real auth, users must login/logout
2. **Middleware Protection**: All routes except /login require authentication
3. **Session Management**: Sessions stored in database (Session table)
4. **Meeting Links**: Always accessible once generated (no time-based restrictions)
5. **DatePicker Styling**: May need custom CSS for brand consistency

### Future Enhancements Needed
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session timeout handling
- [ ] Remember me functionality
- [ ] OAuth providers (Google, GitHub)
- [ ] Calendar sync
- [ ] Timezone handling
- [ ] Meeting reminders

---

## Quick Test Script

For rapid testing, run this sequence:

```bash
# 1. Setup
npx prisma migrate dev
npx prisma db seed
npm run dev

# 2. Browser: Login as alice@example.com / password123
# 3. Submit check-in with need
# 4. Browser 2: Login as bob@example.com / password123
# 5. Submit check-in with relevant learning
# 6. Browser 1: Refresh matches, request chat
# 7. Browser 2: Go to chats, propose slots (test DatePicker)
# 8. Browser 1: Select slot
# 9. Both browsers: Click "Join Jitsi Meeting" → Test video chat
```

---

## Test Results Template

| Feature | Status | Notes |
|---------|--------|-------|
| Auth - Register | ⬜ Pass / ❌ Fail | |
| Auth - Login | ⬜ Pass / ❌ Fail | |
| AI Extraction | ⬜ Pass / ❌ Fail | |
| AI Matching | ⬜ Pass / ❌ Fail | |
| Date/Time Picker | ⬜ Pass / ❌ Fail | |
| Chat Request | ⬜ Pass / ❌ Fail | |
| Propose Slots | ⬜ Pass / ❌ Fail | |
| Select Slot | ⬜ Pass / ❌ Fail | |
| Jitsi Integration | ⬜ Pass / ❌ Fail | |
| Admin Dashboard | ⬜ Pass / ❌ Fail | |
| Production Build | ⬜ Pass / ❌ Fail | |

---

**All Features Implemented ✅**
**Ready for Demo 🚀**

# ConveyPro - Quick Reference Card

**Print this out and keep it next to your desk!** 📌

---

## 🎯 The Golden Rules

```
1. NEVER work on main branch (it's protected anyway)
2. ALWAYS work on phase-X-mvp branches
3. CREATE backups at every milestone
4. LOCK backup branches immediately
5. TEST before merging to develop
6. MERGE to main only via Pull Request
```

---

## 📁 Essential Files

```
START-HERE.md          → Read this first!
NEXT-STEPS.md          → Your action plan (Steps 1-5)
CLIENT-SUMMARY.md      → Send to client for approval
PROJECT-ROADMAP.md     → Feature priorities & timeline
README.md              → Full project documentation
ConveyPro-COMPLETE-SPEC.md → Technical specification
```

---

## 🚀 Quick Start (5 Steps)

```
□ Step 1: Review docs (1-2h)
□ Step 2: Get client approval (30min)
□ Step 3: Set up accounts (1h)
    □ GitHub
    □ Supabase
    □ Vercel
    □ SendGrid
□ Step 4: Create repo + protection (30min)
□ Step 5: Initialize project (1h)

Total: ~5 hours over 1-2 days
```

---

## 📅 6-Week MVP Timeline

```
Week 1: Foundation
  ├── Database schema
  ├── Authentication
  ├── Basic UI
  └── Backup: phase-1-backup-1

Week 2: Core Quotes
  ├── Quote form
  ├── LBTT calculator
  ├── PDF generation
  └── Backup: phase-1-backup-2

Week 3: Status & Actions
  ├── Quote tracking
  ├── Quick actions
  ├── Search & filters
  └── Backup: phase-1-backup-3

Week 4: Client Management
  ├── Client history
  ├── Activity log
  ├── Bulk actions
  └── Backup: phase-1-backup-4

Week 5: Notifications
  ├── Email notifications
  ├── Reminders
  ├── Quote acceptance
  └── Backup: phase-1-backup-5

Week 6: Launch
  ├── Mobile responsive
  ├── Testing
  ├── Deploy
  └── Backup: phase-1-final (LOCK IT!)
```

---

## 🌳 Git Workflow

```
Daily Work:
  git checkout phase-1-mvp
  [work work work]
  git add .
  git commit -m "feat: add feature"
  git push origin phase-1-mvp

Milestone Reached:
  git checkout -b phase-1-backup-X
  git push -u origin phase-1-backup-X
  [Go to GitHub → Lock the branch]
  git checkout phase-1-mvp

Phase Complete:
  git checkout -b phase-1-final
  git push -u origin phase-1-final
  [Lock phase-1-final]
  git checkout develop
  git merge phase-1-mvp
  npm run test:all
  git push origin develop
  [Create PR: develop → main]
```

---

## 🔧 Essential Commands

```bash
# Development
npm run dev              # Start server
npm run build            # Build app
npm run lint             # Check code
npm run test             # Run tests

# Database
npx supabase start       # Start local DB
npx supabase db push     # Run migrations
npx supabase gen types typescript --local > src/types/database.types.ts

# Git
git status               # Check status
git add .                # Stage changes
git commit -m "msg"      # Commit
git push                 # Push to remote
git checkout -b name     # New branch

# Deployment
vercel                   # Deploy preview
vercel --prod            # Deploy production
```

---

## 📊 Feature Priorities

```
P0 = Must have for launch (blocking)
P1 = Should have for launch (important)
P2 = Nice to have for launch (optional)

MVP Must-Haves (P0):
├── Quote generation
├── LBTT calculator
├── Document attachments
├── Quote status tracking
├── Search & filters
├── Client history
├── Email notifications
├── Date range analytics
└── Mobile responsive (basic)
```

---

## 🎯 Success Metrics (MVP)

```
Launch Goals:
├── 5 firms onboarded
├── 100+ quotes generated
├── 99.9% uptime
├── <200ms API response
└── £1,500 MRR

Key Metrics:
├── Quote time: <8 min (vs 60 min)
├── Staff adoption: 80%+
├── Conversion rate: 60%+
└── Client satisfaction: 4.5+ stars
```

---

## 🆘 Emergency Contacts

```
Can't push to main?
→ Good! That's correct. Work on phase-X-mvp

Supabase not working?
→ Check .env.local
→ Restart: npm run dev
→ Docs: docs.supabase.com

Git conflicts?
→ Pull before starting work
→ Commit every hour
→ Push every day

Stuck on feature?
→ Check COMPLETE-SPEC.md
→ Check PROJECT-ROADMAP.md
→ Re-read documentation
```

---

## 📞 Document Index

```
START-HERE.md              → Begin here
NEXT-STEPS.md              → Your action plan
QUICK-REFERENCE.md         → This file!
README.md                  → Full documentation
ConveyPro-COMPLETE-SPEC.md → Technical details
ConveyPro-CLIENT-SUMMARY.md→ Client explanation
PROJECT-ROADMAP.md         → Timeline & features
```

---

## ✅ Daily Checklist

```
Morning:
□ git pull origin phase-1-mvp
□ Check NEXT-STEPS.md for today's tasks
□ Review yesterday's progress

During Day:
□ Commit every hour
□ Test as you build
□ Document as you go

End of Day:
□ Push all commits
□ Update progress log
□ Plan tomorrow's tasks

End of Week:
□ Create milestone backup
□ Lock backup branch
□ Review week's progress
```

---

## 🚀 Ready Checklist

```
Before Starting Development:
□ All docs reviewed
□ Client approved scope
□ GitHub repo created
□ Branch protection set
□ Supabase project ready
□ Vercel connected
□ SendGrid configured
□ .env.local created
□ npm install completed
□ npm run dev works
```

---

## 💡 Pro Tips

```
1. Commit early, commit often
2. Write tests as you build
3. Document complex logic
4. Ask questions early
5. Take breaks every 2 hours
6. Review code before pushing
7. Read docs when stuck
8. Keep this reference handy!
```

---

## 🎊 You've Got This!

```
✅ Documentation: Complete
✅ Plan: Defined
✅ Tools: Ready
✅ Timeline: Clear

Now: Execute! 💪
```

---

**Print Date:** November 14, 2024  
**Version:** 1.0  
**Keep:** Next to your desk 📌

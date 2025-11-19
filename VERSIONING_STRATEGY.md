# ConveyPro - Versioning & Release Strategy

**Last Updated:** 2025-11-19
**Version:** 1.0
**Status:** Implemented

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Semantic Versioning](#semantic-versioning)
3. [Branch Strategy](#branch-strategy)
4. [Tagging Strategy](#tagging-strategy)
5. [Release Process](#release-process)
6. [Rollback Procedures](#rollback-procedures)
7. [Environment Management](#environment-management)
8. [Safety Guidelines](#safety-guidelines)

---

## Overview

ConveyPro follows industry-standard versioning and release practices to ensure:
- **Safety**: All production deployments can be rolled back
- **Traceability**: Every release is documented and tagged
- **Stability**: Immutable references to tested code
- **Clarity**: Clear version numbers indicate impact of changes

### Current Version

**v2.0.0** - All 7 Phases Complete
- Production-ready SaaS platform
- ~25,884 lines of code
- 17 database tables
- Phase 2 live on Vercel
- Phases 3-7 ready for deployment

---

## Semantic Versioning

ConveyPro follows [Semantic Versioning 2.0.0](https://semver.org/).

### Version Format

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Incompatible API changes or major feature releases
- **MINOR**: Backward-compatible new features
- **PATCH**: Backward-compatible bug fixes

### Examples

- `1.0.0` → MVP Foundation complete
- `1.1.0` → Add new feature (backward compatible)
- `1.1.1` → Fix bug in existing feature
- `2.0.0` → All 7 phases complete (major milestone)

### Version History

| Version | Date | Description | Lines of Code |
|---------|------|-------------|---------------|
| **v1.0.0** | 2024-11-16 | Phase 1 MVP Foundation | 10,795 |
| **v2.0.0** | 2025-11-19 | All 7 Phases Complete | 25,884 |

### Pre-release Versions

For testing and staging environments:

- `2.1.0-alpha.1` - Alpha release (internal testing)
- `2.1.0-beta.1` - Beta release (limited user testing)
- `2.1.0-rc.1` - Release candidate (pre-production)

---

## Branch Strategy

### Branch Types

#### 1. **Main Branch** (`main`)
- **Purpose**: Production-ready code only
- **Protection**: Require PR approval, status checks
- **Deployment**: Auto-deploys to production
- **Merges**: Only from `develop` via PR

#### 2. **Development Branch** (`develop`)
- **Purpose**: Integration branch for completed features
- **Protection**: Require PR approval
- **Testing**: All tests must pass before merge
- **Merges**: From feature branches via PR

#### 3. **Phase Branches** (`phase-{N}-{description}`)
- **Purpose**: Development of specific phases
- **Naming**: `phase-1-mvp`, `phase-2-analytics`, etc.
- **Lifecycle**: Active during development, merged to `develop` when complete
- **Tags**: Tagged when phase is complete

**Examples:**
```
phase-1-mvp
phase-2-demo-complete
phase-3-automation
phase-4-form-automation
phase-5-email-engagement
phase-6-advanced-analytics
phase-7-intelligent-automation
```

#### 4. **Feature Branches** (`feature/{feature-name}`)
- **Purpose**: Individual feature development
- **Naming**: `feature/client-profiles`, `feature/pdf-generation`
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via PR

#### 5. **Bugfix Branches** (`bugfix/{issue-description}`)
- **Purpose**: Fix bugs in `develop`
- **Naming**: `bugfix/logo-rendering-cors`
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via PR

#### 6. **Hotfix Branches** (`hotfix/{issue-description}`)
- **Purpose**: Emergency fixes for production
- **Naming**: `hotfix/critical-security-patch`
- **Base**: Created from `main`
- **Merge**: To both `main` and `develop`

#### 7. **Backup Branches** (`phase-{N}-backup-{identifier}`)
- **Purpose**: Immutable snapshots of working states
- **Protection**: Lock branch (read-only)
- **Retention**: Permanent
- **Example**: `phase-1-backup-1-database`, `phase-1-backup-2-auth`

#### 8. **Claude Code Branches** (`claude/{description}-{sessionId}`)
- **Purpose**: AI-assisted development sessions
- **Naming**: Must start with `claude/` and end with session ID
- **Lifecycle**: Temporary, merged or closed after review
- **Example**: `claude/conveyPro-build-19.11-01FyZpErwEPnDbx73RbyPLR5`

### Branch Workflow

```
main (production)
  ↑
  PR
  ↑
develop (integration)
  ↑
  PR
  ↑
phase-{N}-{description} (feature phase)
  ↑
  commits
  ↑
claude/{description}-{sessionId} (AI session)
```

### Branch Protection Rules

#### `main` Branch
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

#### `develop` Branch
- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ❌ Allow force pushes: NO

#### `phase-{N}-backup-*` Branches
- ✅ Lock branch (read-only)
- ❌ Allow any changes: NO

---

## Tagging Strategy

### Tag Types

#### 1. **Version Tags** (`v{major}.{minor}.{patch}`)

**Purpose**: Mark official releases

**Format**: `v2.0.0`

**When to Create**:
- Major milestone reached
- Production deployment
- Documentation complete

**Example**:
```bash
git tag -a v2.0.0 -m "ConveyPro v2.0.0 - All 7 Phases Complete
Complete production-ready SaaS platform
~25,884 lines of production code
Phase 2 live, Phases 3-7 ready for deployment"
```

#### 2. **Phase Tags** (`phase-{N}-{description}-{status}`)

**Purpose**: Mark completion of development phases

**Format**: `phase-{N}-{description}-{status}`

**Status Suffixes**:
- `-complete`: Fully built, tested, ready for deployment
- `-foundation`: Core functionality in place
- `-production`: Currently deployed to production

**Examples**:
- `phase-1-mvp-complete`
- `phase-2-production-complete`
- `phase-3-enrollment-complete`
- `phase-4-form-automation-complete`
- `phase-5-email-engagement-foundation`
- `phase-6-advanced-analytics-complete`
- `phase-7-intelligent-automation-complete`

**Tag Message Template**:
```bash
git tag -a phase-{N}-{description}-{status} -m "Phase {N}: {Title}

Features: {Feature List}
Code: +{lines} lines
Status: {Status Description}

Key Components:
- {Component 1}
- {Component 2}

Database:
- {Schema changes}

Testing:
- {Test status}

Environment Variables:
- {New vars if any}
"
```

#### 3. **Deployment Tags** (`deploy-{environment}-{date}`)

**Purpose**: Track what was deployed when

**Format**: `deploy-production-2024-11-19`

**When to Create**: Every production deployment

**Example**:
```bash
git tag -a deploy-production-2024-11-19 -m "Production deployment
Version: v2.0.0
Phase: Phase 2 Analytics & Clients
URL: https://conveypro.vercel.app
Database: Supabase Production
Status: Success"
```

### Tag Naming Conventions

| Type | Pattern | Example | Purpose |
|------|---------|---------|---------|
| Version | `v{major}.{minor}.{patch}` | `v2.0.0` | Official releases |
| Phase | `phase-{N}-{desc}-{status}` | `phase-2-production-complete` | Phase milestones |
| Deployment | `deploy-{env}-{date}` | `deploy-production-2024-11-19` | Deployment tracking |
| Backup | `backup-{desc}-{date}` | `backup-pre-migration-2024-11-19` | Safety snapshots |

### Annotated vs Lightweight Tags

**Always use annotated tags** for releases and milestones:

```bash
# ✅ Correct - Annotated tag
git tag -a v2.0.0 -m "Release message with details"

# ❌ Incorrect - Lightweight tag
git tag v2.0.0
```

**Why?**
- Annotated tags store tagger name, email, date
- Include detailed messages
- Can be cryptographically signed
- Show up in `git describe`

### Viewing Tags

```bash
# List all tags
git tag -l

# Show tag message
git tag -l "v2.0.0" -n20

# Show tag details
git show v2.0.0

# List remote tags
git ls-remote --tags origin
```

### Pushing Tags

```bash
# Push single tag
git push origin v2.0.0

# Push all tags
git push origin --tags

# Push tags with branch
git push origin main --tags
```

---

## Release Process

### Pre-Release Checklist

Before creating a release:

- [ ] All tests passing
- [ ] TypeScript build successful
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Breaking changes documented
- [ ] Known issues documented

### Release Steps

#### 1. **Prepare Release**

```bash
# Ensure on develop branch
git checkout develop
git pull origin develop

# Verify everything works
npm run build
npm run lint
npm test

# Update version in package.json
npm version major|minor|patch  # e.g., npm version minor
```

#### 2. **Update Documentation**

Update these files:
- `package.json` - Version number
- `CHANGELOG.md` - Add release entry
- `README.md` - Update version badges
- `STATUS.md` - Update deployment status

#### 3. **Create Release Tag**

```bash
# Create annotated tag
git tag -a v2.1.0 -m "Release v2.1.0

Features:
- Feature 1
- Feature 2

Bug Fixes:
- Fix 1
- Fix 2

Breaking Changes:
- None

Database:
- Migration: 20241119_new_feature.sql

Environment Variables:
- NEW_VAR=value
"

# Push tag
git push origin v2.1.0
```

#### 4. **Merge to Main**

```bash
# Create PR from develop to main
# Title: "Release v2.1.0"
# Body: Copy from CHANGELOG.md

# After approval, merge PR
# Tag main branch
git checkout main
git pull origin main
git tag -a deploy-production-$(date +%Y-%m-%d) -m "Production deployment v2.1.0"
git push origin --tags
```

#### 5. **Deploy to Production**

```bash
# Trigger deployment (Vercel auto-deploys from main)
# Or manual deployment:
vercel --prod

# Verify deployment
curl https://conveypro.vercel.app/api/health
```

#### 6. **Post-Deployment**

- [ ] Verify application loads
- [ ] Test critical user flows
- [ ] Check database migrations ran
- [ ] Monitor error logs
- [ ] Notify team of deployment
- [ ] Update project management board

---

## Rollback Procedures

### When to Rollback

- Critical bugs in production
- Data corruption detected
- Security vulnerability discovered
- Performance degradation
- User-facing errors

### Rollback Methods

#### Method 1: Deploy Previous Tag (Fastest)

```bash
# Find previous good tag
git tag -l "deploy-production-*" --sort=-creatordate | head -5

# Deploy from tag
git checkout deploy-production-2024-11-18
vercel --prod

# Or via Vercel dashboard:
# Deployments → Find previous deployment → Promote to Production
```

**Time**: ~2 minutes
**Risk**: Low
**Data**: No data loss

#### Method 2: Revert Commit

```bash
# Find commit to revert
git log --oneline -10

# Create revert commit
git revert {commit-hash}
git push origin main

# Deploy
vercel --prod
```

**Time**: ~5 minutes
**Risk**: Medium
**Data**: No data loss

#### Method 3: Database Rollback

If migration caused issues:

```bash
# Connect to Supabase
psql {connection-string}

# Rollback migration
\i supabase/migrations/{timestamp}_rollback.sql

# Or via Supabase dashboard:
# Database → Migrations → Rollback
```

**Time**: ~10 minutes
**Risk**: High
**Data**: Potential data loss

### Rollback Checklist

- [ ] Identify issue and impact
- [ ] Notify team of rollback
- [ ] Choose rollback method
- [ ] Execute rollback
- [ ] Verify application working
- [ ] Monitor for errors
- [ ] Document incident
- [ ] Create hotfix branch
- [ ] Fix issue
- [ ] Test fix thoroughly
- [ ] Redeploy

---

## Environment Management

### Environments

| Environment | Branch | URL | Database | Purpose |
|-------------|--------|-----|----------|---------|
| **Development** | `develop` | `localhost:3000` | Supabase Dev | Local development |
| **Staging** | `develop` | `conveypro-staging.vercel.app` | Supabase Staging | Testing |
| **Production** | `main` | `conveypro.vercel.app` | Supabase Production | Live users |

### Environment Variables

Different values per environment:

```bash
# Development (.env.local)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL={dev-project-url}

# Staging (Vercel)
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://conveypro-staging.vercel.app
NEXT_PUBLIC_SUPABASE_URL={staging-project-url}

# Production (Vercel)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://conveypro.vercel.app
NEXT_PUBLIC_SUPABASE_URL={production-project-url}
```

### Deployment Mapping

```
Vercel Environments:
├── Production → main branch → conveypro.vercel.app
├── Preview → develop branch → conveypro-git-develop.vercel.app
└── Development → feature branches → unique URLs
```

---

## Safety Guidelines

### Code Safety

1. **Never Force Push to Protected Branches**
   ```bash
   # ❌ NEVER DO THIS
   git push --force origin main
   git push --force origin develop
   ```

2. **Always Use Pull Requests**
   - No direct commits to `main` or `develop`
   - Require code review
   - Require CI checks to pass

3. **Tag Before Risky Operations**
   ```bash
   # Before major refactoring
   git tag -a backup-pre-refactor-$(date +%Y-%m-%d) -m "Backup before refactoring"
   ```

### Database Safety

1. **Always Create Rollback Migrations**
   ```sql
   -- Migration: 20241119_add_feature.sql
   -- Rollback: 20241119_add_feature_rollback.sql
   ```

2. **Test Migrations Locally First**
   ```bash
   # Test migration
   npx supabase db push

   # Test rollback
   npx supabase db reset
   ```

3. **Backup Before Production Migrations**
   ```bash
   # Supabase auto-backups daily
   # Manual backup:
   pg_dump {connection-string} > backup_$(date +%Y%m%d).sql
   ```

### Deployment Safety

1. **Deploy Outside Peak Hours**
   - Preferred: Evenings or weekends
   - Avoid: Monday mornings, end of month

2. **Monitor After Deployment**
   - Watch error logs for 30 minutes
   - Check Vercel analytics
   - Test critical user flows

3. **Have Rollback Plan Ready**
   - Know previous good tag
   - Have rollback commands ready
   - Team member on standby

### Tag Safety

1. **Never Delete Published Tags**
   ```bash
   # ❌ NEVER DO THIS
   git tag -d v2.0.0
   git push origin :refs/tags/v2.0.0
   ```

2. **Use Annotated Tags for Releases**
   ```bash
   # ✅ Always include message
   git tag -a v2.0.0 -m "Release message"
   ```

3. **Verify Before Pushing**
   ```bash
   # Check tag points to correct commit
   git show v2.0.0

   # Push only if correct
   git push origin v2.0.0
   ```

---

## Quick Reference

### Common Commands

```bash
# Create release tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# Create phase tag
git checkout phase-3-automation
git tag -a phase-3-enrollment-complete -m "Phase 3 complete"
git push origin phase-3-enrollment-complete

# List all tags
git tag -l

# Show tag details
git tag -l "v2.0.0" -n20

# Deploy from tag
git checkout v2.0.0
vercel --prod

# Rollback to previous tag
git checkout deploy-production-2024-11-18
vercel --prod
```

### Version Bumping

```bash
# Patch: 2.0.0 → 2.0.1
npm version patch

# Minor: 2.0.0 → 2.1.0
npm version minor

# Major: 2.0.0 → 3.0.0
npm version major
```

---

## References

- [Semantic Versioning](https://semver.org/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-19 | Initial versioning strategy documentation |

---

**Last Updated:** 2025-11-19
**Version:** 1.0
**Status:** Implemented
**Next Review:** Before Phase 3-7 deployment

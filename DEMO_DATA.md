# Demo Data Setup Summary

## ✅ Successfully Created

### Users (2)
1. **Admin User**
   - Email: `admin@ieee.org`
   - Password: `admin`
   - Role: `admin`
   - Organization: Sri Sai Ram Engineering College

2. **Regular User**
   - Email: `user@ieee.org`
   - Password: `admin`
   - Role: `user`
   - Organization: Sri Sai Ram Engineering College

### Categories (6)
1. Conference Grant
2. Research Funding
3. Workshop/Seminar
4. Equipment Purchase
5. Student Travel
6. Chapter Activities

### Sample Deadlines (4)
1. **IEEE Conference Grant 2024**
   - Category: Conference Grant
   - Duration: 2 weeks from now
   - Description: Apply for funding to attend IEEE international conferences

2. **Research Publication Fund**
   - Category: Research Funding
   - Duration: 1 month from now
   - Description: Funding support for publishing research papers

3. **Technical Workshop Sponsorship**
   - Category: Workshop/Seminar
   - Duration: 1 week from now
   - Description: Apply for sponsorship to organize technical workshops

4. **Student Travel Grant**
   - Category: Student Travel
   - Duration: 2 weeks from now
   - Description: Travel grants for students presenting papers

## How to Re-run

To reset the database to this demo state:

```bash
node scripts/setup_demo_data.js
```

**Warning**: This will delete all existing users, categories, and deadlines!

## Login Credentials

- **Admin**: `admin@ieee.org` / `admin`
- **User**: `user@ieee.org` / `admin`

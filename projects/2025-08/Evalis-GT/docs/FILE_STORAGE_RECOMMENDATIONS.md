# File Storage Recommendations for Evalis-GT

## Current Setup
- Files are stored locally in `server/uploads/` folder
- This works for development but is not suitable for production

## Recommended Solutions (Free/Low-cost)

### 1. **Vercel Blob Storage** (Recommended for Vercel deployment)
- **Pros:** 
  - Seamless integration with Vercel
  - Free tier: 1GB storage, 5GB bandwidth
  - Simple API integration
- **Cons:** 
  - Limited free storage
  - Tied to Vercel ecosystem
- **Cost:** Free tier then $0.15/GB storage, $0.20/GB bandwidth

### 2. **Supabase Storage** (Recommended)
- **Pros:**
  - 1GB free storage
  - PostgreSQL-based (matches your Neon DB)
  - Row Level Security (RLS)
  - Direct file upload from frontend
  - Free tier sufficient for MVP
- **Cons:**
  - Learning curve for setup
- **Cost:** Free tier: 1GB storage, then $0.021/GB

### 3. **Cloudinary** (For images/PDFs)
- **Pros:**
  - 25GB free storage and bandwidth
  - Built-in PDF preview/manipulation
  - Image optimization
  - Good for academic documents
- **Cons:**
  - Better for media than general files
- **Cost:** Free tier: 25GB, then $99/month

### 4. **Firebase Storage**
- **Pros:**
  - 5GB free storage
  - Good integration with existing auth
  - Real-time capabilities
- **Cons:**
  - Google ecosystem dependency
- **Cost:** Free tier: 5GB, then $0.026/GB

### 5. **AWS S3** (Most scalable)
- **Pros:**
  - Industry standard
  - Very cheap storage ($0.023/GB)
  - Highly scalable
- **Cons:**
  - Complex setup
  - Free tier only for 12 months (5GB)

## Implementation Strategy

### Phase 1: Development/MVP (Current)
- Continue with local storage
- Implement file cleanup (already done)

### Phase 2: Production Ready
- **Recommended:** Supabase Storage + Neon DB
- Migrate existing files
- Update upload/download endpoints

### Phase 3: Scale
- **Recommended:** AWS S3 with CDN
- Implement file compression
- Add background job processing

## Code Changes Required

### 1. Environment Variables
```env
# Supabase Storage
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=evalis-files

# Or AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=evalis-files
AWS_REGION=us-east-1
```

### 2. Upload Service Update
- Create `src/services/fileStorage.js`
- Abstract file operations (upload, delete, get URL)
- Update assignment and submission controllers

### 3. Frontend Changes
- Update file upload components
- Handle file URLs from cloud storage
- Add proper error handling

## Immediate Recommendation

For your current needs and budget constraints:

1. **Start with Supabase Storage** - 1GB free is enough for MVP
2. **Keep local storage as fallback** during transition
3. **Implement abstract file service** to easily switch between providers later

Would you like me to implement the Supabase Storage integration as the next step?

## File Organization Structure

```
supabase-bucket/
├── assignments/
│   ├── [teacher-id]/
│   │   ├── [assignment-id]/
│   │   │   └── question-paper.pdf
├── submissions/
│   ├── [student-id]/
│   │   ├── [assignment-id]/
│   │   │   ├── submission.pdf
│   │   │   └── graded.pdf
└── temp/
    └── [processing files]
```

This organization makes it easy to:
- Implement user-based access control
- Clean up files when users/assignments are deleted
- Scale storage policies per user type

# Database Schema Cleanup - Recordings Table

## Overview
Cleaned up the `recordings` table by removing unnecessary columns and moved the status tracking to the `analyses` table where it belongs.

## Changes Made

### ✅ Recordings Table - Columns Removed
- ❌ `drive_file_id` - No longer needed (switched to direct upload)
- ❌ `status` - Moved to analyses table (status tracks analysis progress, not recording)
- ❌ `updated_at` - Not being used

### ✅ Recordings Table - Final Schema (8 columns)
1. `id` (uuid, PRIMARY KEY)
2. `user_id` (uuid, NOT NULL)
3. `file_name` (text)
4. `file_size` (bigint)
5. `stored_file_url` (text)
6. `duration_seconds` (integer)
7. `transcript` (text)
8. `created_at` (timestamp)

### ✅ Status Column
- **Before**: Status was in `recordings` table
- **After**: Status is ONLY in `analyses` table
- **Rationale**: Status represents the analysis progress ('pending', 'processing', 'completed', 'failed'), not the recording itself

## Frontend Updates

### Files Modified

#### 1. **src/lib/supabase.ts**
- Removed `drive_file_id`, `status`, `updated_at` from `Recording` interface
- Recording interface now has only essential fields

#### 2. **src/components/Dashboard.tsx**
- Changed `recording.status` → `analysis?.status`
- Status badge now reads from analysis object
- Retry button check updated to use `analysis?.status`

#### 3. **src/components/AddRecordingModal.tsx**
- Removed `status: 'uploaded'` from recordings insert
- Status is now set in analyses table as `status: 'pending'`

#### 4. **src/hooks/useAnalysisNotifications.ts**
- **Complete rewrite**: Now queries `analyses` table instead of `recordings`
- Tracks analysis status changes, not recording status
- Query changed from recordings → analyses with recordings joined
- Returns `completedAnalyses` instead of `completedRecordings`

## Benefits

✅ **Cleaner Separation**: Recordings store the files, analyses track the processing  
✅ **Single Source of Truth**: Status is only in one place (analyses table)  
✅ **Simpler Logic**: No need to sync status between two tables  
✅ **Better Data Model**: Recording is created, then analysis processes it  
✅ **Reduced Redundancy**: Removed unused columns from recordings  

## Data Flow

```
1. User uploads recording
   ↓
2. Recording created (no status)
   ↓
3. Analysis created (status: 'pending')
   ↓
4. Webhook triggered
   ↓
5. AI processes → Analysis status: 'processing'
   ↓
6. Results returned → Analysis status: 'completed' or 'failed'
   ↓
7. Frontend reads analysis.status to show badge
```

## Migration Notes

- Existing recordings with status will have that column ignored
- All status checks now reference the analyses table
- The webhook should update analysis.status, not recording.status

---

**Date**: December 19, 2025  
**Status**: ✅ Complete  
**Breaking Changes**: None (graceful fallback to 'unknown' status)

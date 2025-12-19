# Database Schema Update - Analyses Table

## Overview
The `analyses` table has been restructured to match the AI agent's JSON output format exactly. This update simplifies data storage and ensures the frontend displays data correctly from the new schema.

## Schema Changes

### ✅ Retained Columns
- `id` (uuid, PRIMARY KEY)
- `user_id` (uuid, NOT NULL)
- `recording_id` (uuid, FOREIGN KEY)
- `status` (varchar)
- `created_at` (timestamp)

### ❌ Removed Columns
- `sentiment_score` → Replaced with `sentiments_score`
- `detailed_call_analysis` → Replaced with `details`
- `objections_handled` → Replaced with `objections_handeled`
- `objections_raised` → Removed (no longer tracked)
- `objections_tackled` → Removed (no longer tracked)
- `participants` (old structure) → Replaced with structured JSONB

### ✨ New Columns Added

#### Main Metrics
- `sentiments_score` (NUMERIC) - Overall sentiment score (0-100)
- `engagement_score` (NUMERIC) - Engagement level score (0-100)
- `confidence_score_executive` (NUMERIC) - Executive confidence (0-10)
- `confidence_score_person` (NUMERIC) - Person confidence (0-10)
- `lead_type` (TEXT) - Type of lead identified

#### Structured Data
- `participants` (JSONB) - Participant information
  ```json
  {
    "count": 2,
    "names": "John, Sarah"
  }
  ```

#### Analysis Fields
- `objections_handeled` (TEXT) - Summary of objections handled
- `next_steps` (TEXT) - Recommended next steps
- `improvements` (TEXT) - Suggested improvements
- `call_outcome` (TEXT) - Outcome of the call
- `short_summary` (TEXT) - Executive summary

#### Detailed Explanations
- `details` (JSONB) - All detailed explanations and rationale
  ```json
  {
    "sentiments_explanation": "...",
    "engagement_explanation": "...",
    "confidence_explanation_executive": "...",
    "confidence_explanation_person": "...",
    "next_steps_detailed": "...",
    "improvements_for_team": "...",
    "objections_detected": "...",
    "objections_handling_details": "...",
    "call_outcome_rationale": "...",
    "evidence_quotes": "..."
  }
  ```

## Frontend Updates

### Files Updated

#### 1. **src/lib/supabase.ts**
- Updated `Analysis` interface to match new schema
- Changed `sentiment_score` → `sentiments_score`
- Changed `detailed_call_analysis` → `details`
- Changed `objections_handled` → `objections_handeled`
- Added `status`, `lead_type`, structured `participants`
- Removed `objections_raised`, `objections_tackled`

#### 2. **src/components/Dashboard.tsx**
- Updated all references to use `sentiments_score` instead of `sentiment_score`
- Changed analysis check from `detailed_call_analysis` to `details`

#### 3. **src/pages/AnalysisDetail.tsx**
- Updated to read from `details` JSONB field instead of `detailed_call_analysis`
- Changed `sentiment_score` → `sentiments_score`
- Changed `objections_handled` → `objections_handeled`
- Removed objections raised/tackled counters
- Updated objections card to display text field

#### 4. **src/components/AddRecordingModal.tsx**
- Updated analysis record creation to use new column names
- Added `participants`, `lead_type` fields
- Changed `sentiment_score` → `sentiments_score`
- Changed `detailed_call_analysis` → `details`
- Changed `objections_handled` → `objections_handeled`

#### 5. **src/hooks/useSupabaseData.ts**
- Updated all aggregation functions to use `sentiments_score`
- Changed `objections_handled` → `objections_handeled`
- Set `objections_raised` and `objections_tackled` to 0 (no longer tracked)
- Updated sentiment distribution calculations
- Updated objection filtering logic

#### 6. **src/hooks/useAnalysisNotifications.ts**
- Updated query to select `sentiments_score` instead of `sentiment_score`
- Updated notification logic to use new column name

## AI Agent Integration

### Webhook Payload Expected Format
The n8n webhook should populate the analyses table with data matching this structure:

```typescript
{
  // Core identification
  recording_id: string,
  user_id: string,
  status: "completed",
  
  // Main metrics (top-level for easy querying)
  sentiments_score: number,        // 0-100
  engagement_score: number,        // 0-100
  confidence_score_executive: number,  // 0-10
  confidence_score_person: number,     // 0-10
  lead_type: string,
  
  // Structured data
  participants: {
    count: number,
    names: string
  },
  
  // Summary fields (text)
  objections_handeled: string,
  next_steps: string,
  improvements: string,
  call_outcome: string,
  short_summary: string,
  
  // All detailed explanations (JSONB)
  details: {
    sentiments_explanation: string,
    engagement_explanation: string,
    confidence_explanation_executive: string,
    confidence_explanation_person: string,
    next_steps_detailed: string,
    improvements_for_team: string,
    objections_detected: string,
    objections_handling_details: string,
    call_outcome_rationale: string,
    evidence_quotes: string
  }
}
```

## Benefits of New Schema

✅ **Cleaner Structure**: Top-level fields for main metrics enable faster queries  
✅ **Detailed Explanations**: All explanations stored in `details` JSONB for flexibility  
✅ **Direct Mapping**: Schema matches AI agent JSON output 1:1  
✅ **Type Safety**: Structured `participants` object with defined shape  
✅ **Easier Maintenance**: Frontend code is more readable with clear field names  
✅ **Better Performance**: Frequently accessed metrics are separate columns  

## Migration Status

✅ Database schema updated  
✅ TypeScript interfaces updated  
✅ Dashboard component updated  
✅ Analysis detail page updated  
✅ Recording modal updated  
✅ Data hooks updated  
✅ Notification hooks updated  
✅ No TypeScript errors  

## Next Steps

1. **Test with Real AI Agent Data**: Ensure webhook populates new columns correctly
2. **Verify Display Logic**: Check that all UI components render properly with new schema
3. **Update Webhook Integration**: Ensure n8n workflow sends data in new format
4. **Monitor Performance**: Validate that JSONB queries on `details` field are performant

---

**Date**: 2024  
**Schema Version**: 2.0  
**Status**: ✅ Complete

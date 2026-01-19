# Experience Prompt Feature

## Overview
This feature automatically prompts candidates to add their professional experiences when they log into their dashboard if they haven't added any experiences yet. The prompt is optional and can be skipped, but will reappear after 24 hours if the user still has no experiences.

## How it works

### 1. Automatic Detection
- When a candidate logs into their dashboard, the system checks if they have any experiences
- If no experiences are found, a modal prompt appears asking them to add their experiences
- The check is performed using the `useExperiencePrompt` hook

### 2. Skip Functionality
- Users can skip the prompt by clicking "Passer pour le moment"
- When skipped, the prompt won't appear again for 24 hours
- Skip data is stored in localStorage with a timestamp

### 3. Manual Trigger
- Users can manually open the experience prompt from their profile page
- In the "Expériences" section, there's an "Assistant" button that opens the prompt
- This allows users to use the guided experience entry even after skipping

### 4. Experience Entry
- The modal allows users to add multiple experiences at once
- Each experience includes:
  - Company/Organization name (required)
  - Position/Role (required)
  - Start date (optional)
  - End date (optional)
  - Location (optional)
  - Description (optional)
- Users can add multiple experiences before submitting

## Files Created/Modified

### New Files
- `facejob/components/ExperiencePromptModal.tsx` - The main modal component
- `facejob/hooks/useExperiencePrompt.tsx` - Hook to manage prompt logic
- `facejob/contexts/ExperiencePromptContext.tsx` - Context for manual prompt triggering
- `facejobBackend/app/Http/Controllers/ExperienceController.php` - API controller for experiences

### Modified Files
- `facejob/app/(dashboard)/dashboard/candidat/layout.tsx` - Added prompt integration
- `facejob/components/ExperiencesSection.tsx` - Added manual trigger button
- `facejobBackend/routes/api.php` - Added new experience API routes

## API Endpoints

### New Experience Routes
- `POST /api/experiences` - Create a new experience
- `GET /api/experiences/{id}` - Get a specific experience
- `PUT /api/experiences/{id}` - Update an experience
- `DELETE /api/experiences/{id}` - Delete an experience
- `GET /api/candidat/{candidatId}/experiences` - Get all experiences for a candidate

### Existing Routes Used
- `GET /api/candidate-profile/{id}` - Get candidate profile including experiences

## Configuration

### Environment Variables
Make sure `NEXT_PUBLIC_BACKEND_URL` is set in your `.env` file to point to your Laravel backend.

### Dependencies
The feature uses existing dependencies:
- `date-fns` for date formatting
- `lucide-react` for icons
- `react-hot-toast` for notifications
- `js-cookie` for authentication tokens

## Usage Flow

1. **User logs in** → Dashboard layout loads
2. **Hook checks experiences** → API call to get user profile
3. **If no experiences** → Modal appears automatically
4. **User can:**
   - Fill out experiences and submit
   - Skip for 24 hours
   - Close and use manual trigger later
5. **Manual trigger** → Available in profile page "Expériences" section

## Customization

### Skip Duration
To change how long the skip lasts, modify the `SKIP_DURATION` constant in `useExperiencePrompt.tsx`:
```typescript
const SKIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

### Prompt Conditions
To modify when the prompt appears, update the logic in `useExperiencePrompt.tsx`:
```typescript
const hasExperiences = data.experiences && data.experiences.length > 0;
setShouldShowPrompt(!hasExperiences);
```

### Modal Styling
The modal uses Tailwind CSS classes and can be customized in `ExperiencePromptModal.tsx`.

## Testing

To test the feature:
1. Create a new candidate account or use an existing one without experiences
2. Log into the dashboard
3. The prompt should appear automatically
4. Test skipping and manual triggering
5. Verify experiences are saved correctly

## Troubleshooting

### Prompt not appearing
- Check browser console for API errors
- Verify authentication token is valid
- Ensure candidate has no existing experiences

### API errors
- Check Laravel logs for backend errors
- Verify database migrations are run
- Ensure proper authentication middleware

### Skip not working
- Check browser localStorage for skip data
- Verify timestamp calculation in hook
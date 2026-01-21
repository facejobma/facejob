# Unified Loading System

This document describes the unified loading system implemented across the FaceJob application.

## Overview

The unified loading system provides consistent loading UI components across all parts of the application, replacing the previous mix of different loading implementations (Circles spinner, CSS animations, etc.).

## Components

### 1. LoadingSpinner
Basic spinner component with customizable size and color.

```tsx
import { LoadingSpinner } from "@/components/ui/loading";

<LoadingSpinner size="md" color="primary" />
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl"
- `color`: "primary" | "secondary" | "white" | "gray"
- `className`: Additional CSS classes

### 2. LoadingDots
Animated dots for subtle loading indication.

```tsx
import { LoadingDots } from "@/components/ui/loading";

<LoadingDots size="md" color="primary" />
```

**Props:**
- `size`: "sm" | "md" | "lg"
- `color`: "primary" | "secondary" | "white" | "gray"
- `className`: Additional CSS classes

### 3. FullPageLoading
Complete page loading screen with logo and messages.

```tsx
import { FullPageLoading } from "@/components/ui/loading";

<FullPageLoading 
  message="Chargement..."
  submessage="Préparation des données..."
  showLogo={true}
/>
```

**Props:**
- `message`: Main loading message
- `submessage`: Secondary message
- `size`: "md" | "lg" | "xl"
- `showLogo`: Show FaceJob logo

### 4. InlineLoading
Loading component for inline use within content.

```tsx
import { InlineLoading } from "@/components/ui/loading";

<InlineLoading message="Chargement..." size="md" />
```

**Props:**
- `message`: Loading message
- `size`: "sm" | "md" | "lg"
- `className`: Additional CSS classes

### 5. ButtonLoading
Button with integrated loading state.

```tsx
import { ButtonLoading } from "@/components/ui/loading";

<ButtonLoading
  loading={isLoading}
  loadingText="Envoi en cours..."
  onClick={handleSubmit}
>
  Envoyer
</ButtonLoading>
```

**Props:**
- `loading`: Boolean loading state
- `children`: Button content
- `loadingText`: Text to show when loading
- `size`: "sm" | "md" | "lg"
- `className`: Additional CSS classes
- `disabled`: Disable button
- `onClick`: Click handler
- `type`: Button type

### 6. TableLoading
Skeleton loading for tables.

```tsx
import { TableLoading } from "@/components/ui/loading";

<TableLoading rows={5} columns={4} />
```

**Props:**
- `rows`: Number of skeleton rows
- `columns`: Number of skeleton columns
- `className`: Additional CSS classes

### 7. CardLoading
Skeleton loading for cards.

```tsx
import { CardLoading } from "@/components/ui/loading";

<CardLoading />
```

**Props:**
- `className`: Additional CSS classes

### 8. VideoLoading
Loading placeholder for videos.

```tsx
import { VideoLoading } from "@/components/ui/loading";

<VideoLoading className="w-full h-48" />
```

**Props:**
- `className`: Additional CSS classes

### 9. ProgressLoading
Progress bar with percentage and message.

```tsx
import { ProgressLoading } from "@/components/ui/loading";

<ProgressLoading 
  progress={75}
  message="Téléchargement..."
/>
```

**Props:**
- `progress`: Progress percentage (0-100)
- `message`: Progress message
- `className`: Additional CSS classes

### 10. LoadingPulse
Basic pulse animation for skeleton loading.

```tsx
import { LoadingPulse } from "@/components/ui/loading";

<LoadingPulse className="h-4 w-full" />
```

**Props:**
- `className`: CSS classes for size and styling
- `children`: Optional content

## Context and Hooks

### LoadingContext
Global loading state management.

```tsx
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";

// Wrap your app
<LoadingProvider>
  <App />
</LoadingProvider>

// Use in components
const { setLoading, isLoading } = useLoading();
```

### useLoadingState Hook
Individual loading state management.

```tsx
import { useLoadingState } from "@/contexts/LoadingContext";

const { loading, startLoading, stopLoading } = useLoadingState('myOperation');
```

### useAsyncOperation Hook
Async operation with loading state.

```tsx
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

const { loading, execute } = useAsyncOperation({
  successMessage: "Opération réussie!",
  errorMessage: "Erreur lors de l'opération"
});

const handleSubmit = () => {
  execute(async () => {
    // Your async operation
    return await api.submit(data);
  });
};
```

### useFormSubmission Hook
Form submission with loading.

```tsx
import { useFormSubmission } from "@/hooks/useAsyncOperation";

const { loading, submit } = useFormSubmission(
  async (data) => await api.submitForm(data),
  { successMessage: "Formulaire envoyé!" }
);
```

### useFileUpload Hook
File upload with progress.

```tsx
import { useFileUpload } from "@/hooks/useAsyncOperation";

const { loading, progress, upload } = useFileUpload(
  async (file) => await api.uploadFile(file)
);
```

## Migration Guide

### Before (Old System)
```tsx
import { Circles } from "react-loader-spinner";

{loading && (
  <div className="flex justify-center items-center h-64">
    <Circles height="50" width="50" color="#3B82F6" />
  </div>
)}
```

### After (New System)
```tsx
import { FullPageLoading } from "@/components/ui/loading";

{loading && (
  <FullPageLoading message="Chargement..." />
)}
```

## Color System

The loading system uses a consistent color palette:

- **Primary**: Green (#10b981) - Main brand color
- **Secondary**: Blue (#3b82f6) - Secondary actions
- **White**: White (#ffffff) - Dark backgrounds
- **Gray**: Gray (#6b7280) - Neutral states

## Best Practices

1. **Use FullPageLoading** for initial page loads
2. **Use InlineLoading** for content sections
3. **Use ButtonLoading** for form submissions
4. **Use TableLoading** for data tables
5. **Use ProgressLoading** for file uploads
6. **Keep loading messages in French** for consistency
7. **Use appropriate sizes** based on context
8. **Provide meaningful messages** to users

## Examples

### Page Loading
```tsx
if (loading) {
  return (
    <FullPageLoading 
      message="Chargement des données"
      submessage="Veuillez patienter..."
    />
  );
}
```

### Form Submission
```tsx
<ButtonLoading
  loading={isSubmitting}
  loadingText="Envoi en cours..."
  type="submit"
>
  Envoyer le formulaire
</ButtonLoading>
```

### Data Fetching
```tsx
{loading ? (
  <InlineLoading message="Chargement des résultats..." />
) : (
  <DataTable data={data} />
)}
```

### File Upload
```tsx
<ProgressLoading 
  progress={uploadProgress}
  message="Téléchargement du fichier..."
/>
```

This unified system ensures consistent user experience across the entire application while being flexible enough to handle various loading scenarios.
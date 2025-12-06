// Simple analytics tracking for UX improvements
// Tracks user interactions to identify friction points

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: string;
  userId?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userId: string | null = null;

  setUserId(id: string) {
    this.userId = id;
  }

  clearUserId() {
    this.userId = null;
  }

  track(event: string, category: string, label?: string, value?: number) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      label,
      value,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined
    };

    this.events.push(analyticsEvent);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', analyticsEvent);
    }

    // Store in localStorage for later analysis
    this.persistEvent(analyticsEvent);
  }

  private persistEvent(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('medconnect_analytics');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('medconnect_analytics', JSON.stringify(events));
    } catch (error) {
      console.error('Error persisting analytics:', error);
    }
  }

  // Track form errors to identify friction points
  trackFormError(formName: string, fieldName: string, errorType: string) {
    this.track('form_error', 'error', `${formName}_${fieldName}_${errorType}`);
  }

  // Track successful actions
  trackSuccess(action: string) {
    this.track('success', 'conversion', action);
  }

  // Track user navigation
  trackNavigation(from: string, to: string) {
    this.track('navigation', 'user_flow', `${from}_to_${to}`);
  }

  // Track time spent on screen
  trackTimeOnScreen(screenName: string, seconds: number) {
    this.track('time_on_screen', 'engagement', screenName, seconds);
  }

  // Track feature usage
  trackFeatureUse(featureName: string) {
    this.track('feature_use', 'engagement', featureName);
  }

  // Get analytics summary (for debugging)
  getSummary() {
    try {
      const stored = localStorage.getItem('medconnect_analytics');
      if (!stored) return { totalEvents: 0, categories: {} };

      const events = JSON.parse(stored);
      const categories: Record<string, number> = {};

      events.forEach((event: AnalyticsEvent) => {
        categories[event.category] = (categories[event.category] || 0) + 1;
      });

      return {
        totalEvents: events.length,
        categories,
        recentEvents: events.slice(-10)
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return { totalEvents: 0, categories: {} };
    }
  }

  // Clear all analytics data
  clear() {
    this.events = [];
    localStorage.removeItem('medconnect_analytics');
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Helper to track component mount/unmount times
export function useAnalytics(screenName: string) {
  const startTime = Date.now();

  return {
    trackAction: (action: string) => {
      analytics.trackFeatureUse(`${screenName}_${action}`);
    },
    trackError: (field: string, error: string) => {
      analytics.trackFormError(screenName, field, error);
    },
    trackSuccess: (action?: string) => {
      analytics.trackSuccess(`${screenName}_${action || 'success'}`);
    },
    trackExit: () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analytics.trackTimeOnScreen(screenName, timeSpent);
    }
  };
}
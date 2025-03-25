import { useMemo } from "react";
import { Opportunity, CalendarEvent } from "@/context/types";
import { JobRecommendation, StatusChange, RatedRecommendation } from "@/types";

export function useAnalytics(
  opportunities: Opportunity[],
  events: CalendarEvent[],
  statusChanges: StatusChange[]
) {
  // Generate analytics data using useMemo to prevent recalculation on every render
  const analytics = useMemo(() => {
    // Status distribution
    const statusCounts = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get all applications with valid dates and sort them
    const applicationsWithDates = opportunities
      .filter((opp) => opp.appliedDate)
      .map((opp) => {
        try {
          return {
            id: opp.id,
            date: new Date(opp.appliedDate),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((app) => app !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate timeline data for different periods
    const generateTimelineData = (days: number) => {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);

      // Create array of dates for the period
      const datePoints = [];
      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        datePoints.push({
          date: new Date(date),
          count: 0,
          totalCount: 0,
        });
      }

      // Count applications for each date
      let runningTotal = 0;
      datePoints.forEach((point) => {
        // Count applications on this specific date
        const appsOnDate = applicationsWithDates.filter(
          (app) =>
            app.date.getDate() === point.date.getDate() &&
            app.date.getMonth() === point.date.getMonth() &&
            app.date.getFullYear() === point.date.getFullYear()
        );
        point.count = appsOnDate.length;
        runningTotal += point.count;
        point.totalCount = runningTotal;
      });

      return datePoints;
    };

    // Helper function for date difference calculation
    const getDateDifference = (date1: Date, date2: Date): number => {
      return Math.ceil(
        (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
      );
    };

    // Generate data for different time periods
    const timelineData = {
      "7days": generateTimelineData(7),
      "30days": generateTimelineData(30),
      "90days": generateTimelineData(90),
      all:
        applicationsWithDates.length > 0
          ? (() => {
              // For all-time view, use actual application dates
              const firstAppDate = applicationsWithDates[0].date;
              const daysDiff = getDateDifference(new Date(), firstAppDate);
              return generateTimelineData(Math.min(daysDiff, 365)); // Cap at 365 days
            })()
          : [],
    };

    // Response rate
    const responseCount = opportunities.filter((opp) =>
      [
        "Screening",
        "Technical Assessment",
        "First Interview",
        "Second Interview",
        "Final Interview",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
      ].includes(opp.status)
    ).length;
    const responseRate =
      opportunities.length > 0
        ? ((responseCount / opportunities.length) * 100).toFixed(1)
        : "0";

    // Interview conversion rate
    const interviewCount = opportunities.filter((opp) =>
      [
        "First Interview",
        "Second Interview",
        "Final Interview",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
      ].includes(opp.status)
    ).length;
    const interviewRate =
      responseCount > 0
        ? ((interviewCount / responseCount) * 100).toFixed(1)
        : "0";

    // Offer rate
    const offerCount = opportunities.filter((opp) =>
      ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
        opp.status
      )
    ).length;
    const offerRate =
      interviewCount > 0
        ? ((offerCount / interviewCount) * 100).toFixed(1)
        : "0";

    // Weekly application count
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyApplicationCount = opportunities.filter((opp) => {
      const appDate = new Date(opp.appliedDate);
      return appDate >= startOfWeek;
    }).length;

    // Helper function to calculate application streak
    const calculateStreak = (opportunities: Opportunity[]) => {
      const today = new Date();
      let streak = 0;
      // Check the past 30 days for consecutive applications
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - i);
        const hasApplication = opportunities.some((opp) => {
          const appDate = new Date(opp.appliedDate);
          return appDate.toDateString() === checkDate.toDateString();
        });
        if (hasApplication) {
          streak++;
        } else if (streak > 0) {
          // Break on first day with no applications
          break;
        }
      }
      return streak;
    };

    // Job Search Level System
    const calculateJobSearchLevel = (opportunities: Opportunity[]) => {
      const baseScore = opportunities.length * 10;
      const interviewBonus =
        opportunities.filter((opp: Opportunity) =>
          [
            "Screening",
            "Technical Assessment",
            "First Interview",
            "Second Interview",
            "Final Interview",
          ].includes(opp.status)
        ).length * 25;
      const offerBonus =
        opportunities.filter((opp: Opportunity) =>
          ["Offer Received", "Offer Accepted"].includes(opp.status)
        ).length * 100;
      const totalScore = baseScore + interviewBonus + offerBonus;

      // Define levels
      const level = Math.floor(totalScore / 100) + 1;
      const nextLevelScore = level * 100;
      const progress = totalScore % 100;
      return {
        level,
        progress,
        nextLevelScore,
        pointsToNextLevel: nextLevelScore - totalScore,
        totalScore,
      };
    };

    // Achievement System
    const calculateAchievements = (
      opportunities: Opportunity[],
      events: CalendarEvent[]
    ) => {
      return [
        {
          id: "first_application",
          name: "First Steps",
          description: "Submit your first job application",
          icon: "Rocket",
          unlocked: opportunities.length > 0,
          progress: Math.min(opportunities.length, 1),
          total: 1,
        },
        {
          id: "application_milestone",
          name: "Application Sprint",
          description: "Apply to 20 jobs",
          icon: "Send",
          unlocked: opportunities.length >= 20,
          progress: Math.min(opportunities.length, 20),
          total: 20,
        },
        {
          id: "interview_milestone",
          name: "Interview Pro",
          description: "Secure 5 interviews",
          icon: "Users",
          unlocked:
            opportunities.filter((opp: Opportunity) =>
              [
                "First Interview",
                "Second Interview",
                "Final Interview",
              ].includes(opp.status)
            ).length >= 5,
          progress: opportunities.filter((opp: Opportunity) =>
            ["First Interview", "Second Interview", "Final Interview"].includes(
              opp.status
            )
          ).length,
          total: 5,
        },
        {
          id: "offer_milestone",
          name: "Offer Collector",
          description: "Receive 3 job offers",
          icon: "Award",
          unlocked:
            opportunities.filter((opp: Opportunity) =>
              ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
                opp.status
              )
            ).length >= 3,
          progress: opportunities.filter((opp: Opportunity) =>
            ["Offer Received", "Offer Accepted", "Offer Declined"].includes(
              opp.status
            )
          ).length,
          total: 3,
        },
        {
          id: "diverse_applications",
          name: "Explorer",
          description: "Apply to 10 different companies",
          icon: "Globe",
          unlocked:
            new Set(opportunities.map((opp: Opportunity) => opp.company))
              .size >= 10,
          progress: Math.min(
            new Set(opportunities.map((opp: Opportunity) => opp.company)).size,
            10
          ),
          total: 10,
        },
        {
          id: "streak_week",
          name: "Perfect Week",
          description: "Apply to at least one job every day for a week",
          icon: "CalendarIcon2",
          unlocked: calculateStreak(opportunities) >= 7,
          progress: Math.min(calculateStreak(opportunities), 7),
          total: 7,
        },
      ];
    };

    // Weekly Activity Patterns
    const calculateDayOfWeekActivity = (
      opportunities: Opportunity[],
      events: CalendarEvent[]
    ) => {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const activityByDay = daysOfWeek.map((day) => ({ day, count: 0 }));

      // Count applications by day of week
      opportunities.forEach((opp: Opportunity) => {
        try {
          const date = new Date(opp.appliedDate);
          const dayIndex = date.getDay();
          activityByDay[dayIndex].count += 1;
        } catch (e) {
          // Handle invalid dates
        }
      });

      // Count events by day of week
      events.forEach((event: CalendarEvent) => {
        try {
          const date = new Date(event.date);
          const dayIndex = date.getDay();
          activityByDay[dayIndex].count += 1;
        } catch (e) {
          // Handle invalid dates
        }
      });

      // Find most and least active days
      const sortedDays = [...activityByDay].sort((a, b) => b.count - a.count);
      const mostActiveDay = sortedDays[0];
      const leastActiveDay =
        [...activityByDay]
          .filter((day) => day.count > 0)
          .sort((a, b) => a.count - b.count)[0] ||
        sortedDays[sortedDays.length - 1];

      return {
        activityByDay,
        mostActiveDay,
        leastActiveDay,
      };
    };

    // Weekly Challenges
    const generateWeeklyChallenges = () => {
      // Get current week number
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        (getDateDifference(now, startOfYear) + startOfYear.getDay() + 1) / 7
      );

      // This week's applications
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay());
      const applicationsThisWeek = opportunities.filter((opp: Opportunity) => {
        try {
          const appDate = new Date(opp.appliedDate);
          return appDate >= startOfThisWeek && appDate <= now;
        } catch (e) {
          return false;
        }
      }).length;

      // Generate weekly challenges
      return [
        {
          id: `week_${weekNumber}_1`,
          name: "Application Sprint",
          description: "Apply to 5 jobs this week",
          reward: "50 points",
          icon: "Send",
          target: 5,
          progress: applicationsThisWeek,
          complete: applicationsThisWeek >= 5,
        },
        {
          id: `week_${weekNumber}_2`,
          name: "Quality Applications",
          description: "Write 3 custom cover letters",
          reward: "75 points",
          icon: "FileText",
          target: 3,
          progress: events.filter(
            (event: CalendarEvent) =>
              event.type === "followup" &&
              event.date >= startOfThisWeek.toISOString()
          ).length,
          complete:
            events.filter(
              (event: CalendarEvent) =>
                event.type === "followup" &&
                event.date >= startOfThisWeek.toISOString()
            ).length >= 3,
        },
        {
          id: `week_${weekNumber}_3`,
          name: "Network Builder",
          description: "Attend 1 networking event",
          reward: "100 points",
          icon: "Users",
          target: 1,
          progress: 0,
          complete: false,
        },
      ];
    };

    // Job Search Insights
    const generateJobSearchInsights = (opportunities: Opportunity[]) => {
      const insights: { title: string; description: string; icon: string }[] =
        [];

      // Only generate insights if we have enough data
      if (opportunities.length < 5) {
        return insights;
      }

      // Response rate by company size
      const largeCompanies = opportunities.filter(
        (opp: Opportunity) =>
          opp.company.includes("Inc") ||
          opp.company.includes("Corp") ||
          opp.company.includes("LLC")
      );
      const largeCompanyResponseRate =
        largeCompanies.length > 0
          ? (largeCompanies.filter((opp: Opportunity) =>
              ["Screening", "Technical Assessment", "First Interview"].includes(
                opp.status
              )
            ).length /
              largeCompanies.length) *
            100
          : 0;

      const smallCompanies = opportunities.filter(
        (opp: Opportunity) =>
          !opp.company.includes("Inc") &&
          !opp.company.includes("Corp") &&
          !opp.company.includes("LLC")
      );
      const smallCompanyResponseRate =
        smallCompanies.length > 0
          ? (smallCompanies.filter((opp: Opportunity) =>
              ["Screening", "Technical Assessment", "First Interview"].includes(
                opp.status
              )
            ).length /
              smallCompanies.length) *
            100
          : 0;

      // Add company size insight if there's a significant difference
      if (largeCompanies.length > 3 && smallCompanies.length > 3) {
        if (largeCompanyResponseRate > smallCompanyResponseRate + 10) {
          insights.push({
            title: "Large Companies Favor Your Profile",
            description: `You're getting ${largeCompanyResponseRate.toFixed(
              0
            )}% response rate from larger companies vs ${smallCompanyResponseRate.toFixed(
              0
            )}% from smaller ones. Consider focusing more on established companies.`,
            icon: "Building",
          });
        } else if (smallCompanyResponseRate > largeCompanyResponseRate + 10) {
          insights.push({
            title: "Startups & Small Companies Respond Better",
            description: `You're getting ${smallCompanyResponseRate.toFixed(
              0
            )}% response rate from smaller companies vs ${largeCompanyResponseRate.toFixed(
              0
            )}% from larger ones. Consider targeting more startups and small businesses.`,
            icon: "Home",
          });
        }
      }

      // Application volume insight
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const applicationsLast30Days = opportunities.filter(
        (opp: Opportunity) => {
          try {
            const appDate = new Date(opp.appliedDate);
            return appDate >= last30Days;
          } catch (e) {
            return false;
          }
        }
      ).length;

      // Add application volume insights
      if (applicationsLast30Days < 10) {
        insights.push({
          title: "Increase Your Application Volume",
          description:
            "You've submitted only " +
            applicationsLast30Days +
            " applications in the last 30 days. Consider increasing your application rate to improve your chances.",
          icon: "TrendingUp",
        });
      } else if (applicationsLast30Days > 30) {
        insights.push({
          title: "Strong Application Volume",
          description:
            "You've submitted " +
            applicationsLast30Days +
            " applications in the last 30 days. Your high volume approach increases your chances of finding opportunities.",
          icon: "Award",
        });
      }
      return insights;
    };

    return {
      statusCounts,
      applicationTimeline: timelineData,
      responseRate,
      interviewRate,
      offerRate,
      totalApplications: opportunities.length,
      activeApplications: opportunities.filter(
        (opp) =>
          ![
            "Rejected",
            "Withdrawn",
            "Offer Declined",
            "Position Filled",
            "Position Cancelled",
          ].includes(opp.status)
      ).length,
      weeklyApplicationCount,
      jobSearchStats: calculateJobSearchLevel(opportunities),
      achievements: calculateAchievements(opportunities, events),
      weeklyPatterns: calculateDayOfWeekActivity(opportunities, events),
      weeklyChallenges: generateWeeklyChallenges(),
      jobSearchInsights: generateJobSearchInsights(opportunities),
    };
  }, [opportunities, events, statusChanges]);

  return analytics;
}

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  Briefcase, 
  Edit, 
  Plus, 
  MessageSquare, 
  FileText,
  Clock
} from 'lucide-react';

const ActivityIcon = ({ type }) => {
  const iconMap = {
    'event_created': <Calendar className="h-4 w-4 text-blue-500" />,
    'event_updated': <Calendar className="h-4 w-4 text-orange-500" />,
    'opportunity_created': <Briefcase className="h-4 w-4 text-green-500" />,
    'opportunity_updated': <Briefcase className="h-4 w-4 text-orange-500" />,
    'note_added': <MessageSquare className="h-4 w-4 text-purple-500" />,
    'document_added': <FileText className="h-4 w-4 text-indigo-500" />,
    'status_changed': <Edit className="h-4 w-4 text-yellow-500" />,
    'reminder_set': <Clock className="h-4 w-4 text-red-500" />
  };
  
  return iconMap[type] || <Plus className="h-4 w-4 text-gray-500" />;
};

const RecentActivity = ({ activities = [], limit = 5, showOpportunityInfo = false }) => {
  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, limit);
  
  if (sortedActivities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>No recent activity to display</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-start p-3 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="mr-3 mt-0.5">
            <ActivityIcon type={activity.type} />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium dark:text-gray-200">{activity.description}</p>
            
            {showOpportunityInfo && activity.opportunityId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.opportunityName || 
                 (activity.opportunity ? 
                  `${activity.opportunity.company} - ${activity.opportunity.position}` : 
                  `Opportunity #${activity.opportunityId}`)}
              </p>
            )}
            
            <div className="flex items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
              
              {activity.user && (
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  by {activity.user.name || 'You'}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;

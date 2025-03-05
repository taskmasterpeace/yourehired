import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Determine badge color based on status
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied' || status === 'Application Acknowledged') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview') || status === 'Screening' || status === 'Technical Assessment') {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else if (status === 'Negotiating') {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview')) {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Determine badge color based on status
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied' || status === 'Application Acknowledged') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview') || status === 'Screening' || status === 'Technical Assessment') {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else if (status === 'Negotiating') {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Determine badge color based on status
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied' || status === 'Application Acknowledged') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview') || status === 'Screening' || status === 'Technical Assessment') {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else if (status === 'Negotiating') {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Determine badge color based on status
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied' || status === 'Application Acknowledged') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview') || status === 'Screening' || status === 'Technical Assessment') {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else if (status === 'Negotiating') {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Determine badge color based on status
  const getBadgeClass = () => {
    if (status === 'Offer Received' || status === 'Offer Accepted') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined') {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (status === 'Applied' || status === 'Application Acknowledged') {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    } else if (status.includes('Interview') || status === 'Screening' || status === 'Technical Assessment') {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    } else if (status === 'Negotiating') {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge className={getBadgeClass()}>
      {status}
    </Badge>
  );
};

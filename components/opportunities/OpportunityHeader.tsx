import React from "react";
import { CardHeader } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "../../components/ui/select";
import { Opportunity } from "../../context/types";
import { StatusBadge } from "./StatusBadge";

interface OpportunityHeaderProps {
  opportunity: Opportunity;
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
}

export const OpportunityHeader = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
}: OpportunityHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-end items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="text-base font-medium text-white-600">Status:</div>
          <div className="w-[250px]">
            <Select
              value={opportunity.status}
              onValueChange={(value) => {
                updateOpportunity(opportunity.id, { status: value });
              }}
            >
              <SelectTrigger
                className={`text-base font-medium h-8 ${
                  opportunity.status === "Offer Received" ||
                  opportunity.status === "Offer Accepted"
                    ? "border-green-400 bg-green-50 hover:bg-green-100"
                    : opportunity.status === "Rejected" ||
                      opportunity.status === "Withdrawn"
                    ? "border-red-400 bg-red-50 hover:bg-red-100"
                    : opportunity.status === "Applied"
                    ? "border-blue-400 bg-blue-50 hover:bg-blue-100"
                    : opportunity.status.includes("Interview")
                    ? "border-purple-400 bg-purple-50 hover:bg-purple-100"
                    : "border-gray-400 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <SelectValue placeholder="Select status">
                  <StatusBadge status={opportunity.status} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <SelectGroup>
                  <SelectLabel className="select-category-label font-semibold text-gray-700">
                    Initial Contact
                  </SelectLabel>
                  <SelectItem value="Bookmarked">Bookmarked</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Recruiter Contact">
                    Recruiter Contact
                  </SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="select-category-label font-semibold text-gray-700">
                    Application
                  </SelectLabel>
                  <SelectItem value="Preparing Application">
                    Preparing Application
                  </SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Application Acknowledged">
                    Application Acknowledged
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="select-category-label font-semibold text-gray-700">
                    Interview Process
                  </SelectLabel>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Technical Assessment">
                    Technical Assessment
                  </SelectItem>
                  <SelectItem value="First Interview">
                    First Interview
                  </SelectItem>
                  <SelectItem value="Second Interview">
                    Second Interview
                  </SelectItem>
                  <SelectItem value="Final Interview">
                    Final Interview
                  </SelectItem>
                  <SelectItem value="Reference Check">
                    Reference Check
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="select-category-label font-semibold text-gray-700">
                    Decision
                  </SelectLabel>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Offer Received">Offer Received</SelectItem>
                  <SelectItem value="Offer Accepted">Offer Accepted</SelectItem>
                  <SelectItem value="Offer Declined">Offer Declined</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="Position Filled">
                    Position Filled
                  </SelectItem>
                  <SelectItem value="Position Cancelled">
                    Position Cancelled
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="select-category-label font-semibold text-gray-700">
                    Follow-up
                  </SelectLabel>
                  <SelectItem value="Following Up">Following Up</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
